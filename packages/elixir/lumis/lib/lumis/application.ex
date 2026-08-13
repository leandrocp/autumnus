defmodule Lumis.Application do
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    Lumis.Native.configure_store(data_dir())

    opts = [strategy: :one_for_one, name: Lumis.Supervisor]
    Supervisor.start_link([], opts)
  end

  # `nil` hands the decision back to the NIF, which reads `LUMIS_DATA_DIR` and
  # then falls back to the user data directory. Elixir only has to answer for
  # the case neither of those covers.
  defp data_dir do
    cond do
      path = Application.get_env(:lumis, :data_dir) -> Path.expand(path)
      System.get_env("LUMIS_DATA_DIR") -> nil
      true -> priv_dir()
    end
  end

  # Keep the zero-configuration cache inside the application. Releases that use
  # a read-only filesystem or need persistence across deployments configure an
  # absolute writable `:data_dir` instead.
  defp priv_dir do
    case :code.priv_dir(:lumis) do
      {:error, _} -> nil
      priv -> Path.join(List.to_string(priv), "lumis")
    end
  end
end
