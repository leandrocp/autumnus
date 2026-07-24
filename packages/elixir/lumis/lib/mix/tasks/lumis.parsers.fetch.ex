defmodule Mix.Tasks.Lumis.Parsers.Fetch do
  use Mix.Task

  @shortdoc "Fetches exact Lumis parser WASMs for an OTP release"

  @switches [all: :boolean, force: :boolean, output: :string]
  @aliases [o: :output]

  @impl Mix.Task
  def run(arguments) do
    {options, languages, invalid} =
      OptionParser.parse(arguments, strict: @switches, aliases: @aliases)

    if invalid != [] do
      Mix.raise("invalid options: #{inspect(invalid)}")
    end

    selected =
      cond do
        options[:all] && languages != [] ->
          Mix.raise("pass language names or --all, not both")

        options[:all] ->
          Enum.map(Lumis.Generated.LanguageManifest.all(), & &1.id)

        languages != [] ->
          languages

        true ->
          Application.get_env(:lumis, :bundled_languages, [])
      end

    if selected == [] do
      Mix.raise("pass language names, --all, or configure :lumis, :bundled_languages")
    end

    prefetch_options =
      []
      |> maybe_put(:directory, options[:output])
      |> Keyword.put(:force, options[:force] || false)

    case Lumis.LanguageLoader.prefetch(selected, prefetch_options) do
      {:ok, paths} ->
        Enum.each(paths, fn path -> Mix.shell().info(path) end)

      {:error, reason} ->
        Mix.raise(reason)
    end
  end

  defp maybe_put(options, _key, nil), do: options
  defp maybe_put(options, key, value), do: Keyword.put(options, key, value)
end
