defmodule Lumis.LanguageLoader do
  @moduledoc false

  alias Lumis.Native

  @package_ttl_seconds 3_600
  @plaintext_names ~w(plaintext text txt plain)

  def load(name) when name in @plaintext_names, do: :ok

  def load(name) when is_binary(name) do
    with {:ok, entry, package_json} <- language_entry(name, false) do
      load_entry(entry, package_json)
    end
  end

  def load_languages(names) when is_list(names) do
    Enum.reduce_while(names, :ok, fn name, :ok ->
      case load(to_string(name)) do
        :ok -> {:cont, :ok}
        {:error, reason} -> {:halt, {:error, reason}}
      end
    end)
  end

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

  defp package_json(handle, true) do
    if offline?(), do: package_offline_error(handle), else: resolve_package(handle)
  end

  defp package_json(handle, false) do
    case read_valid_package(bundled_package_file(handle), handle, false) do
      {:ok, package_json} -> {:ok, package_json}
      :miss -> cached_package(handle)
    end
  end

  defp cached_package(handle) do
    path = package_cache_file(handle)

    case read_valid_package(path, handle, true) do
      {:ok, package_json} ->
        if offline?() or fresh?(path) do
          {:ok, package_json}
        else
          refresh_package(handle, path, package_json)
        end

      :miss ->
        if offline?(), do: package_offline_error(handle), else: refresh_package(handle, path, nil)
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
        case Native.resolve_language_package(handle.id, package_json) do
          {:ok, _entry} ->
            {:ok, package_json}

          {:error, _reason} ->
            if remove_invalid?, do: File.rm(path)
            :miss
        end

      {:error, _reason} ->
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

      url when is_binary(url) ->
        with {:ok, package_json} <- download(url, "language package"),
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
      :global.trans({__MODULE__, entry.id}, fn ->
        if Native.has_language(entry.id) do
          :ok
        else
          with {:ok, bytes} <- cached_or_resolved(entry) do
            Native.load_language(entry.id, package_json, bytes)
          end
        end
      end)
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
    # Serialise per package so concurrent callers share one download rather than
    # each fetching the same bytes. This is process-based rather than a lock file:
    # it needs no stale-entry recovery, and it releases the moment the owner dies.
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
    case read_verified(bundled_parser_file(entry), entry, false) do
      {:ok, bytes} -> {:ok, bytes}
      :miss -> cached_or_downloaded(entry)
    end
  end

  defp cached_or_downloaded(entry) do
    path = parser_cache_file(entry)

    case read_verified(path, entry, true) do
      {:ok, bytes} -> {:ok, bytes}
      :miss -> resolve_parser_cache_miss(entry, path)
    end
  end

  defp resolve_parser_cache_miss(entry, path) do
    if offline?() do
      parser_offline_error(entry)
    else
      case read_verified(path, entry, true) do
        {:ok, bytes} -> {:ok, bytes}
        :miss -> resolve_verified_and_write(entry, path)
      end
    end
  end

  defp cache_parser(entry, directory, force?) do
    destination = Path.join(directory, parser_filename(entry))

    cond do
      offline?() and force? ->
        parser_offline_error(entry)

      force? ->
        resolve_parser_and_write(entry, destination)

      true ->
        case read_verified(destination, entry, true) do
          {:ok, _bytes} ->
            {:ok, destination}

          :miss ->
            if offline?() do
              parser_offline_error(entry)
            else
              resolve_parser_and_write(entry, destination)
            end
        end
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
      url when is_binary(url) -> download(url, "parser WASM")
      other -> {:error, "invalid :wasm_resolver result: #{inspect(other)}"}
    end
  rescue
    exception -> {:error, "parser WASM resolver failed: #{Exception.message(exception)}"}
  end

  defp default_package_url(handle) do
    "https://cdn.jsdelivr.net/npm/#{handle.package_name}@latest/language.json"
  end

  defp default_wasm_url(entry) do
    "https://cdn.jsdelivr.net/npm/#{entry.package_name}@#{entry.version}/#{entry.wasm_name}.wasm"
  end

  defp download(url, description) do
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
        {:error, "failed to download #{description}: HTTP #{status} #{reason}"}

      {:error, reason} ->
        {:error, "failed to download #{description}: #{inspect(reason)}"}
    end
  end

  defp package_cache_file(handle), do: Path.join(cache_dir(), package_filename(handle))
  # Must match `lumis_wasm_runtime::store::parser_filename`, which the CLI uses.
  defp parser_filename(entry) do
    "#{entry.wasm_name}-#{entry.version}-#{entry.sha256}.wasm"
  end

  # Rustler encodes `Result<(), String>` as `{:ok, {}}`, so normalise it.
  defp nif_ok({:ok, _}), do: :ok
  defp nif_ok({:error, reason}), do: {:error, reason}

  defp parser_cache_file(entry), do: Path.join(cache_dir(), parser_filename(entry))
  defp bundled_package_file(handle), do: Path.join(bundled_dir(), package_filename(handle))
  defp bundled_parser_file(entry), do: Path.join(bundled_dir(), parser_filename(entry))

  defp package_filename(package) do
    "#{Path.basename(package.package_name)}.language.json"
  end

  defp cache_dir do
    System.get_env("LUMIS_WASM_CACHE_DIR") ||
      :filename.basedir(:user_cache, "lumis") |> to_string() |> Path.join("wasm")
  end

  defp bundled_dir do
    Application.get_env(:lumis, :wasm_bundle_dir) ||
      Application.app_dir(:lumis, "priv/wasm")
  end

  defp offline? do
    Application.get_env(
      :lumis,
      :wasm_offline,
      String.downcase(System.get_env("LUMIS_WASM_OFFLINE", "")) in ["1", "true"]
    )
  end

  defp package_offline_error(handle) do
    {:error, "language package for '#{handle.id}' is not cached and offline mode is enabled"}
  end

  defp parser_offline_error(entry) do
    {:error, "parser WASM for '#{entry.id}' is not cached and offline mode is enabled"}
  end

  defp fresh?(path) do
    case File.stat(path, time: :posix) do
      {:ok, stat} -> System.system_time(:second) - stat.mtime <= @package_ttl_seconds
      {:error, _reason} -> false
    end
  end

  # Correctness needs no lock: `write_atomic` in lumis-wasm-runtime renames a
  # uniquely named temporary into place and verifies parser bytes before the
  # rename, so concurrent writers converge on identical content. What `claim/2`
  # buys is narrower and worth having anyway: concurrent callers share one
  # download instead of each fetching the same bytes.
  defp claim(entry, operation) do
    :global.trans({{__MODULE__, :cache, entry.package_name, entry.version}, self()}, operation)
  end
end
