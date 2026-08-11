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
    assert {:error, :unknown_language} = Lumis.Languages.load("not-a-language")
  end

  # `dockerfile` is staged but named nowhere else, so it is only in memory if
  # this call put it there. Any language the rest of the suite touches would
  # pass whether or not the list stopped early.
  test "a failure in a list does not cost the languages after it" do
    refute "dockerfile" in Lumis.loaded_languages()

    assert {:error, failures} = Lumis.Languages.load(["not-a-language", "dockerfile"])
    assert failures == %{"not-a-language" => :unknown_language}
    assert "dockerfile" in Lumis.loaded_languages()
  end

  test "loaded_languages lists what is in memory, not the catalog" do
    assert :ok = Lumis.Languages.load("json")
    loaded = Lumis.loaded_languages()

    assert "json" in loaded
    assert loaded == Enum.sort(loaded)
    assert length(loaded) < length(Lumis.available_languages())
  end

  test "every catalog language is nameable" do
    names = Enum.map(Lumis.available_languages(), & &1.id)
    assert "elixir" in names
    assert length(names) > 100
  end

  describe "guess/2" do
    test "resolves an id, alias, file name and path" do
      assert Lumis.Languages.guess("elixir") == "elixir"
      assert Lumis.Languages.guess("sh") == "bash"
      assert Lumis.Languages.guess("app.ex") == "elixir"
      assert Lumis.Languages.guess("lib/app.ex") == "elixir"
    end

    test "falls back to content when the name does not resolve" do
      assert Lumis.Languages.guess(nil, "#!/usr/bin/env bash\nID=1") == "bash"
      assert Lumis.Languages.guess(nil, "<!DOCTYPE html>\n<html></html>") == "html"
    end

    test "falls back to plaintext" do
      assert Lumis.Languages.guess(nil, "") == "plaintext"
      assert Lumis.Languages.guess("not-a-language", "") == "plaintext"
    end

    test "agrees with what highlight/2 picks for the same input" do
      source = "#!/usr/bin/env bash\nID=1"

      assert {:ok, html} = Lumis.highlight(source, formatter: :html_linked)
      assert html =~ "language-#{Lumis.Languages.guess(nil, source)}"
    end
  end

  describe "bundles" do
    @bundles_dir Path.expand("../../../../javascript/lumis/bundles", __DIR__)

    test "name the same languages as the matching npm bundle package" do
      bundles = Lumis.Languages.bundles()

      published =
        @bundles_dir
        |> Path.join("*.ts")
        |> Path.wildcard()
        |> Map.new(fn path ->
          names =
            path
            |> File.read!()
            |> then(&Regex.scan(~r/lazy\("([^"]+)"/, &1))
            |> Enum.map(fn [_, name] -> name end)
            # `plaintext` needs no parser, so it is not a catalog language and
            # every runtime answers for it without a bundle saying so.
            |> Enum.reject(&(&1 == "plaintext"))

          {bundle_atom(Path.basename(path, ".ts")), {Path.basename(path), names}}
        end)

      assert map_size(published) == 5, "expected five published bundles"

      assert Map.keys(bundles) |> Enum.sort() == Map.keys(published) |> Enum.sort()

      for {bundle, {file, names}} <- published do
        assert Enum.sort(bundles[bundle]) == Enum.sort(names),
               "#{inspect(bundle)} disagrees with #{file}"
      end
    end

    test "load/1 accepts a bundle and rejects an unknown one" do
      assert %{bundle_web: web} = Lumis.Languages.bundles()
      assert "html" in web
      assert length(Lumis.Languages.bundles()[:bundle_full]) > 100

      assert {:error, :unknown_bundle} = Lumis.Languages.load(:bundle_nope)
    end

    test "cache/2 takes the same bundle names load/1 does" do
      assert {:error, {:unknown_bundle, "bundle_nope"}} = Lumis.Languages.cache([:bundle_nope])
    end

    test "expand_bundles/1 expands a bundle into its members" do
      assert {:ok, members} = Lumis.Languages.expand_bundles([:bundle_web])
      assert Enum.sort(members) == Enum.sort(Lumis.Languages.bundles()[:bundle_web])
    end

    test "expand_bundles/1 accepts hyphens, matching the CLI spelling" do
      assert Lumis.Languages.expand_bundles(["bundle-web-extra"]) ==
               Lumis.Languages.expand_bundles([:bundle_web_extra])
    end

    test "expand_bundles/1 leaves plain language names alone and deduplicates" do
      assert {:ok, ["rust", "elixir"]} = Lumis.Languages.expand_bundles(["rust", "elixir"])

      assert {:ok, expanded} = Lumis.Languages.expand_bundles([:bundle_web, "css"])
      assert Enum.count(expanded, &(&1 == "css")) == 1
    end

    # Atoms are never garbage collected, so a bundle name arriving from a
    # request must not become one. `bundles/0` interns the five fixed names on
    # first call, hence the warm-up before the baseline.
    test "an unknown bundle name creates no atom" do
      assert :error = Lumis.Languages.bundle_members("bundle_warmup")
      before = :erlang.system_info(:atom_count)

      for index <- 1..50 do
        assert :error = Lumis.Languages.bundle_members("bundle_absent_#{index}")
      end

      assert :erlang.system_info(:atom_count) == before
    end

    defp bundle_atom(name), do: String.to_atom("bundle_" <> String.replace(name, "-", "_"))
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
    @store Application.compile_env!(:lumis, :data_dir)

    test "writes verified parsers into the store" do
      assert {:ok, [path]} = Lumis.Languages.cache(["comment"])
      assert String.starts_with?(Path.basename(path), "tree-sitter-comment-")
      assert File.exists?(path)
    end

    test "collapses languages that share one parser" do
      assert {:ok, [_only_one]} = Lumis.Languages.cache(["markdown", "markdown"])
    end

    test "leaves the store usable on its own" do
      assert {:ok, [path]} = Lumis.Languages.cache(["python"])

      assert File.exists?(path)
      assert File.exists?(Path.join([@store, "parsers", "python.lumis.json"]))
    end

    test "reports an unknown language" do
      assert {:error, reason} = Lumis.Languages.cache(["not-a-language"])
      assert reason =~ "not-a-language"
    end
  end

  describe "mix lumis.languages.cache" do
    test "writes the named parsers and prints their paths" do
      output =
        capture_io(fn ->
          Mix.Task.reenable("lumis.languages.cache")
          Mix.Task.run("lumis.languages.cache", ["comment"])
        end)

      assert output =~ "tree-sitter-comment-"
    end

    test "refuses to guess when given neither names nor --all" do
      assert_raise Mix.Error, ~r/--all/, fn ->
        Mix.Task.reenable("lumis.languages.cache")
        Mix.Task.run("lumis.languages.cache", [])
      end
    end
  end
end
