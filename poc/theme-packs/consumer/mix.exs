defmodule ThemePacksPoC.MixProject do
  use Mix.Project

  def project do
    [app: :theme_packs_poc, version: "0.0.0", deps: deps()]
  end

  def application, do: [extra_applications: [:logger]]

  defp deps do
    base = [
      {:mdex, path: "../mdex"},
      {:mdex_native, path: "../mdex_native", override: true},
      {:lumis_wasm_rust, "~> 0.26.0"}
    ]

    case Mix.env() do
      :default ->
        base

      :copyleft ->
        base ++ [{:lumis_themes_copyleft, path: "../themes-copyleft"}]

      :both_default ->
        base ++ [{:lumis, path: "../lumis/packages/elixir/lumis"}]

      :both ->
        base ++
          [
            {:lumis_themes_copyleft, path: "../themes-copyleft"},
            {:lumis, path: "../lumis/packages/elixir/lumis"}
          ]
    end
  end
end
