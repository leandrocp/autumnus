defmodule Lumis.Languages do
  @moduledoc """
  Loads and caches Tree-sitter parsers.

  A language is a parser WASM plus the queries that drive highlighting, released
  together as a `@lumis-sh/wasm-*` package with its size and SHA-256. Nothing
  here needs calling for normal use: `Lumis.highlight/2` loads what a document
  needs on demand.

  Reach for it in two situations.

  Load ahead of the first request, so latency does not land on a user:

      :ok = Lumis.Languages.load(["elixir", "html"])

  Or cache parsers at build time, for a release that must run without network
  access. `mix lumis.languages.cache` is the usual entry point and reads
  `config :lumis, :bundled_languages`.

  ## Where parsers come from

  Each is taken from the first place that has it: `$LUMIS_WASM_PATH/parsers`,
  release-local `priv/wasm`, the user cache directory, then the CDN. Concurrent
  requests for the same uncached language wait for the first rather than each
  downloading it. Bytes are checked against the
  size and digest their package declares before use, and anything that fails is
  discarded rather than trusted, so a corrupted cache repairs itself.

  ## Configuration

    * `:bundled_languages` — languages `mix lumis.languages.cache` should fetch,
      a list or `:all`
    * `:wasm_resolver` and `:language_package_resolver` — replace where parsers
      and package metadata are fetched from
  """

  alias Lumis.Native

  @package_ttl_seconds 3_600
  @plaintext_names ~w(plaintext text txt plain)

  @doc """
  Loads one language, a list of them, or `:all`, verifying each parser first.

  Nothing is ever loaded implicitly: a language that is not loaded is not
  highlighted, and an injected one that is not loaded is left as plain text. Load
  what a document can contain, including its injected languages.

  Already-loaded languages return immediately, so this is safe to call on every
  request or at startup. Loading stops at the first failure and returns it.

      :ok = Lumis.Languages.load("elixir")
      :ok = Lumis.Languages.load(["elixir", :html])
      :ok = Lumis.Languages.load(:all)

  `:all` fetches every language in the catalog, which is rarely what a
  deployment wants; prefer naming them, or `config :lumis, :bundled_languages`.
  """
  @spec load(:all | String.t() | atom() | [String.t() | atom()]) :: :ok | {:error, term()}
  def load(:all), do: load(Enum.map(Native.language_package_refs(), & &1.id))

  def load(names) when is_list(names) do
    Enum.reduce_while(names, :ok, fn name, :ok ->
      case load(name) do
        :ok -> {:cont, :ok}
        {:error, reason} -> {:halt, {:error, reason}}
      end
    end)
  end

  def load(name) when is_atom(name), do: load(Atom.to_string(name))

  def load(name) when is_binary(name) and name in @plaintext_names, do: :ok

  def load(name) when is_binary(name) do
    with {:ok, entry, package_json} <- language_entry(name, false) do
      load_entry(entry, package_json)
    end
    |> case do
      :ok -> :ok
      {:error, reason} -> {:error, "could not load language #{inspect(name)}: #{reason}"}
    end
  end

  @doc false

  def cache(names, options \\ []) when is_list(names) and is_list(options) do
    directory = Keyword.get(options, :directory, bundled_dir())
    force? = Keyword.get(options, :force, false)

    result =
      Enum.reduce_while(names, {:ok, [], MapSet.new()}, fn name, {:ok, paths, seen} ->
        cache_name(to_string(name), paths, seen, directory, force?)
      end)

    case result do
      {:error, reason} -> {:error, reason}
      {:ok, paths, _seen} -> {:ok, Enum.reverse(paths)}
    end
  end

  defp language_entry(name, force?) do
    case Native.language_package_ref(name) do
      nil ->
        {:error, "unknown language '#{name}'"}

      handle ->
        with {:ok, package_json} <- package_json(handle, force?),
             {:ok, entry} <- Native.resolve_language_package(handle.id, package_json) do
          {:ok, entry, package_json}
        end
    end
  end

  defp package_json(handle, true), do: resolve_package(handle)

  defp package_json(handle, false) do
    case first_valid_package(local_package_files(handle), handle) do
      {:ok, package_json} -> {:ok, package_json}
      :miss -> cached_package(handle)
    end
  end

  defp first_valid_package(paths, handle) do
    Enum.find_value(paths, :miss, fn path ->
      case read_valid_package(path, handle, false) do
        {:ok, package_json} -> {:ok, package_json}
        :miss -> nil
      end
    end)
  end

  defp cached_package(handle) do
    path = package_cache_file(handle)

    case read_valid_package(path, handle, true) do
      {:ok, package_json} ->
        if fresh?(path) do
          {:ok, package_json}
        else
          refresh_package(handle, path, package_json)
        end

      :miss ->
        refresh_package(handle, path, nil)
    end
  end

  defp refresh_package(handle, path, stale) do
    case read_valid_package(path, handle, true) do
      {:ok, package_json} ->
        if package_json != stale and fresh?(path) do
          {:ok, package_json}
        else
          resolve_or_reuse_package(handle, path, stale)
        end

      :miss ->
        resolve_or_reuse_package(handle, path, stale)
    end
  end

  defp resolve_or_reuse_package(handle, path, stale) do
    case resolve_package(handle) do
      {:ok, package_json} ->
        with :ok <- nif_ok(Native.cache_write(path, package_json)), do: {:ok, package_json}

      {:error, _reason} when is_binary(stale) ->
        {:ok, stale}

      {:error, reason} ->
        {:error, reason}
    end
  end

  defp read_valid_package(path, handle, remove_invalid?) do
    case File.read(path) do
      {:ok, package_json} ->
        validate_package_file(path, handle, package_json, remove_invalid?)

      {:error, _reason} ->
        :miss
    end
  end

  defp validate_package_file(path, handle, package_json, remove_invalid?) do
    case Native.resolve_language_package(handle.id, package_json) do
      {:ok, _entry} ->
        {:ok, package_json}

      {:error, _reason} ->
        if remove_invalid?, do: File.rm(path)
        :miss
    end
  end

  defp resolve_package(handle) do
    resolver =
      Application.get_env(:lumis, :language_package_resolver, &default_package_url/1)

    case resolver.(handle) do
      {:ok, package_json} when is_binary(package_json) ->
        validate_resolved_package(handle, package_json)

      {:file, path} when is_binary(path) ->
        with {:ok, package_json} <- File.read(path),
             do: validate_resolved_package(handle, package_json)

      {:urls, urls} when is_list(urls) ->
        with {:ok, package_json} <-
               download_first(urls, "language package #{handle.package_name}"),
             do: validate_resolved_package(handle, package_json)

      url when is_binary(url) ->
        with {:ok, package_json} <-
               download_one(url, "language package #{handle.package_name}"),
             do: validate_resolved_package(handle, package_json)

      other ->
        {:error, "invalid :language_package_resolver result: #{inspect(other)}"}
    end
  rescue
    exception -> {:error, "language package resolver failed: #{Exception.message(exception)}"}
  end

  defp validate_resolved_package(handle, package_json) do
    case Native.resolve_language_package(handle.id, package_json) do
      {:ok, _entry} -> {:ok, package_json}
      {:error, reason} -> {:error, reason}
    end
  end

  defp load_entry(entry, package_json) do
    if Native.has_language(entry.id) do
      :ok
    else
      Lumis.Loader.run({:load, entry.id}, fn -> load_once(entry, package_json) end)
    end
  end

  defp load_once(entry, package_json) do
    if Native.has_language(entry.id) do
      :ok
    else
      with {:ok, bytes} <- cached_or_resolved(entry) do
        Native.load_language(entry.id, package_json, bytes)
      end
    end
  end

  defp cache_name(name, paths, seen, directory, force?) do
    case language_entry(name, force?) do
      {:ok, entry, package_json} ->
        key = {entry.package_name, entry.version, entry.definition_hash}

        if MapSet.member?(seen, key) do
          {:cont, {:ok, paths, seen}}
        else
          cache_new_entry(entry, package_json, key, paths, seen, directory, force?)
        end

      {:error, reason} ->
        {:halt, {:error, reason}}
    end
  end

  defp cache_new_entry(entry, package_json, key, paths, seen, directory, force?) do
    with :ok <- claim(entry, fn -> cache_package(entry, package_json, directory, force?) end),
         {:ok, path} <- claim(entry, fn -> cache_parser(entry, directory, force?) end) do
      {:cont, {:ok, [path | paths], MapSet.put(seen, key)}}
    else
      {:error, reason} -> {:halt, {:error, reason}}
    end
  end

  defp cache_package(entry, package_json, directory, force?) do
    destination = Path.join(directory, package_filename(entry))

    if force? or not valid_package_file?(destination, entry.id) do
      nif_ok(Native.cache_write(destination, package_json))
    else
      :ok
    end
  end

  defp valid_package_file?(path, language) do
    case File.read(path) do
      {:ok, package_json} ->
        match?({:ok, _}, Native.resolve_language_package(language, package_json))

      {:error, _reason} ->
        false
    end
  end

  defp cached_or_resolved(entry) do
    case first_verified_parser(local_parser_files(entry), entry) do
      {:ok, bytes} -> {:ok, bytes}
      :miss -> cached_or_downloaded(entry)
    end
  end

  defp first_verified_parser(paths, entry) do
    Enum.find_value(paths, :miss, fn path ->
      case read_verified(path, entry, false) do
        {:ok, bytes} -> {:ok, bytes}
        :miss -> nil
      end
    end)
  end

  defp cached_or_downloaded(entry) do
    path = parser_cache_file(entry)

    case read_verified(path, entry, true) do
      {:ok, bytes} -> {:ok, bytes}
      :miss -> resolve_parser_cache_miss(entry, path)
    end
  end

  defp resolve_parser_cache_miss(entry, path) do
    case read_verified(path, entry, true) do
      {:ok, bytes} -> {:ok, bytes}
      :miss -> resolve_verified_and_write(entry, path)
    end
  end

  defp cache_parser(entry, directory, force?) do
    destination = Path.join(directory, parser_filename(entry))

    if force? do
      resolve_parser_and_write(entry, destination)
    else
      cache_parser_if_missing(entry, destination)
    end
  end

  defp cache_parser_if_missing(entry, destination) do
    case read_verified(destination, entry, true) do
      {:ok, _bytes} -> {:ok, destination}
      :miss -> resolve_parser_and_write(entry, destination)
    end
  end

  defp resolve_parser_and_write(entry, destination) do
    case resolve_verified_and_write(entry, destination) do
      {:ok, _bytes} -> {:ok, destination}
      {:error, reason} -> {:error, reason}
    end
  end

  defp resolve_verified_and_write(entry, path) do
    with {:ok, bytes} <- resolve_parser(entry),
         :ok <- nif_ok(Native.cache_verify(entry.sha256, entry.size, bytes)),
         :ok <- nif_ok(Native.cache_write(path, bytes)) do
      {:ok, bytes}
    end
  end

  defp read_verified(path, entry, remove_invalid?) do
    case File.read(path) do
      {:ok, bytes} -> validate_cached(path, bytes, entry, remove_invalid?)
      {:error, _reason} -> :miss
    end
  end

  defp validate_cached(path, bytes, entry, remove_invalid?) do
    case nif_ok(Native.cache_verify(entry.sha256, entry.size, bytes)) do
      :ok ->
        {:ok, bytes}

      {:error, _reason} ->
        if remove_invalid?, do: File.rm(path)
        :miss
    end
  end

  defp resolve_parser(entry) do
    resolver = Application.get_env(:lumis, :wasm_resolver, &default_wasm_url/1)

    case resolver.(entry) do
      {:ok, bytes} when is_binary(bytes) -> {:ok, bytes}
      {:file, path} when is_binary(path) -> File.read(path)
      {:urls, urls} when is_list(urls) -> download_first(urls, parser_description(entry))
      url when is_binary(url) -> download_one(url, parser_description(entry))
      other -> {:error, "invalid :wasm_resolver result: #{inspect(other)}"}
    end
  rescue
    exception -> {:error, "parser WASM resolver failed: #{Exception.message(exception)}"}
  end

  @cdns ["https://cdn.jsdelivr.net/npm", "https://unpkg.com"]

  defp default_package_url(handle) do
    {:urls, Enum.map(@cdns, &"#{&1}/#{handle.package_name}@latest/language.json")}
  end

  defp default_wasm_url(entry) do
    {:urls,
     Enum.map(
       @cdns,
       &"#{&1}/#{entry.package_name}@#{entry.version}/#{entry.wasm_name}.wasm"
     )}
  end

  defp download_first(urls, description) do
    Enum.reduce_while(urls, {:error, []}, fn url, {:error, failures} ->
      case download(url) do
        {:ok, body} -> {:halt, {:ok, body}}
        {:error, reason} -> {:cont, {:error, [{url, reason} | failures]}}
      end
    end)
    |> case do
      {:ok, body} -> {:ok, body}
      {:error, failures} -> {:error, download_error(description, Enum.reverse(failures))}
    end
  end

  # Every mirror serving the same 404 is one fact, not two, so say it once.
  defp download_error(description, failures) do
    reasons =
      failures |> Enum.map(fn {_url, reason} -> reason end) |> Enum.uniq() |> Enum.join("; ")

    "could not download #{description}: #{reasons}"
  end

  defp parser_description(entry) do
    "parser WASM #{entry.package_name}@#{entry.version}"
  end

  defp download_one(url, description) do
    case download(url) do
      {:ok, body} -> {:ok, body}
      {:error, reason} -> {:error, download_error(description, [{url, reason}])}
    end
  end

  defp download(url) do
    request = {String.to_charlist(url), []}

    http_options = [
      autoredirect: true,
      timeout: 60_000,
      ssl: [
        verify: :verify_peer,
        cacerts: :public_key.cacerts_get(),
        customize_hostname_check: [
          match_fun: :public_key.pkix_verify_hostname_match_fun(:https)
        ]
      ]
    ]

    case :httpc.request(:get, request, http_options, body_format: :binary) do
      {:ok, {{_version, status, _reason}, _headers, body}} when status in 200..299 ->
        {:ok, body}

      {:ok, {{_version, status, reason}, _headers, _body}} ->
        {:error, "HTTP #{status} #{reason}"}

      {:error, reason} ->
        {:error, inspect(reason)}
    end
  end

  defp package_cache_file(handle), do: Path.join(cache_dir(), package_filename(handle))

  defp parser_filename(entry) do
    "#{entry.wasm_name}-#{entry.version}-#{entry.sha256}.wasm"
  end

  # Rustler encodes `Result<(), String>` as `{:ok, {}}`, so normalise it.
  defp nif_ok({:ok, _}), do: :ok
  defp nif_ok({:error, reason}), do: {:error, reason}

  defp parser_cache_file(entry), do: Path.join(cache_dir(), parser_filename(entry))

  defp local_package_files(handle),
    do: Enum.map(local_dirs(), &Path.join(&1, package_filename(handle)))

  defp local_parser_files(entry),
    do: Enum.map(local_dirs(), &Path.join(&1, parser_filename(entry)))

  defp local_dirs do
    case System.get_env("LUMIS_WASM_PATH") do
      nil -> [bundled_dir()]
      path -> [Path.join(path, "parsers"), bundled_dir()]
    end
  end

  defp package_filename(package) do
    suffix = String.replace_prefix(package.package_name, "@lumis-sh/wasm-", "")
    "#{suffix}.language.json"
  end

  defp cache_dir do
    System.get_env("LUMIS_WASM_CACHE_DIR") ||
      :filename.basedir(:user_cache, "lumis") |> to_string() |> Path.join("wasm")
  end

  defp bundled_dir, do: Application.app_dir(:lumis, "priv/wasm")

  defp fresh?(path) do
    case File.stat(path, time: :posix) do
      {:ok, stat} -> System.system_time(:second) - stat.mtime <= @package_ttl_seconds
      {:error, _reason} -> false
    end
  end

  defp claim(entry, operation) do
    Lumis.Loader.run({:cache, entry.package_name, entry.version}, operation)
  end
end
