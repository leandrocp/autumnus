defmodule Lumis.Loader do
  @moduledoc false

  # Runs one operation at a time per key, on this node.
  #
  # Loading a language is idempotent but expensive: fifty requests for the same
  # uncached language would otherwise each download the same parser. The first
  # caller takes the key and the rest queue, by which point the language is
  # usually loaded already and their operation returns immediately.
  #
  # This replaced `:global.trans`, which took the lock across every connected
  # node for a cache that is node-local. Like `:global.trans`, the operation
  # runs in the calling process, so exceptions, exits and `self()` behave as
  # they would without the lock; the server only decides whose turn it is.

  use GenServer, restart: :temporary

  @registry Lumis.Loader.Registry
  @supervisor Lumis.Loader.Supervisor
  @idle_timeout 10_000

  @doc false
  def child_specs do
    [
      {Registry, keys: :unique, name: @registry},
      {DynamicSupervisor, name: @supervisor, strategy: :one_for_one}
    ]
  end

  @doc """
  Run `operation` with no other caller running one for `key` on this node.

  Returns whatever `operation` returns.
  """
  @spec run(term(), (-> result), timeout()) :: result when result: var
  def run(key, operation, timeout \\ :infinity) do
    case acquire(key, timeout) do
      {:ok, pid} ->
        try do
          operation.()
        after
          GenServer.cast(pid, {:release, self()})
        end

      :unavailable ->
        operation.()
    end
  end

  defp acquire(key, timeout) do
    with {:ok, pid} <- claim(key) do
      try do
        :ok = GenServer.call(pid, :acquire, timeout)
        {:ok, pid}
      catch
        # The server may hit its idle timeout between claiming and calling it.
        :exit, {reason, _} when reason in [:noproc, :normal] -> acquire(key, timeout)
      end
    end
  end

  defp claim(key) do
    case DynamicSupervisor.start_child(@supervisor, {__MODULE__, key}) do
      {:ok, pid} -> {:ok, pid}
      {:error, {:already_started, pid}} -> {:ok, pid}
      {:error, _reason} -> :unavailable
    end
  catch
    # The :lumis application may not be started, as in a Mix task that only
    # needed the NIF. There is nothing to serialize on, so the operation still
    # runs; the worst case is a duplicate download.
    :exit, _reason -> :unavailable
  end

  def child_spec(key) do
    %{id: {__MODULE__, key}, start: {__MODULE__, :start_link, [key]}, restart: :temporary}
  end

  def start_link(key) do
    GenServer.start_link(__MODULE__, key, name: {:via, Registry, {@registry, key}})
  end

  @impl GenServer
  def init(_key), do: {:ok, %{holder: nil, waiting: :queue.new()}, @idle_timeout}

  @impl GenServer
  def handle_call(:acquire, {pid, _tag}, %{holder: nil} = state) do
    {:reply, :ok, %{state | holder: {pid, Process.monitor(pid)}}}
  end

  def handle_call(:acquire, from, state) do
    {:noreply, %{state | waiting: :queue.in(from, state.waiting)}}
  end

  @impl GenServer
  def handle_cast({:release, pid}, %{holder: {pid, ref}} = state) do
    Process.demonitor(ref, [:flush])
    {:noreply, grant_next(%{state | holder: nil}), @idle_timeout}
  end

  def handle_cast({:release, _pid}, state), do: {:noreply, state}

  @impl GenServer
  # A caller that dies holding the key must not wedge it.
  def handle_info({:DOWN, ref, :process, pid, _reason}, %{holder: {pid, ref}} = state) do
    {:noreply, grant_next(%{state | holder: nil}), @idle_timeout}
  end

  def handle_info(:timeout, %{holder: nil} = state) do
    if :queue.is_empty(state.waiting), do: {:stop, :normal, state}, else: {:noreply, state}
  end

  def handle_info(_message, state), do: {:noreply, state}

  defp grant_next(state) do
    case :queue.out(state.waiting) do
      {{:value, {pid, _tag} = from}, waiting} ->
        GenServer.reply(from, :ok)
        %{state | holder: {pid, Process.monitor(pid)}, waiting: waiting}

      {:empty, _waiting} ->
        state
    end
  end
end
