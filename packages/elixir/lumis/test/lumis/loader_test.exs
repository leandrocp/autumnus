defmodule Lumis.LoaderTest do
  use ExUnit.Case, async: false

  alias Lumis.Loader

  test "runs one operation at a time per key" do
    test_process = self()

    operation = fn ->
      send(test_process, {:entered, self()})
      receive do: (:release -> :ok)
    end

    first = Task.async(fn -> Loader.run({:test, :same}, operation) end)
    assert_receive {:entered, first_process}

    second = Task.async(fn -> Loader.run({:test, :same}, operation) end)
    refute_receive {:entered, _}, 100

    send(first_process, :release)
    assert_receive {:entered, second_process}
    send(second_process, :release)

    assert Task.await(first) == :ok
    assert Task.await(second) == :ok
  end

  test "different keys do not wait on each other" do
    test_process = self()

    hold = fn ->
      send(test_process, {:entered, self()})
      receive do: (:release -> :ok)
    end

    blocked = Task.async(fn -> Loader.run({:test, :one}, hold) end)
    assert_receive {:entered, blocked_process}

    assert Loader.run({:test, :two}, fn -> :free end) == :free

    send(blocked_process, :release)
    assert Task.await(blocked) == :ok
  end

  test "returns whatever the operation returns, including errors" do
    assert Loader.run({:test, :value}, fn -> {:error, "nope"} end) == {:error, "nope"}
  end

  test "an exception reaches the caller and does not wedge the key" do
    assert_raise RuntimeError, fn -> Loader.run({:test, :raising}, fn -> raise "boom" end) end
    assert Loader.run({:test, :raising}, fn -> :recovered end) == :recovered
  end

  test "a caller that dies holding the key releases it" do
    test_process = self()

    dying =
      spawn(fn ->
        Loader.run({:test, :dying}, fn ->
          send(test_process, :holding)
          Process.sleep(:infinity)
        end)
      end)

    assert_receive :holding
    Process.exit(dying, :kill)

    assert Loader.run({:test, :dying}, fn -> :released end, 2_000) == :released
  end

  test "runs the operation even with no supervision tree" do
    :ok = Supervisor.terminate_child(Lumis.Supervisor, Lumis.Loader.Supervisor)
    on_exit(fn -> Supervisor.restart_child(Lumis.Supervisor, Lumis.Loader.Supervisor) end)

    assert Loader.run({:test, :unsupervised}, fn -> :ran end) == :ran

    {:ok, _} = Supervisor.restart_child(Lumis.Supervisor, Lumis.Loader.Supervisor)
  end

  test "the operation runs in the calling process" do
    assert Loader.run({:test, :caller}, fn -> self() end) == self()
  end

  test "survives the server stopping between claiming it and calling it" do
    # The idle timeout can fire in that window, which must retry rather than exit.
    assert Loader.run({:test, :restart}, fn -> :first end) == :first
    [{pid, _}] = Registry.lookup(Lumis.Loader.Registry, {:test, :restart})
    ref = Process.monitor(pid)
    GenServer.stop(pid, :normal)
    assert_receive {:DOWN, ^ref, :process, ^pid, _}

    assert Loader.run({:test, :restart}, fn -> :second end) == :second
  end
end
