defmodule LumisBenchmarks.MixProject do
  use Mix.Project

  def project do
    [
      app: :lumis_benchmarks,
      version: "0.0.0",
      elixir: "~> 1.14",
      start_permanent: Mix.env() == :prod,
      deps: deps()
    ]
  end

  def application do
    [extra_applications: [:logger]]
  end

  defp deps do
    [
      {:lumis, path: "../../packages/elixir/lumis"},
      {:benchee, "~> 1.5"},
      {:benchee_json, "~> 1.0"},
      {:rustler, "~> 0.29", optional: true}
    ]
  end
end
