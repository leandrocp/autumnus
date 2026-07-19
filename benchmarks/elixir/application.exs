defmodule Lumis.ApplicationBenchmark do
  @languages ["javascript", "json"]

  def run do
    fixture_path = System.fetch_env!("BENCH_APPLICATION_FIXTURE")
    output_path = System.fetch_env!("BENCH_OUTPUT")
    metadata_path = System.fetch_env!("BENCH_METADATA_OUTPUT")
    fixture = fixture_path |> File.read!() |> :json.decode()
    workload = Map.fetch!(fixture, "languages")

    unless Enum.map(workload, &Map.fetch!(&1, "id")) == @languages do
      raise "application fixture must contain JavaScript and JSON"
    end

    initialize()
    metadata = render(workload)
    validate!(metadata)

    File.mkdir_p!(Path.dirname(output_path))

    File.write!(
      metadata_path,
      Jason.encode!(%{
        schemaVersion: 2,
        runner: "benchee",
        implementation: "lumis-elixir",
        scenario: Map.fetch!(fixture, "scenario"),
        languages: @languages,
        snippetCount: metadata.snippet_count,
        inputBytes: metadata.input_bytes,
        outputBytes: metadata.output_bytes
      }) <> "\n"
    )

    Benchee.run(
      %{
        "lumis-elixir/init" =>
          {fn -> initialize() end,
           after_each: fn result ->
             unless result == :ok, do: raise("Elixir initialization failed")
           end},
        "lumis-elixir/render" => {fn -> render(workload) end, after_each: &validate!/1},
        "lumis-elixir/total" =>
          {fn ->
             initialize()
             render(workload)
           end, after_each: &validate!/1}
      },
      warmup: duration("BENCH_WARMUP_SECONDS", 1.0),
      time: duration("BENCH_TIME_SECONDS", 2.0),
      memory_time: 0,
      parallel: 1,
      formatters: [{Benchee.Formatters.JSON, file: output_path}],
      print: [benchmarking: false, configuration: false, fast_warning: false]
    )
  end

  defp initialize do
    Code.ensure_loaded!(Lumis.Native)
    available_languages = Lumis.available_languages()

    for language <- @languages do
      unless Map.has_key?(available_languages, language) do
        raise "Lumis Elixir is missing #{language}"
      end

      Lumis.highlight!("",
        formatter: {:html_inline, language: language, theme: "github_dark"}
      )
    end

    :ok
  end

  defp render(workload) do
    {input_bytes, output_bytes, snippet_count} =
      Enum.reduce(workload, {0, 0, 0}, fn entry, totals ->
        language = Map.fetch!(entry, "id")

        Enum.reduce(
          Map.fetch!(entry, "snippets"),
          totals,
          fn source, {input_bytes, output_bytes, snippet_count} ->
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
          end
        )
      end)

    %{input_bytes: input_bytes, output_bytes: output_bytes, snippet_count: snippet_count}
  end

  defp validate!(%{input_bytes: input_bytes, output_bytes: output_bytes, snippet_count: 6})
       when output_bytes > input_bytes,
       do: :ok

  defp validate!(metadata), do: raise("invalid Elixir benchmark output: #{inspect(metadata)}")

  defp duration(name, default) do
    case System.get_env(name) do
      nil ->
        default

      value ->
        case Float.parse(value) do
          {duration, ""} -> duration
          :error -> String.to_integer(value) * 1.0
        end
    end
  end
end

Lumis.ApplicationBenchmark.run()
