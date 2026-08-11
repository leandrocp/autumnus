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

  @doc false
  def bundle_members(name) do
    string = to_string(name)

    if String.starts_with?(string, ["bundle_", "bundle-"]) do
      key =
        String.to_atom(
          "bundle_" <> String.replace(binary_part(string, 7, byte_size(string) - 7), "-", "_")
        )

      case Map.fetch(bundles(), key) do
        {:ok, members} -> {:ok, members}
        :error -> :error
      end
    else
      :not_a_bundle
    end
  end

  @doc false
  def expand_bundles(names) do
    Enum.reduce_while(names, {:ok, []}, fn name, {:ok, acc} ->
      case bundle_members(name) do
        {:ok, members} -> {:cont, {:ok, acc ++ members}}
        :error -> {:halt, {:error, {:unknown_bundle, to_string(name)}}}
        :not_a_bundle -> {:cont, {:ok, acc ++ [to_string(name)]}}
      end
    end)
    |> case do
      {:ok, expanded} -> {:ok, Enum.uniq(expanded)}
      error -> error
    end
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
