defmodule Lumis.HighlightOptionsTest do
  @moduledoc """
  Elixir's half of the cross-runtime highlight option check, and the behaviour
  of `:on_unresolved`.

  `fixtures/highlight-options.json` lists the per-call options every runtime
  must accept. The options `highlight_events/3` takes are the keys of
  `t:Lumis.highlight_events_options/0`, so this reads them off the typespec
  rather than naming them again.
  """
  use ExUnit.Case, async: true

  defmodule SourceFormatter do
    @behaviour Lumis.Formatter

    @impl true
    def render(source, _events, _options), do: source
  end

  @manifest_path Path.expand("../../../../fixtures/highlight-options.json", __DIR__)
  @external_resource @manifest_path

  defp manifest, do: @manifest_path |> File.read!() |> Jason.decode!()

  defp accepted_options do
    {:ok, types} = Code.Typespec.fetch_types(Lumis)

    {:highlight_events_options, {:type, _, :list, [{:type, _, :union, pairs}]}, []} =
      Enum.find_value(types, fn {:type, {name, _, _} = type} ->
        name == :highlight_events_options && type
      end)

    options = for {:type, _, :tuple, [{:atom, _, name}, _]} <- pairs, do: Atom.to_string(name)
    assert length(options) > 3, "found almost no options: #{inspect(options)}"
    Enum.sort(options)
  end

  test "accepts exactly the options in the manifest" do
    manifest = manifest()

    runtime_only =
      manifest |> Map.fetch!("runtime_only") |> Map.get("elixir", %{}) |> Map.keys()

    expected = Enum.map(Map.fetch!(manifest, "options"), & &1["name"]) ++ runtime_only

    assert accepted_options() == Enum.sort(expected)
  end

  test "no waiver outlives its reason" do
    waivers = manifest() |> Map.fetch!("waived") |> Map.keys() |> Enum.reject(&(&1 =~ ~r/^\$/))

    assert waivers == []
  end

  describe ":on_unresolved" do
    # The suite's staged parsers do not include go, so neither block loads.
    @source "```golang\nx := 1\n```\n\n```go\ny := 2\n```\n"

    test "highlight_events/3 reports each language once, by catalog id" do
      test = self()
      report = fn language -> send(test, {:unresolved, language}) end

      assert {:ok, _events} = Lumis.highlight_events(@source, "markdown", on_unresolved: report)
      assert_received {:unresolved, "go"}
      refute_received {:unresolved, _}
    end

    test "highlight/2 reports through built-in and custom formatters" do
      test = self()
      report = fn language -> send(test, {:unresolved, language}) end

      for formatter <- [:html_linked, SourceFormatter] do
        assert {:ok, _} =
                 Lumis.highlight(@source,
                   formatter: {formatter, language: "markdown"},
                   on_unresolved: report
                 )

        assert_received {:unresolved, "go"}
        refute_received {:unresolved, _}
      end
    end

    test "reports nothing when every injected language loads" do
      test = self()
      report = fn language -> send(test, {:unresolved, language}) end

      assert {:ok, _} =
               Lumis.highlight_events("```python\nx = 1\n```\n", "markdown",
                 on_unresolved: report
               )

      refute_received {:unresolved, _}
    end
  end
end
