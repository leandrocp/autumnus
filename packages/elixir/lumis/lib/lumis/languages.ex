defmodule Lumis.Languages do
  @moduledoc """
  Downloads, caches and loads Tree-sitter parsers.

  A language is a parser WASM plus the queries that drive highlighting, released
  together as a `@lumis-sh/wasm-*` package with its size and SHA-256. Nothing
  here needs calling for normal use: `Lumis.highlight/2` fetches and loads what a
  document turns out to need, including languages injected inside it.

  Reach for it in two situations.

  Load ahead of the first request, so a download does not land on a user:

      :ok = Lumis.Languages.load(["elixir", "html"])

  Or cache parsers at build time, for a release that must start without network
  access. `mix lumis.languages.cache` is the usual entry point.

  ## Where parsers come from

  Each is taken from `$LUMIS_DATA_DIR/parsers` if it is there, and the CDN
  otherwise. Bytes are checked against the size and digest their package
  declares before use, and anything that fails is discarded rather than trusted,
  so a corrupted store repairs itself.

  Concurrent requests for the same uncached language wait for the first rather
  than each downloading it, and loading is global to the VM: the process that
  pays for a language pays once, for every process after it.
  """

  alias Lumis.Native

  @plaintext_names ~w(plaintext text txt plain)

  @typedoc "A language set shared with the `@lumis-sh/wasm-bundle-*` packages."
  @type bundle() ::
          :bundle_web | :bundle_web_extra | :bundle_system | :bundle_backend | :bundle_full

  @doc """
  Loads one language, a list of them, or a bundle, verifying each parser first.

  Highlighting loads on demand, so this is an optimization rather than a
  requirement: call it at startup to move the download off the first request.
  Already-loaded languages return immediately.

      :ok = Lumis.Languages.load("elixir")
      :ok = Lumis.Languages.load(["elixir", :html])
      :ok = Lumis.Languages.load(:bundle_web)

  A `:bundle_*` atom names the same set of languages as the `@lumis-sh/wasm-bundle-*`
  package of that name, so every runtime means the same thing by it. `:bundle_full`
  is every language in the catalog, which is rarely what a deployment wants; prefer
  a narrower bundle, or name the languages a document can contain.

  ## Failures

  A list loads every name in it and reports the ones that failed, rather than
  stopping at the first. One unpublished parser in a bundle should not cost the
  rest, the same way one bad block does not cost a document.

      {:error, %{"css" => :failed_to_load_parser}} = Lumis.Languages.load(["elixir", "css"])

    * `:unknown_language` — the name is not in the catalog
    * `:failed_to_load_parser` — it is, but its parser could not be obtained or verified
    * `:unknown_bundle` — no bundle by that name

  """
  @type failure() :: :unknown_language | :failed_to_load_parser
  @spec load(bundle() | String.t() | atom() | [String.t() | atom()]) ::
          :ok | {:error, :unknown_bundle | %{String.t() => failure()}}
  def load(names) when is_list(names) do
    failures =
      Enum.reduce(names, %{}, fn name, failures ->
        case load(name) do
          :ok -> failures
          # A bundle named inside a list reports its own members, not itself.
          {:error, nested} when is_map(nested) -> Map.merge(failures, nested)
          {:error, reason} -> Map.put(failures, to_string(name), reason)
        end
      end)

    if failures == %{}, do: :ok, else: {:error, failures}
  end

  def load(name) when is_atom(name) do
    case bundle_members(name) do
      {:ok, members} -> load(members)
      :error -> {:error, :unknown_bundle}
      :not_a_bundle -> load(Atom.to_string(name))
    end
  end

  def load(name) when is_binary(name) and name in @plaintext_names, do: :ok

  def load(name) when is_binary(name) do
    case bundle_members(name) do
      {:ok, members} -> load(members)
      :error -> {:error, :unknown_bundle}
      :not_a_bundle -> Native.load_language_by_name(name)
    end
  end

  @bundle_prefixes ["bundle_", "bundle-"]

  @doc false
  # Compares normalized strings rather than `String.to_atom/1` on the caller's
  # name: atoms are never garbage collected, so a name reaching this from a
  # request would grow the atom table without bound.
  def bundle_members(name) do
    case name |> to_string() |> strip_bundle_prefix() do
      nil -> :not_a_bundle
      suffix -> find_bundle(normalize_bundle(suffix))
    end
  end

  defp find_bundle(wanted) do
    Enum.find_value(bundles(), :error, fn {bundle, members} ->
      if bundle_key(bundle) == wanted, do: {:ok, members}
    end)
  end

  defp bundle_key(bundle) do
    bundle |> Atom.to_string() |> strip_bundle_prefix() |> normalize_bundle()
  end

  defp strip_bundle_prefix(string) do
    Enum.find_value(@bundle_prefixes, fn prefix ->
      case String.split(string, prefix, parts: 2) do
        ["", suffix] -> suffix
        _ -> nil
      end
    end)
  end

  defp normalize_bundle(nil), do: nil
  defp normalize_bundle(suffix), do: suffix |> String.downcase() |> String.replace("-", "_")

  @doc false
  def expand_bundles(names) do
    names
    |> Enum.reduce_while({:ok, []}, fn name, {:ok, acc} ->
      case bundle_members(name) do
        {:ok, members} -> {:cont, {:ok, Enum.reverse(members, acc)}}
        :error -> {:halt, {:error, {:unknown_bundle, to_string(name)}}}
        :not_a_bundle -> {:cont, {:ok, [to_string(name) | acc]}}
      end
    end)
    |> case do
      {:ok, reversed} -> {:ok, reversed |> Enum.reverse() |> Enum.uniq()}
      error -> error
    end
  end

  @doc """
  Resolves a name, path or source to a language id, the way highlighting does.

  `name` can be a language id, an alias, a file name or a path. When it does not
  resolve, `source` is checked for an Emacs mode header, a shebang, an HTML
  doctype or an XML declaration. Falls back to `"plaintext"`.

  The counterpart of `Language::guess` in Rust and `guessLanguage()` in
  JavaScript. `Lumis.highlight/2` already calls this when no language is given;
  reach for it directly to label a snippet before deciding what to do with it.

      "elixir" = Lumis.Languages.guess("lib/app.ex")
      "bash" = Lumis.Languages.guess(nil, "#!/usr/bin/env bash")
      "plaintext" = Lumis.Languages.guess(nil, "")

  """
  @spec guess(String.t() | atom() | nil, String.t()) :: String.t()
  def guess(name, source \\ "")

  def guess(nil, source) when is_binary(source), do: Native.guess_language(nil, source)

  def guess(name, source) when is_binary(source) do
    Native.guess_language(to_string(name), source)
  end

  @doc """
  The languages each `:bundle_*` name covers.

  These are the same sets the `@lumis-sh/wasm-bundle-*` packages ship, so naming
  a bundle means the same thing in every runtime.
  """
  @spec bundles() :: %{bundle() => [String.t()]}
  def bundles do
    Map.new(Native.language_bundles(), fn {name, members} ->
      {String.to_atom("bundle_" <> String.replace(name, "-", "_")), members}
    end)
  end

  @doc """
  Downloads and caches languages without loading them.

  Takes the same names `load/1` does, including `:bundle_*`. Returns the paths
  written. `mix lumis.languages.cache` is the entry point; this is the API
  behind it.

  ## Options

    * `:force` — resolve the compatible package range again and replace a
      verified parser
  """
  @spec cache([String.t() | atom()], keyword()) :: {:ok, [String.t()]} | {:error, term()}
  def cache(names, options \\ []) when is_list(names) and is_list(options) do
    force? = Keyword.get(options, :force, false)

    with {:ok, expanded} <- expand_bundles(names) do
      do_cache(expanded, force?)
    end
  end

  defp do_cache(names, force?) do
    names
    |> Enum.reject(&(&1 in @plaintext_names))
    |> Enum.reduce_while({:ok, []}, fn name, {:ok, paths} ->
      case Native.cache_language_by_name(name, force?) do
        {:ok, path} -> {:cont, {:ok, [path | paths]}}
        {:error, reason} -> {:halt, {:error, reason}}
      end
    end)
    |> case do
      {:ok, paths} -> {:ok, paths |> Enum.reverse() |> Enum.uniq()}
      {:error, reason} -> {:error, reason}
    end
  end
end
