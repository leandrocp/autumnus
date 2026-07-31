defmodule Lumis.Application do
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    opts = [strategy: :one_for_one, name: Lumis.Supervisor]
    Supervisor.start_link(Lumis.Loader.child_specs(), opts)
  end
end
