defmodule Lumis.LanguageLoaderTest do
  use ExUnit.Case, async: false

  import ExUnit.CaptureIO

  test "treats plaintext names as parser-free languages" do
    for name <- ~w(plaintext text txt plain) do
      assert :ok = Lumis.load_language(name)
    end
  end

  test "resolves package metadata from the Rust catalog" do
    assert %{
             id: "dockerfile",
             aliases: ["docker"],
             package_name: "@lumis-sh/wasm-dockerfile"
           } = handle = Lumis.Native.language_package_ref("DOCKER")

    assert {:ok, package_json} =
             Application.fetch_env!(:lumis, :language_package_resolver).(handle)

    assert {:ok,
            %{
              id: "dockerfile",
              wasm_name: "tree-sitter-dockerfile",
              version: "test",
              sha256: sha256,
              size: size
            }} = Lumis.Native.resolve_language_package(handle.id, package_json)

    assert is_binary(sha256)
    assert is_integer(size)
    assert Enum.any?(Lumis.Native.language_package_refs(), &(&1.id == "dockerfile"))
    assert is_nil(Lumis.Native.language_package_ref("not-a-language"))
  end

  test "loads an exact parser and reuses it" do
    refute Lumis.Native.has_language("diff")
    assert :ok = Lumis.load_language("diff")
    assert Lumis.Native.has_language("diff")
    assert :ok = Lumis.load_language("diff")
  end

  test "loads multiple languages" do
    assert :ok = Lumis.load_languages([:plaintext, "text"])
  end

  test "replaces a corrupt cache entry" do
    entry = resolved_entry("dockerfile")
    cache_dir = System.fetch_env!("LUMIS_WASM_CACHE_DIR")
    cache_file = Path.join(cache_dir, cache_filename(entry))
    File.mkdir_p!(cache_dir)
    File.write!(cache_file, "corrupt")

    assert :ok = Lumis.load_language("dockerfile")
    assert byte_size(File.read!(cache_file)) == entry.size
  end

  test "caches release-local parsers and loads them offline" do
    refute Lumis.Native.has_language("xml")
    bundle_dir = Application.fetch_env!(:lumis, :wasm_bundle_dir)

    assert {:ok, [path]} =
             Lumis.LanguageLoader.cache(["xml", "xml"], directory: bundle_dir)

    assert File.exists?(path)

    previous = Application.get_env(:lumis, :wasm_offline)
    Application.put_env(:lumis, :wasm_offline, true)

    on_exit(fn ->
      if is_nil(previous) do
        Application.delete_env(:lumis, :wasm_offline)
      else
        Application.put_env(:lumis, :wasm_offline, previous)
      end
    end)

    assert :ok = Lumis.load_language("xml")
    assert Lumis.Native.has_language("xml")
  end

  test "serializes concurrent cache misses" do
    entry = resolved_entry("comment")
    original_resolver = Application.fetch_env!(:lumis, :wasm_resolver)
    {:file, fixture} = original_resolver.(entry)
    bytes = File.read!(fixture)

    output_dir =
      Path.join(System.tmp_dir!(), "lumis-cache-#{System.unique_integer([:positive])}")

    test_process = self()

    Application.put_env(:lumis, :wasm_resolver, fn _entry ->
      send(test_process, {:resolver_started, self()})
      receive do: (:release -> {:ok, bytes})
    end)

    on_exit(fn ->
      Application.put_env(:lumis, :wasm_resolver, original_resolver)
      File.rm_rf(output_dir)
    end)

    first =
      Task.async(fn -> Lumis.LanguageLoader.cache(["comment"], directory: output_dir) end)

    assert_receive {:resolver_started, resolver_process}

    second =
      Task.async(fn -> Lumis.LanguageLoader.cache(["comment"], directory: output_dir) end)

    refute_receive {:resolver_started, _other_process}, 100
    send(resolver_process, :release)

    assert {:ok, [path]} = Task.await(first)
    assert {:ok, [^path]} = Task.await(second)
  end

  test "Mix task prepares exact release-local parser files" do
    output_dir = Path.join(Application.fetch_env!(:lumis, :wasm_bundle_dir), "mix-task")

    output =
      capture_io(fn ->
        Mix.Task.reenable("lumis.parsers.cache")
        Mix.Task.run("lumis.parsers.cache", ["comment", "--output", output_dir])
      end)

    assert output =~ "tree-sitter-comment-"
    assert [path] = Path.wildcard(Path.join(output_dir, "tree-sitter-comment-*.wasm"))
    assert File.exists?(path)
  end

  test "loads an injected language and retries highlighting" do
    assert {:ok, html} =
             Lumis.highlight("<script>const answer = 42</script>",
               formatter: {:html_linked, language: "html"}
             )

    assert html =~ "language-html"
    assert Lumis.Native.has_language("html")
    assert Lumis.Native.has_language("javascript")
  end

  test "offline mode rejects an uncached parser" do
    previous = Application.get_env(:lumis, :wasm_offline)
    Application.put_env(:lumis, :wasm_offline, true)

    on_exit(fn ->
      if is_nil(previous) do
        Application.delete_env(:lumis, :wasm_offline)
      else
        Application.put_env(:lumis, :wasm_offline, previous)
      end
    end)

    assert {:error, message} = Lumis.load_language("c")
    assert message =~ "offline mode is enabled"
  end

  defp cache_filename(entry) do
    "#{entry.wasm_name}-#{entry.version}-#{entry.sha256}.wasm"
  end

  defp resolved_entry(name) do
    handle = Lumis.Native.language_package_ref(name)
    {:ok, package_json} = Application.fetch_env!(:lumis, :language_package_resolver).(handle)
    {:ok, entry} = Lumis.Native.resolve_language_package(handle.id, package_json)
    entry
  end

  describe "shared cache primitives" do
    # lumis-wasm-runtime owns verification, atomic writes and locking so this
    # loader and the CLI cannot drift. Rustler encodes `Result<(), String>` as
    # `{:ok, {}}` rather than `:ok`, which silently broke every `with :ok <-`
    # until these pinned it.
    test "verification rejects bytes that do not match the digest" do
      assert {:error, reason} =
               Lumis.Native.cache_verify(String.duplicate("0", 64), 2, "hi")

      assert reason =~ "integrity"
    end

    test "verification rejects a size mismatch" do
      assert {:error, reason} =
               Lumis.Native.cache_verify(String.duplicate("0", 64), 99, "hi")

      assert reason =~ "size"
    end

    test "writes are atomic and readable" do
      path = Path.join(tmp_dir(), "asset.json")
      assert {:ok, _} = Lumis.Native.cache_write(path, "contents")
      assert File.read!(path) == "contents"
    end

    test "a lock can be taken, released and retaken" do
      path = Path.join(tmp_dir(), "locked.json")
      assert {:ok, _} = Lumis.Native.cache_lock(path)
      assert {:ok, _} = Lumis.Native.cache_unlock(path)
      assert {:ok, _} = Lumis.Native.cache_lock(path)
      assert {:ok, _} = Lumis.Native.cache_unlock(path)
    end

    defp tmp_dir do
      dir = Path.join(System.tmp_dir!(), "lumis-cache-#{:erlang.unique_integer([:positive])}")
      File.mkdir_p!(dir)
      on_exit(fn -> File.rm_rf(dir) end)
      dir
    end
  end
end
