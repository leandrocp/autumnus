defmodule Lumis.ApplicationOnce do
  @languages ["javascript", "json"]

  def run do
    fixture =
      System.fetch_env!("BENCH_APPLICATION_FIXTURE")
      |> File.read!()
      |> :json.decode()

    workload = Map.fetch!(fixture, "languages")

    unless Enum.map(workload, &Map.fetch!(&1, "id")) == @languages do
      raise "application fixture must contain JavaScript and JSON"
    end

    total_started = System.monotonic_time(:nanosecond)
    started = System.monotonic_time(:nanosecond)
    initialize()
    init_ns = elapsed(started)
    started = System.monotonic_time(:nanosecond)
    metadata = render(workload)
    render_ns = elapsed(started)
    total_ns = elapsed(total_started)
    validate!(metadata)

    IO.puts(
      Jason.encode!(%{
        schemaVersion: 1,
        implementation: "lumis-elixir",
        scenario: Map.fetch!(fixture, "scenario"),
        languages: @languages,
        snippetCount: metadata.snippet_count,
        inputBytes: metadata.input_bytes,
        outputBytes: metadata.output_bytes,
        initNs: init_ns,
        renderNs: render_ns,
        totalNs: total_ns,
        loadedLanguageScope: "requested-via-direct-call",
        theme: "github_dark"
      })
    )
  end

  defp initialize do
    Code.ensure_loaded!(Lumis.Native)
    available_languages = Lumis.available_languages()

    Enum.each(@languages, fn language ->
      unless Map.has_key?(available_languages, language) do
        raise "Lumis Elixir is missing #{language}"
      end
    end)
  end

  defp render(workload) do
    Enum.reduce(workload, %{input_bytes: 0, output_bytes: 0, snippet_count: 0}, fn entry,
                                                                                   totals ->
      language = Map.fetch!(entry, "id")

      Enum.reduce(Map.fetch!(entry, "snippets"), totals, fn source, totals ->
        output =
          Lumis.highlight!(source,
            formatter: {:html_inline, language: language, theme: "github_dark"}
          )

        %{
          input_bytes: totals.input_bytes + byte_size(source),
          output_bytes: totals.output_bytes + byte_size(output),
          snippet_count: totals.snippet_count + 1
        }
      end)
    end)
  end

  defp validate!(%{input_bytes: input, output_bytes: output, snippet_count: 6})
       when output > input,
       do: :ok

  defp validate!(metadata), do: raise("invalid Elixir benchmark output: #{inspect(metadata)}")

  defp elapsed(started), do: System.monotonic_time(:nanosecond) - started
end

Lumis.ApplicationOnce.run()
