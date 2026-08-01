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

  Each is taken from the first place that has it: `$LUMIS_WASM_PATH/parsers`,
  the cache under `$LUMIS_DATA_DIR`, then the CDN. Bytes are checked against the
  size and digest their package declares before use, and anything that fails is
  discarded rather than trusted, so a corrupted cache repairs itself.

  Concurrent requests for the same uncached language wait for the first rather
  than each downloading it, and loading is global to the VM: the process that
  pays for a language pays once, for every process after it.
  """

  alias Lumis.Native

  @plaintext_names ~w(plaintext text txt plain)

  @doc """
  Loads one language, a list of them, or `:all`, verifying each parser first.

  Highlighting loads on demand, so this is an optimization rather than a
  requirement: call it at startup to move the download off the first request.
  Already-loaded languages return immediately. Loading stops at the first
  failure and returns it.

      :ok = Lumis.Languages.load("elixir")
      :ok = Lumis.Languages.load(["elixir", :html])
      :ok = Lumis.Languages.load(:all)

  `:all` fetches every language in the catalog, which is rarely what a
  deployment wants; prefer naming the ones a document can contain.
  """
  @spec load(:all | String.t() | atom() | [String.t() | atom()]) :: :ok | {:error, term()}
  def load(:all), do: load(all_names())

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

  def load(name) when is_binary(name), do: Native.load_language_by_name(name)

  @doc """
  Downloads and caches languages without loading them.

  Returns the paths written. `mix lumis.languages.cache` is the entry point;
  this is the API behind it.

  ## Options

    * `:directory` — cache into this directory instead of `$LUMIS_DATA_DIR`
    * `:force` — download again even when a verified copy is already cached
  """
  @spec cache([String.t() | atom()], keyword()) :: {:ok, [String.t()]} | {:error, term()}
  def cache(names, options \\ []) when is_list(names) and is_list(options) do
    directory = Keyword.get(options, :directory)
    force? = Keyword.get(options, :force, false)

    names
    |> Enum.reduce_while({:ok, []}, fn name, {:ok, paths} ->
      case Native.cache_language_by_name(to_string(name), directory, force?) do
        {:ok, path} -> {:cont, {:ok, [path | paths]}}
        {:error, reason} -> {:halt, {:error, reason}}
      end
    end)
    |> case do
      {:ok, paths} -> {:ok, paths |> Enum.reverse() |> Enum.uniq()}
      {:error, reason} -> {:error, reason}
    end
  end

  @doc """
  Every language id in the catalog, whether or not its parser is available.
  """
  @spec all_names() :: [String.t()]
  def all_names, do: Enum.map(Native.language_package_refs(), & &1.id)
end
