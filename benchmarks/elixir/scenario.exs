defmodule Lumis.ScenarioBenchmark do
  def run do
    scenario_id = System.fetch_env!("BENCH_SCENARIO")
    output_path = System.fetch_env!("BENCH_OUTPUT")
    metadata_path = System.fetch_env!("BENCH_METADATA_OUTPUT")
    repo_dir = Path.expand("../..", __DIR__)

    scenario =
      repo_dir
      |> Path.join("target/benchmarks/fixtures/scenarios.json")
      |> File.read!()
      |> :json.decode()
      |> Map.fetch!("scenarios")
      |> Enum.find(&(Map.fetch!(&1, "id") == scenario_id))

    if is_nil(scenario), do: raise("unknown benchmark scenario: #{scenario_id}")

    workload =
      Enum.map(Map.fetch!(scenario, "files"), fn file ->
        Map.put(file, "source", File.read!(Path.join(repo_dir, Map.fetch!(file, "path"))))
      end)

    unless Enum.sum(Enum.map(workload, &byte_size(Map.fetch!(&1, "source")))) ==
             Map.fetch!(scenario, "inputBytes") do
      raise "#{scenario_id} input bytes changed after fixture verification"
    end

    initialize(workload)
    output_bytes = render(workload, true)

    File.mkdir_p!(Path.dirname(output_path))

    File.write!(
      metadata_path,
      Jason.encode!(%{
        schemaVersion: 1,
        runner: "benchee",
        implementation: "lumis-elixir",
        scenario: scenario_id,
        inputBytes: Map.fetch!(scenario, "inputBytes"),
        outputBytes: output_bytes,
        fileCount: Map.fetch!(scenario, "fileCount"),
        languageCount: Map.fetch!(scenario, "languageCount")
      }) <> "\n"
    )

    Benchee.run(
      %{
        "lumis-elixir/total" =>
          {fn ->
             initialize(workload)
             render(workload)
           end,
           after_each: fn bytes ->
             if bytes <= Map.fetch!(scenario, "inputBytes"),
               do: raise("Lumis Elixir did not expand #{scenario_id}")
           end}
      },
      warmup: duration("BENCH_WARMUP_SECONDS", 0.5),
      time: benchmark_time(scenario_id),
      memory_time: 0,
      parallel: 1,
      formatters: [{Benchee.Formatters.JSON, file: output_path}],
      print: [benchmarking: false, configuration: false, fast_warning: false]
    )
  end

  defp initialize(workload) do
    Code.ensure_loaded!(Lumis.Native)
    available = Lumis.available_languages()

    workload
    |> Enum.map(&Map.fetch!(&1, "language"))
    |> Enum.uniq()
    |> Enum.each(fn language ->
      unless Map.has_key?(available, language), do: raise("Lumis Elixir is missing #{language}")
    end)
  end

  defp render(workload, validate_html \\ false) do
    Enum.reduce(workload, 0, fn file, output_bytes ->
      source = Map.fetch!(file, "source")
      language = Map.fetch!(file, "language")

      output =
        Lumis.highlight!(source,
          formatter: {:html_inline, language: language, theme: "github_dark"}
        )

      if validate_html and
           not (String.contains?(output, "<pre") and String.contains?(output, "<span") and
                  byte_size(output) > byte_size(source)) do
        raise "Lumis Elixir did not produce highlighted HTML for #{language}"
      end

      output_bytes + byte_size(output)
    end)
  end

  defp duration(name, default) do
    case System.get_env(name) do
      nil ->
        default

      value ->
        case Float.parse(value) do
          {duration, ""} when duration > 0 -> duration
          _ -> raise "#{name} must be a positive number"
        end
    end
  end

  defp benchmark_time("large-one-language") do
    duration("BENCH_LARGE_TIME_SECONDS", 60.0)
  end

  defp benchmark_time(_scenario_id) do
    duration("BENCH_TIME_SECONDS", 1.0)
  end
end

Lumis.ScenarioBenchmark.run()
