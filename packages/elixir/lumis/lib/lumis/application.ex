defmodule Lumis.Application do
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    Lumis.Native.configure_store(data_dir())

    opts = [strategy: :one_for_one, name: Lumis.Supervisor]
    Supervisor.start_link([], opts)
  end

  # `mix release` copies each application's `priv/` into the release and the
  # usual Dockerfile copies the release wholesale, so parsers staged here at
  # build time reach production with nothing to configure and no extra COPY.
  # `LUMIS_DATA_DIR` still wins when it is set, which is how a deployment shares
  # one directory across nodes.
  defp data_dir do
    case Application.get_env(:lumis, :data_dir) do
      nil -> if System.get_env("LUMIS_DATA_DIR"), do: nil, else: default_data_dir()
      path -> Path.expand(path)
    end
  end

  defp default_data_dir do
    case :code.priv_dir(:lumis) do
      {:error, _} -> nil
      priv -> Path.join(List.to_string(priv), "lumis")
    end
  end
end
