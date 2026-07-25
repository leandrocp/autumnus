defmodule Lumis.LanguageLoader do
  @moduledoc false

  alias Lumis.Native

  @lock_timeout_ms 120_000
  @stale_lock_ms 300_000
  @plaintext_names ~w(plaintext text txt plain)

  def load(name) when name in @plaintext_names, do: :ok

  def load(name) when is_binary(name) do
    case Native.language_manifest(name) do
      nil -> {:error, "unknown language '#{name}'"}
      entry -> load_manifest_entry(entry)
    end
  end

  def preload(names) when is_list(names) do
    Enum.reduce_while(names, :ok, fn name, :ok ->
      case load(to_string(name)) do
        :ok -> {:cont, :ok}
        {:error, reason} -> {:halt, {:error, reason}}
      end
    end)
  end

  def prefetch(names, options \\ []) when is_list(names) and is_list(options) do
    directory = Keyword.get(options, :directory, bundled_dir())
    force? = Keyword.get(options, :force, false)

    result =
      Enum.reduce_while(names, {:ok, [], MapSet.new()}, fn name, {:ok, paths, seen} ->
        prefetch_name(to_string(name), paths, seen, directory, force?)
      end)

    case result do
      {:error, reason} -> {:error, reason}
      {:ok, paths, _seen} -> {:ok, Enum.reverse(paths)}
    end
  end

  defp load_manifest_entry(entry) do
    if Native.has_language(entry.id) do
      :ok
    else
      :global.trans({__MODULE__, entry.id}, fn -> load_entry(entry) end)
    end
  end

  defp prefetch_name(name, paths, seen, directory, force?) do
    case Native.language_manifest(name) do
      nil -> {:halt, {:error, "unknown language '#{name}'"}}
      entry -> prefetch_manifest_entry(entry, paths, seen, directory, force?)
    end
  end

  defp prefetch_manifest_entry(entry, paths, seen, directory, force?) do
    key = {entry.wasm_name, entry.version, entry.sha256}

    if MapSet.member?(seen, key) do
      {:cont, {:ok, paths, seen}}
    else
      prefetch_new_entry(entry, key, paths, seen, directory, force?)
    end
  end

  defp prefetch_new_entry(entry, key, paths, seen, directory, force?) do
    case prefetch_entry(entry, directory, force?) do
      {:ok, path} -> {:cont, {:ok, [path | paths], MapSet.put(seen, key)}}
      {:error, reason} -> {:halt, {:error, reason}}
    end
  end

  defp load_entry(entry) do
    if Native.has_language(entry.id) do
      :ok
    else
      case cached_or_resolved(entry) do
        {:ok, bytes} -> Native.load_language(entry.id, bytes)
        {:error, reason} -> {:error, reason}
      end
    end
  end

  defp cached_or_resolved(entry) do
    case read_verified(bundled_file(entry), entry, false) do
      {:ok, bytes} -> {:ok, bytes}
      :miss -> cached_or_downloaded(entry)
    end
  end

  defp cached_or_downloaded(entry) do
    cache_file = cache_file(entry)

    case read_verified(cache_file, entry, true) do
      {:ok, bytes} ->
        {:ok, bytes}

      :miss ->
        resolve_cache_miss(entry, cache_file)
    end
  end

  defp resolve_cache_miss(entry, cache_file) do
    if offline?() do
      offline_error(entry)
    else
      with_cache_lock(cache_file, fn -> cached_after_lock(entry, cache_file) end)
    end
  end

  defp cached_after_lock(entry, cache_file) do
    case read_verified(cache_file, entry, true) do
      {:ok, bytes} -> {:ok, bytes}
      :miss -> resolve_verified_and_write(entry, cache_file)
    end
  end

  defp resolve_verified_and_write(entry, cache_file) do
    with {:ok, bytes} <- resolve(entry),
         :ok <- verify(bytes, entry),
         :ok <- write_atomic(cache_file, bytes) do
      {:ok, bytes}
    end
  end

  defp prefetch_entry(entry, directory, force?) do
    destination = Path.join(directory, cache_filename(entry))
    with_cache_lock(destination, fn -> ensure_prefetched(entry, destination, force?) end)
  end

  defp ensure_prefetched(entry, destination, true) do
    resolve_and_write(entry, destination)
  end

  defp ensure_prefetched(entry, destination, false) do
    case read_verified(destination, entry, true) do
      {:ok, _bytes} -> {:ok, destination}
      :miss -> resolve_and_write(entry, destination)
    end
  end

  defp resolve_and_write(entry, destination) do
    if offline?() do
      offline_error(entry)
    else
      case resolve_verified_and_write(entry, destination) do
        {:ok, _bytes} -> {:ok, destination}
        {:error, reason} -> {:error, reason}
      end
    end
  end

  defp offline_error(entry) do
    {:error, "parser WASM for '#{entry.id}' is not cached and offline mode is enabled"}
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

  defp resolve(entry) do
    resolver = Application.get_env(:lumis, :wasm_resolver, &default_url/1)

    case resolver.(entry) do
      {:ok, bytes} when is_binary(bytes) -> {:ok, bytes}
      {:file, path} when is_binary(path) -> File.read(path)
      url when is_binary(url) -> download(url)
      other -> {:error, "invalid :wasm_resolver result: #{inspect(other)}"}
    end
  rescue
    exception -> {:error, "parser WASM resolver failed: #{Exception.message(exception)}"}
  end

  defp default_url(entry) do
    "https://cdn.jsdelivr.net/npm/#{entry.package_name}@#{entry.version}/#{entry.wasm_name}.wasm"
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
        {:error, "failed to download parser WASM: HTTP #{status} #{reason}"}

      {:error, reason} ->
        {:error, "failed to download parser WASM: #{inspect(reason)}"}
    end
  end

  defp cache_file(entry) do
    Path.join(cache_dir(), cache_filename(entry))
  end

  defp bundled_file(entry) do
    Path.join(bundled_dir(), cache_filename(entry))
  end

  defp cache_filename(entry) do
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
        {:error, "failed to cache parser WASM: #{inspect(reason)}"}
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
          {:error, "timed out waiting for parser WASM cache lock"}
        else
          Process.sleep(25)
          acquire_lock(lock_file, deadline)
        end

      {:error, reason} ->
        {:error, "failed to lock parser WASM cache: #{inspect(reason)}"}
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
