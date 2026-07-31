defmodule Mix.Tasks.Lumis.Languages.Cache do
  @moduledoc """
  Caches exact, integrity-checked Lumis parser WASMs for an OTP release.

  Which languages to cache comes from configuration, so a release and a
  development machine cannot disagree:

      config :lumis, bundled_languages: ~w(elixir html javascript css)

  Use `:all` to cache every language in the catalog:

      config :lumis, bundled_languages: :all

  This task only fetches what that configuration names. It takes no language
  arguments, so there is one place to look when a release ships the wrong set.

      mix lumis.languages.cache
      mix lumis.languages.cache --force
      mix lumis.languages.cache --output priv/wasm

  Parsers are verified against the size and SHA-256 in their language package
  before being written, and an existing valid file is left alone unless
  `--force` is given.
  """

  use Mix.Task

  @shortdoc "Caches exact Lumis parser WASMs for an OTP release"

  @switches [force: :boolean, output: :string]
  @aliases [o: :output]

  @impl Mix.Task
  def run(arguments) do
    Mix.Task.run("app.start")
    options = parse_arguments(arguments)

    options
    |> cache_options()
    |> cache(configured_languages())
  end

  defp parse_arguments(arguments) do
    case OptionParser.parse(arguments, strict: @switches, aliases: @aliases) do
      {options, [], []} ->
        options

      {_options, [_ | _] = languages, _} ->
        Mix.raise("""
        this task takes no language arguments, it caches what is configured:

            config :lumis, bundled_languages: #{inspect(languages)}
        """)

      {_options, _languages, invalid} ->
        Mix.raise("invalid options: #{inspect(invalid)}")
    end
  end

  defp configured_languages do
    case Application.get_env(:lumis, :bundled_languages) do
      :all -> Enum.map(Lumis.Native.language_package_refs(), & &1.id)
      [_ | _] = languages -> Enum.map(languages, &to_string/1)
      _ -> Mix.raise("configure :lumis, :bundled_languages with a list of languages or :all")
    end
  end

  defp cache_options(options) do
    [force: options[:force] || false]
    |> maybe_put(:directory, options[:output])
  end

  defp cache(cache_options, languages) do
    case Lumis.Languages.cache(languages, cache_options) do
      {:ok, paths} -> Enum.each(paths, fn path -> Mix.shell().info(path) end)
      {:error, reason} -> Mix.raise(reason)
    end
  end

  defp maybe_put(options, _key, nil), do: options
  defp maybe_put(options, key, value), do: Keyword.put(options, key, value)
end
