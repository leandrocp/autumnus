defmodule Lumis.Theme do
  @moduledoc """
  A Neovim theme.

  Contains the name, appearance, and a map of highlight `Lumis.Theme.Style`'s.

  Lumis bundles the most popular themes from the Neovim community,
  you can see the full list with `Lumis.available_themes/0` and
  then fetch one of the bundled themes with `Lumis.Theme.get/1`.

  Or check out all the [available themes](https://docs.rs/lumis/latest/lumis/#themes-available).

  ## Example

      %Lumis.Theme{
         name: "github_light",
         appearance: :light,
         revision: "fe70a27afefa6e10db4a59262d31f259f702fd6a",
         highlights: %{
           "function.macro" => %Lumis.Theme.Style{
             fg: "#6639ba",
             bg: nil,
             bold: false,
             italic: false,
             text_decoration: %Lumis.Theme.TextDecoration{
               underline: :solid,
               strikethrough: false
             }
           },
           ...
         }
      }

  """

  @type appearance :: :light | :dark

  @css_options_schema [
    enable_italic: [
      type: :boolean,
      default: true,
      doc: "Whether italic theme styles should be emitted."
    ],
    selector_prefix: [
      type: :string,
      default: "",
      doc: "Prefix prepended to every generated selector."
    ],
    pre_selector: [
      type: :string,
      default: "pre.lumis",
      doc: "Selector used for the `<pre>` code block rule. Defaults to `pre.lumis`."
    ],
    scope_tokens: [
      type: :boolean,
      default: false,
      doc:
        "When true, token selectors are scoped under `:pre_selector`, so `.keyword` becomes `.lumis .keyword` if `pre_selector: \".lumis\"`."
    ],
    background: [
      type: {:or, [:string, nil]},
      default: nil,
      doc: "Background override for the base code block rule."
    ],
    base_rules: [
      type: {:list, {:tuple, [:string, :string]}},
      default: [],
      doc: "Extra `{property, value}` declarations appended to the base code block rule."
    ]
  ]

  @typedoc "A Neovim theme with name, appearance (:light or :dark), revision, and highlight styles."
  @type t :: %Lumis.Theme{
          name: String.t(),
          appearance: appearance(),
          revision: String.t(),
          highlights: %{String.t() => Lumis.Theme.Style.t()}
        }

  defstruct name: nil, appearance: nil, revision: nil, highlights: %{}

  @doc """
  Builds CSS for a Lumis theme.

  Accepts a bundled theme name or a `Lumis.Theme` struct. Use this with the
  `:html_linked` formatter when you need to embed CSS, scope selectors, or
  customize the base code block rule.

  ## Options

  #{NimbleOptions.docs(@css_options_schema)}

  ## Examples

      iex> Lumis.Theme.build_css!("github_light") =~ "pre.lumis"
      true

      iex> Lumis.Theme.build_css!("github_dark", selector_prefix: ~s(html[data-theme="dark"] )) =~ ~s(html[data-theme="dark"] pre.lumis)
      true

      iex> Lumis.Theme.build_css!("github_light", pre_selector: ".lumis", scope_tokens: true) =~ ".lumis .keyword"
      true

  """
  @spec build_css(String.t() | t(), keyword()) :: {:ok, String.t()} | {:error, term()}
  def build_css(theme, options \\ []) when is_list(options) do
    with {:ok, options} <- build_css_options(options) do
      case do_build_css(theme, options) do
        :error -> {:error, :not_found}
        css when is_binary(css) -> {:ok, css}
      end
    end
  end

  @doc """
  Builds CSS for a Lumis theme, raising on errors.

  See `build_css/2` for options.
  """
  @spec build_css!(String.t() | t(), keyword()) :: String.t()
  def build_css!(theme, options \\ []) do
    case build_css(theme, options) do
      {:ok, css} -> css
      {:error, reason} -> raise ArgumentError, "could not build theme CSS: #{inspect(reason)}"
    end
  end

  @doc """
  Get a theme by name.
  """
  @spec get(String.t(), any()) :: Lumis.Theme.t() | nil
  def get(name, default \\ nil) when is_binary(name) do
    case Lumis.Native.get_theme(name) do
      :error -> default
      theme -> theme
    end
  end

  defp do_build_css(name, options) when is_binary(name) do
    Lumis.Native.theme_css_from_name(name, options)
  end

  defp do_build_css(%Lumis.Theme{} = theme, options) do
    Lumis.Native.theme_css_from_theme(theme, options)
  end

  defp build_css_options(options) do
    options
    |> NimbleOptions.validate(@css_options_schema)
    |> case do
      {:ok, options} -> {:ok, Map.new(options)}
      {:error, error} -> {:error, error}
    end
  end

  @doc """
  Load a theme from a JSON file.
  """
  @spec from_file(String.t()) :: {:ok, Lumis.Theme.t()} | {:error, term()}
  def from_file(path) when is_binary(path) do
    case Lumis.Native.build_theme_from_file(path) do
      :error -> {:error, :invalid_theme_file}
      theme -> {:ok, theme}
    end
  end

  @doc """
  Load a theme from a JSON string.
  """
  @spec from_json(String.t()) :: {:ok, Lumis.Theme.t()} | {:error, term()}
  def from_json(json_string) when is_binary(json_string) do
    case Lumis.Native.build_theme_from_json_string(json_string) do
      :error -> {:error, :invalid_json}
      theme -> {:ok, theme}
    end
  end
end

defmodule Lumis.Theme.TextDecoration do
  @moduledoc """
  Text decoration settings for a highlight style.

  Contains the underline style and strikethrough flag.
  """

  @typedoc """
  Text decoration with underline style and strikethrough.

  The underline style can be one of:
  - `nil` - no underline
  - `:solid` - solid underline
  - `:wavy` - wavy/curly underline (undercurl)
  - `:double` - double underline
  - `:dotted` - dotted underline
  - `:dashed` - dashed underline
  """
  @type t :: %Lumis.Theme.TextDecoration{
          underline: nil | :solid | :wavy | :double | :dotted | :dashed,
          strikethrough: boolean()
        }

  defstruct underline: nil, strikethrough: false
end

defmodule Lumis.Theme.Style do
  @moduledoc """
  A highlight style.

  Contains the colors and styles of each highlight of a theme.
  """

  @typedoc "A highlight style with foreground/background colors and text decorations."
  @type t :: %Lumis.Theme.Style{
          fg: nil | String.t(),
          bg: nil | String.t(),
          bold: boolean(),
          italic: boolean(),
          text_decoration: Lumis.Theme.TextDecoration.t()
        }

  defstruct fg: nil,
            bg: nil,
            bold: false,
            italic: false,
            text_decoration: %Lumis.Theme.TextDecoration{}
end
