total_started = System.monotonic_time(:nanosecond)
fixture_started = System.monotonic_time(:nanosecond)

fixture_path =
  System.fetch_env!("BENCH_APPLICATION_FIXTURE")

fixture =
  fixture_path
  |> File.read!()
  |> :json.decode()

languages = Map.fetch!(fixture, "languages")

if length(languages) != 2 do
  raise "application fixture must contain two languages"
end

fixture_ns = System.monotonic_time(:nanosecond) - fixture_started

init_started = System.monotonic_time(:nanosecond)
Code.ensure_loaded!(Lumis.Native)
available_languages = Lumis.available_languages()

for language <- ["javascript", "json"] do
  unless Map.has_key?(available_languages, language) do
    raise "Lumis Elixir is missing #{language}"
  end

  Lumis.highlight!("",
    formatter: {:html_inline, language: language, theme: "github_dark"}
  )
end

init_ns = System.monotonic_time(:nanosecond) - init_started

render_started = System.monotonic_time(:nanosecond)

{input_bytes, output_bytes, snippet_count} =
  Enum.reduce(languages, {0, 0, 0}, fn entry, totals ->
    language = Map.fetch!(entry, "id")

    Enum.reduce(Map.fetch!(entry, "snippets"), totals, fn source,
                                                          {input_bytes, output_bytes,
                                                           snippet_count} ->
      output =
        Lumis.highlight!(source,
          formatter: {:html_inline, language: language, theme: "github_dark"}
        )

      unless String.contains?(output, "<pre") and String.contains?(output, "<span") and
               byte_size(output) > byte_size(source) do
        raise "Lumis Elixir did not produce highlighted HTML for #{language}"
      end

      {
        input_bytes + byte_size(source),
        output_bytes + byte_size(output),
        snippet_count + 1
      }
    end)
  end)

render_ns = System.monotonic_time(:nanosecond) - render_started

if snippet_count != 6 do
  raise "application fixture must contain six snippets"
end

report = %{
  schemaVersion: 1,
  implementation: "lumis-elixir",
  scenario: "application-two-languages-six-snippets",
  languages: ["javascript", "json"],
  snippetCount: snippet_count,
  fixtureNs: fixture_ns,
  importNs: 0,
  initNs: init_ns,
  renderNs: render_ns,
  internalTotalNs: System.monotonic_time(:nanosecond) - total_started,
  inputBytes: input_bytes,
  outputBytes: output_bytes,
  maxRssBytes: :null
}

report
|> :json.encode()
|> IO.puts()
