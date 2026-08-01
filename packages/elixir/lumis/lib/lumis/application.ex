defmodule Lumis.Application do
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    Lumis.Native.configure_store(
      path_env(:data_dir),
      path_env(:wasm_path)
    )

    opts = [strategy: :one_for_one, name: Lumis.Supervisor]
    Supervisor.start_link([], opts)
  end

  defp path_env(key) do
    case Application.get_env(:lumis, key) do
      nil -> nil
      path -> Path.expand(path)
    end
  end
end
