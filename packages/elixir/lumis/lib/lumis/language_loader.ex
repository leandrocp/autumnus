defmodule Lumis.LanguageLoader do
  @moduledoc false

  alias Lumis.Native

  @lock_timeout_ms 120_000
  @stale_lock_ms 300_000
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
    with_cache_lock(path, fn ->
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
    end)
  end

  defp resolve_or_reuse_package(handle, path, stale) do
    case resolve_package(handle) do
      {:ok, package_json} ->
        with :ok <- write_atomic(path, package_json), do: {:ok, package_json}

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
    with :ok <- cache_package(entry, package_json, directory, force?),
         {:ok, path} <- cache_parser(entry, directory, force?) do
      {:cont, {:ok, [path | paths], MapSet.put(seen, key)}}
    else
      {:error, reason} -> {:halt, {:error, reason}}
    end
  end

  defp cache_package(entry, package_json, directory, force?) do
    destination = Path.join(directory, package_filename(entry))

    with_cache_lock(destination, fn ->
      if force? or not valid_package_file?(destination, entry.id) do
        write_atomic(destination, package_json)
      else
        :ok
      end
    end)
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
      with_cache_lock(path, fn ->
        case read_verified(path, entry, true) do
          {:ok, bytes} -> {:ok, bytes}
          :miss -> resolve_verified_and_write(entry, path)
        end
      end)
    end
  end

  defp cache_parser(entry, directory, force?) do
    destination = Path.join(directory, parser_filename(entry))

    with_cache_lock(destination, fn ->
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
    end)
  end

  defp resolve_parser_and_write(entry, destination) do
    case resolve_verified_and_write(entry, destination) do
      {:ok, _bytes} -> {:ok, destination}
      {:error, reason} -> {:error, reason}
    end
  end

  defp resolve_verified_and_write(entry, path) do
    with {:ok, bytes} <- resolve_parser(entry),
         :ok <- verify(bytes, entry),
         :ok <- write_atomic(path, bytes) do
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
    case verify(bytes, entry) do
      :ok ->
        {:ok, bytes}

      {:error, _reason} ->
        if remove_invalid?, do: File.rm(path)
        :miss
    end
  end

  defp verify(bytes, entry) when byte_size(bytes) != entry.size do
    {:error,
     "invalid parser WASM size for '#{entry.id}': expected #{entry.size}, got #{byte_size(bytes)}"}
  end

  defp verify(bytes, entry) do
    actual = :sha256 |> :crypto.hash(bytes) |> Base.encode16(case: :lower)

    if actual == entry.sha256 do
      :ok
    else
      {:error,
       "invalid parser WASM integrity for '#{entry.id}': expected sha256-#{entry.sha256}, got sha256-#{actual}"}
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
  defp parser_cache_file(entry), do: Path.join(cache_dir(), parser_filename(entry))
  defp bundled_package_file(handle), do: Path.join(bundled_dir(), package_filename(handle))
  defp bundled_parser_file(entry), do: Path.join(bundled_dir(), parser_filename(entry))

  defp package_filename(package) do
    "#{Path.basename(package.package_name)}.language.json"
  end

  defp parser_filename(entry) do
    "#{entry.wasm_name}-#{entry.version}-#{entry.sha256}.wasm"
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

  defp write_atomic(path, bytes) do
    directory = Path.dirname(path)
    temporary = "#{path}.#{System.unique_integer([:positive])}.tmp"

    try do
      with :ok <- File.mkdir_p(directory),
           :ok <- File.write(temporary, bytes, [:exclusive]) do
        replace_file(temporary, path)
      end
    after
      _ = File.rm(temporary)
    end
  end

  defp replace_file(temporary, path) do
    case File.rename(temporary, path) do
      :ok ->
        :ok

      {:error, :eexist} ->
        with :ok <- File.rm(path), do: File.rename(temporary, path)

      {:error, reason} ->
        {:error, "failed to cache language package: #{inspect(reason)}"}
    end
  end

  defp with_cache_lock(cache_file, operation) do
    lock_file = cache_file <> ".lock"
    deadline = now_ms() + @lock_timeout_ms

    with :ok <- File.mkdir_p(Path.dirname(cache_file)),
         {:ok, io} <- acquire_lock(lock_file, deadline) do
      try do
        operation.()
      after
        File.close(io)
        _ = File.rm(lock_file)
      end
    end
  end

  defp acquire_lock(lock_file, deadline) do
    case File.open(lock_file, [:write, :exclusive]) do
      {:ok, io} ->
        IO.write(io, Integer.to_string(now_ms()))
        {:ok, io}

      {:error, :eexist} ->
        clear_stale_lock(lock_file)

        if now_ms() >= deadline do
          {:error, "timed out waiting for language cache lock"}
        else
          Process.sleep(25)
          acquire_lock(lock_file, deadline)
        end

      {:error, reason} ->
        {:error, "failed to lock language cache: #{inspect(reason)}"}
    end
  end

  defp clear_stale_lock(lock_file) do
    with {:ok, contents} <- File.read(lock_file),
         {created_at, ""} <- Integer.parse(contents),
         true <- now_ms() - created_at > @stale_lock_ms do
      File.rm(lock_file)
    else
      _ -> :ok
    end
  end

  defp now_ms, do: System.system_time(:millisecond)
end
