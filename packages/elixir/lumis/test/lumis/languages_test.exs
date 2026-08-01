defmodule Lumis.LanguagesTest do
  use ExUnit.Case, async: false

  import ExUnit.CaptureIO

  test "treats plaintext names as parser-free languages" do
    for name <- ~w(plaintext text txt plain) do
      assert :ok = Lumis.Languages.load(name)
    end
  end

  test "loads a parser and reuses it" do
    assert :ok = Lumis.Languages.load("diff")
    assert Lumis.Native.has_language("diff")
    assert :ok = Lumis.Languages.load("diff")
  end

  test "loads by alias, atom and list" do
    assert :ok = Lumis.Languages.load(:json)
    assert :ok = Lumis.Languages.load(["json", :plaintext])
    assert Lumis.Native.has_language("json")
  end

  test "reports an unknown language rather than loading nothing quietly" do
    assert {:error, reason} = Lumis.Languages.load("not-a-language")
    assert reason =~ "not-a-language"
  end

  test "every catalog language is nameable" do
    names = Lumis.Languages.all_names()
    assert "elixir" in names
    assert length(names) > 100
  end

  test "highlighting loads what a document names" do
    refute Lumis.Native.has_language("xml")

    assert {:ok, html} =
             Lumis.highlight("<a b=\"c\"/>", formatter: {:html_linked, language: "xml"})

    assert html =~ "language-xml"
    assert Lumis.Native.has_language("xml")
  end

  test "highlighting loads a language injected inside the document" do
    assert {:ok, html} =
             Lumis.highlight("<script>const answer = 42</script>",
               formatter: {:html_linked, language: "html"}
             )

    assert html =~ "language-html"
    assert Lumis.Native.has_language("html")
    assert Lumis.Native.has_language("javascript")
  end

  # One pass has to reach every nested language, and this is the deepest the
  # executor stack recurses.
  test "highlights a document with several injected languages" do
    fenced =
      ~w(python css lua javascript)
      |> Enum.map_join("\n", fn language ->
        "```#{language}\n" <> String.duplicate("x = 1\n", 50) <> "```"
      end)

    source = String.duplicate(fenced <> "\n\n", 5)

    assert {:ok, html} = Lumis.highlight(source, formatter: {:html_inline, language: "markdown"})
    assert html =~ "language-markdown"

    for language <- ~w(markdown python css lua javascript) do
      assert Lumis.Native.has_language(language), "#{language} should have been loaded"
    end
  end

  describe "cache/2" do
    test "writes verified parsers into a directory" do
      directory = tmp_dir()

      assert {:ok, [path]} = Lumis.Languages.cache(["comment"], directory: directory)
      assert String.starts_with?(Path.basename(path), "tree-sitter-comment-")
      assert File.exists?(path)
    end

    test "collapses languages that share one parser" do
      directory = tmp_dir()

      assert {:ok, [_only_one]} =
               Lumis.Languages.cache(["markdown", "markdown"], directory: directory)
    end

    test "leaves a cached directory usable on its own" do
      directory = tmp_dir()
      assert {:ok, [path]} = Lumis.Languages.cache(["python"], directory: directory)

      assert File.exists?(path)
      assert File.exists?(Path.join([directory, "parsers", "python.language.json"]))
    end

    test "reports an unknown language" do
      assert {:error, reason} = Lumis.Languages.cache(["not-a-language"], directory: tmp_dir())
      assert reason =~ "not-a-language"
    end
  end

  describe "mix lumis.languages.cache" do
    test "writes the named parsers and prints their paths" do
      directory = tmp_dir()

      output =
        capture_io(fn ->
          Mix.Task.reenable("lumis.languages.cache")
          Mix.Task.run("lumis.languages.cache", ["--output", directory, "comment"])
        end)

      assert output =~ "tree-sitter-comment-"
      assert [path] = Path.wildcard(Path.join([directory, "parsers", "tree-sitter-comment-*"]))
      assert File.exists?(path)
    end

    test "refuses to guess when given neither names nor --all" do
      assert_raise Mix.Error, ~r/--all/, fn ->
        Mix.Task.reenable("lumis.languages.cache")
        Mix.Task.run("lumis.languages.cache", [])
      end
    end
  end

  defp tmp_dir do
    dir = Path.join(System.tmp_dir!(), "lumis-cache-#{System.unique_integer([:positive])}")
    File.mkdir_p!(dir)
    on_exit(fn -> File.rm_rf(dir) end)
    dir
  end
end
