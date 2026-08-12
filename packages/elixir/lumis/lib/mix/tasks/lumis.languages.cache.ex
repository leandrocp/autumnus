defmodule Mix.Tasks.Lumis.Languages.Cache do
  @moduledoc """
  Downloads exact, integrity-checked Lumis parser WASMs ahead of time.

  Highlighting downloads what it needs on demand, so the first request for a
  language pays for it. This moves that cost to build time: both the download
  and the Wasmtime compile that follows it, which is the larger half. A host
  with no network at all is then a side effect rather than the point.

      mix lumis.languages.cache elixir html javascript css
      mix lumis.languages.cache bundle_web
      mix lumis.languages.cache --all
      mix lumis.languages.cache --force elixir
      mix lumis.languages.cache --verbose bundle_web

  Parsers land under `$LUMIS_DATA_DIR`, or wherever `config :lumis, data_dir:`
  points, and are verified against the size and SHA-256 in their language
  package before being written. An existing valid file is left alone unless
  `--force` is given; forcing also resolves the compatible package range again.

  A directory written here is complete: point `LUMIS_DATA_DIR` at it, or set
  `config :lumis, data_dir:`, and nothing needs the network. It expects the
  directory holding `parsers/`, not `parsers/` itself.

  Each parser is also compiled once, so Wasmtime writes its compiled form beside
  it and the first request pays neither the download nor the compile.

  Downloads and compiles both run concurrently, which is what makes a large
  bundle finish in a reasonable time. Every language is attempted, so one
  unpublished parser is reported alongside the rest rather than ending the run.

  ## Options

    * `--all` — every language in the catalog
    * `--force` — resolve the compatible package range again and replace
      parsers already cached
    * `--verbose` — show each language's source, destination, and timings;
      otherwise only a summary is printed
  """

  use Mix.Task

  @shortdoc "Downloads Lumis parser WASMs ahead of time"

  @switches [all: :boolean, force: :boolean, verbose: :boolean]

  @impl Mix.Task
  def run(arguments) do
    Mix.Task.run("app.start")
    {options, languages} = parse_arguments(arguments)

    # Expanded once here rather than separately inside each step, so downloading
    # and compiling cover exactly the same set, and an unknown bundle fails
    # before anything is fetched.
    names = options |> languages(languages) |> expand!()

    if options[:verbose] do
      verbose(names, options)
    else
      download(names, options)
      compile(names)
    end
  end

  defp verbose(names, options) do
    cached =
      case Lumis.Languages.__cache_details__(names, force: options[:force] || false) do
        {:ok, details} -> Map.new(details)
        {:error, reason} -> Mix.raise("could not cache: " <> format_reason(reason))
      end

    compiled =
      case Lumis.Languages.__precompile_details__(names) do
        {:ok, details} -> Map.new(details)
        {:error, reason} -> Mix.raise("could not compile: " <> format_reason(reason))
      end

    Enum.each(names, fn name ->
      {download_url, path, cache_elapsed} = Map.fetch!(cached, name)
      Mix.shell().info("--> #{name}")
      if download_url, do: Mix.shell().info("downloading from #{download_url}")
      Mix.shell().info("downloaded to #{display_path(path)}")
      Mix.shell().info("cached in #{seconds(cache_elapsed)}s")
      Mix.shell().info("compiled in #{seconds(Map.fetch!(compiled, name))}s")
    end)
  end

  # Counted in parsers rather than languages because a handful of languages share
  # one grammar, so the two numbers differ and the file count is what landed on
  # disk. `compile/1` reports languages, which is what the caller named.
  defp download(names, options) do
    case timed(fn -> Lumis.Languages.cache(names, force: options[:force] || false) end) do
      {{:ok, paths}, elapsed} ->
        Mix.shell().info("cached #{length(paths)} parser(s) in #{elapsed}s")

      {{:error, reason}, _elapsed} ->
        Mix.raise("could not cache: " <> format_reason(reason))
    end
  end

  # Downloading is only half the first-request cost: Wasmtime still compiles each
  # parser to native code, which is the larger half. Validating each one through
  # a disposable Tree-sitter store also catches failures that compilation alone
  # cannot, without retaining a full catalog in one store.
  defp compile(names) do
    case timed(fn -> Lumis.Languages.__precompile__(names) end) do
      {{:ok, compiled}, elapsed} ->
        Mix.shell().info("compiled #{length(compiled)} language(s) in #{elapsed}s")

      {{:error, failures}, _elapsed} when is_map(failures) ->
        Mix.raise("could not compile: " <> format_reason(failures))

      {{:error, reason}, _elapsed} ->
        Mix.raise("could not compile: " <> format_reason(reason))
    end
  end

  defp timed(fun) do
    {microseconds, result} = :timer.tc(fun)
    {result, seconds(microseconds / 1_000_000)}
  end

  defp seconds(value), do: :erlang.float_to_binary(value, decimals: 3)

  defp display_path(path) do
    expanded = Path.expand(path)
    relative = Path.relative_to(expanded, File.cwd!())

    if relative == expanded or relative == ".." or String.starts_with?(relative, "../") do
      path
    else
      relative
    end
  end

  defp expand!(names) do
    case Lumis.Languages.expand_bundles(names) do
      {:ok, expanded} -> expanded
      {:error, reason} -> Mix.raise(format_reason(reason))
    end
  end

  defp format_reason({:unknown_bundle, name}), do: "unknown bundle #{inspect(name)}"
  defp format_reason(reason) when is_binary(reason), do: reason

  defp format_reason(failures) when is_map(failures) do
    failures
    |> Enum.sort()
    |> Enum.map_join(", ", fn {name, reason} -> "#{name} (#{reason})" end)
  end

  defp format_reason(reason), do: inspect(reason)

  defp parse_arguments(arguments) do
    case OptionParser.parse(arguments, strict: @switches) do
      {options, languages, []} -> {options, languages}
      {_options, _languages, invalid} -> Mix.raise("invalid options: #{inspect(invalid)}")
    end
  end

  defp languages(options, []) do
    if options[:all] do
      Lumis.available_languages() |> Enum.map(& &1.id) |> Enum.sort()
    else
      Mix.raise("name the languages to cache, a bundle such as bundle_web, or pass --all")
    end
  end

  defp languages(options, languages) do
    if options[:all] do
      Mix.raise("pass language names or --all, not both")
    else
      languages
    end
  end
end
