defmodule Lumis.LanguageLoaderTest do
  use ExUnit.Case, async: false

  alias Lumis.Generated.LanguageManifest

  test "treats plaintext names as parser-free languages" do
    for name <- ~w(plaintext text txt plain) do
      assert :ok = Lumis.load_language(name)
    end
  end

  test "loads an exact parser and reuses it" do
    refute Lumis.Native.has_language("diff")
    assert :ok = Lumis.load_language("diff")
    assert Lumis.Native.has_language("diff")
    assert :ok = Lumis.load_language("diff")
  end

  test "replaces a corrupt cache entry" do
    {:ok, entry} = LanguageManifest.fetch("dockerfile")
    cache_dir = System.fetch_env!("LUMIS_WASM_CACHE_DIR")
    cache_file = Path.join(cache_dir, cache_filename(entry))
    File.mkdir_p!(cache_dir)
    File.write!(cache_file, "corrupt")

    assert :ok = Lumis.load_language("dockerfile")
    assert byte_size(File.read!(cache_file)) == entry.size
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
end
