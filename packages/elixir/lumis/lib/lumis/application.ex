defmodule Lumis.Application do
  @moduledoc false

  use Application

  @impl Application
  def start(_type, _args) do
    Supervisor.start_link(Lumis.Loader.child_specs(),
      strategy: :one_for_one,
      name: Lumis.Supervisor
    )
  end
end
