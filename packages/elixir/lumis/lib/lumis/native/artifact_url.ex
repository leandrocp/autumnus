defmodule Lumis.Native.ArtifactURL do
  @moduledoc false

  mix_config = Mix.Project.config()
  version = mix_config[:version]
  github_url = mix_config[:package][:links][:GitHub]

  @base_urls %{
    github: "#{github_url}/releases/download/hex-lumis/v#{version}",
    cloudflare: "https://artifacts.lumis.sh/releases/download/hex-lumis/v#{version}"
  }

  @sources Map.keys(@base_urls)

  env_source =
    case System.get_env("LUMIS_ARTIFACT_SOURCE") do
      empty when empty in [nil, ""] -> :github
      name -> Enum.find(@sources, name, &(Atom.to_string(&1) == name))
    end

  @source Application.compile_env(:lumis, :artifact_source, env_source)

  if @source not in @sources do
    raise ArgumentError,
          "invalid Lumis artifact source: #{inspect(@source)}. Expected one of #{inspect(@sources)}"
  end

  def url(file_name), do: url(file_name, @source)

  def url(file_name, source) when source in @sources do
    "#{Map.fetch!(@base_urls, source)}/#{file_name}"
  end
end
