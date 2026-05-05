defmodule Lumis.RainbowBrackets do
  @moduledoc """
  Configuration for rainbow bracket highlighting in the terminal formatter.

  Rainbow brackets color nested bracket pairs `()`, `[]`, `{}`, `<>` with a
  cycling palette based on nesting depth, making it easier to visually match
  opening and closing delimiters.

  ## Default palette

  `rainbow_brackets: true` uses the selected theme's standard rainbow delimiter
  colors when available. `%Lumis.RainbowBrackets{}` customizes the explicit
  color palette.

  ## Example

      # Use defaults
      {:terminal, theme: "dracula", rainbow_brackets: true}

      # Custom colors
      {:terminal, theme: "dracula",
       rainbow_brackets: %Lumis.RainbowBrackets{colors: ["#ff0000", "#00ff00", "#0000ff"]}}
  """

  @enforce_keys [:colors]
  defstruct [:colors]

  @type t :: %__MODULE__{
          colors: [String.t()]
        }

  @doc """
  Returns a `%Lumis.RainbowBrackets{}` with the given custom colors.
  """
  @spec new([String.t()]) :: t()
  def new([]), do: raise(ArgumentError, "Lumis.RainbowBrackets requires at least one color")
  def new(colors) when is_list(colors), do: %__MODULE__{colors: colors}
end
