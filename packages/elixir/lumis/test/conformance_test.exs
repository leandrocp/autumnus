defmodule Lumis.ConformanceTest do
  use ExUnit.Case, async: true
  @moduletag :conformance

  @conformance_dir Path.expand("../../../../fixtures/conformance", __DIR__)

  @fixture_names @conformance_dir
                 |> Path.join("*/fixture.json")
                 |> Path.wildcard()
                 |> Enum.map(&Path.dirname/1)
                 |> Enum.map(&Path.basename/1)
                 |> Enum.sort()

  # The same nine the JavaScript conformance suite declares. Highlighting would
  # load them anyway; naming them keeps this suite comparing formatter output
  # rather than measuring a first load, and matches what the browser has to do,
  # since it cannot load inside the walk.
  setup_all do
    :ok =
      Lumis.Languages.load(~w(
        json html javascript css lua markdown markdown_inline mdx python
      ))

    :ok
  end

  defp load_fixture(name) do
    dir = Path.join(@conformance_dir, name)
    metadata = dir |> Path.join("fixture.json") |> File.read!() |> Jason.decode!()

    Map.merge(metadata, %{
      "source" => File.read!(Path.join(dir, "source.txt")),
      "htmlInline" => File.read!(Path.join(dir, "html-inline.html")),
      "htmlLinked" => File.read!(Path.join(dir, "html-linked.html")),
      "htmlMultiThemes" => File.read!(Path.join(dir, "html-multi-themes.html")),
      "bbcode" => File.read!(Path.join(dir, "bbcode.txt")),
      "terminal" => File.read!(Path.join(dir, "terminal.txt"))
    })
  end

  defp rainbow_brackets(fixture), do: fixture["rainbowBrackets"] || false

  for name <- @fixture_names do
    describe name do
      @tag fixture: name
      test "html_inline" do
        fixture = load_fixture(unquote(name))

        assert Lumis.highlight!(fixture["source"],
                 formatter: {
                   :html_inline,
                   language: fixture["language"],
                   theme: fixture["theme"],
                   rainbow_brackets: rainbow_brackets(fixture)
                 }
               ) == fixture["htmlInline"]
      end

      @tag fixture: name
      test "html_linked" do
        fixture = load_fixture(unquote(name))

        assert Lumis.highlight!(fixture["source"],
                 formatter:
                   {:html_linked,
                    language: fixture["language"], rainbow_brackets: rainbow_brackets(fixture)}
               ) == fixture["htmlLinked"]
      end

      @tag fixture: name
      test "html_multi_themes" do
        fixture = load_fixture(unquote(name))

        assert Lumis.highlight!(fixture["source"],
                 formatter: {
                   :html_multi_themes,
                   language: fixture["language"],
                   themes: [main: fixture["theme"]],
                   default_theme: "main",
                   rainbow_brackets: rainbow_brackets(fixture)
                 }
               ) == fixture["htmlMultiThemes"]
      end

      @tag fixture: name
      test "terminal" do
        fixture = load_fixture(unquote(name))

        assert Lumis.highlight!(fixture["source"],
                 formatter: {
                   :terminal,
                   language: fixture["language"],
                   theme: fixture["theme"],
                   rainbow_brackets: rainbow_brackets(fixture)
                 }
               ) == fixture["terminal"]
      end

      @tag fixture: name
      test "bbcode_scoped" do
        fixture = load_fixture(unquote(name))

        assert Lumis.highlight!(fixture["source"],
                 formatter:
                   {:bbcode_scoped,
                    language: fixture["language"], rainbow_brackets: rainbow_brackets(fixture)}
               ) == fixture["bbcode"]
      end
    end
  end
end
