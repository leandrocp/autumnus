defmodule Lumis.ConformanceTest do
  use ExUnit.Case, async: true

  @conformance_dir Path.expand("../../../../fixtures/conformance", __DIR__)

  @fixture_names @conformance_dir
                 |> Path.join("*/fixture.json")
                 |> Path.wildcard()
                 |> Enum.map(&Path.dirname/1)
                 |> Enum.map(&Path.basename/1)
                 |> Enum.sort()

  defp load_fixture(name) do
    dir = Path.join(@conformance_dir, name)
    metadata = dir |> Path.join("fixture.json") |> File.read!() |> Jason.decode!()

    Map.merge(metadata, %{
      "source" => File.read!(Path.join(dir, "source.txt")),
      "htmlInline" => File.read!(Path.join(dir, "html-inline.html")),
      "htmlLinked" => File.read!(Path.join(dir, "html-linked.html")),
      "htmlMultiThemes" => File.read!(Path.join(dir, "html-multi-themes.html")),
      "terminal" => File.read!(Path.join(dir, "terminal.txt"))
    })
  end

  for name <- @fixture_names do
    describe name do
      @tag fixture: name
      test "html_inline" do
        fixture = load_fixture(unquote(name))

        assert Lumis.highlight!(fixture["source"],
                 language: fixture["language"],
                 formatter: {:html_inline, theme: fixture["theme"]}
               ) == fixture["htmlInline"]
      end

      @tag fixture: name
      test "html_linked" do
        fixture = load_fixture(unquote(name))

        assert Lumis.highlight!(fixture["source"],
                 language: fixture["language"],
                 formatter: :html_linked
               ) == fixture["htmlLinked"]
      end

      @tag fixture: name
      test "html_multi_themes" do
        fixture = load_fixture(unquote(name))

        assert Lumis.highlight!(fixture["source"],
                 language: fixture["language"],
                 formatter:
                   {:html_multi_themes, themes: [main: fixture["theme"]], default_theme: "main"}
               ) == fixture["htmlMultiThemes"]
      end

      @tag fixture: name
      test "terminal" do
        fixture = load_fixture(unquote(name))

        assert Lumis.highlight!(fixture["source"],
                 language: fixture["language"],
                 formatter: {:terminal, theme: fixture["theme"]}
               ) == fixture["terminal"]
      end
    end
  end
end
