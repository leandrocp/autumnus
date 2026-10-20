defmodule Lumis.Decoration.RainbowBracket do
  @moduledoc """
  A matched bracket carrying its real zero-based nesting depth.

  Built-in formatters cycle this depth through six theme scopes. Custom
  formatters receive the unwrapped value between `:decoration_start` and
  `:decoration_end` events.
  """

  @enforce_keys [:depth]
  defstruct [:depth]

  @type t :: %__MODULE__{depth: non_neg_integer()}
end

defmodule Lumis.Decoration.DiffWord do
  @moduledoc """
  Text that changed between a diff's removed lines and the added lines that
  replace them.

  Emitted only when a `diff` document is highlighted with `word_diff: true`.
  `:removed` marks text only the removed lines have, `:added` text only the
  added lines have. Built-in formatters give it a stronger shade of the theme's
  `diff.minus` or `diff.plus` background.
  """

  @enforce_keys [:kind]
  defstruct [:kind]

  @type kind :: :removed | :added
  @type t :: %__MODULE__{kind: kind()}
end
