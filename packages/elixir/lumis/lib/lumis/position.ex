defmodule Lumis.Position do
  @moduledoc """
  A zero-based source position with a UTF-8 byte column.
  """

  @enforce_keys [:line, :column]
  defstruct [:line, :column]

  @type t :: %__MODULE__{
          line: non_neg_integer(),
          column: non_neg_integer()
        }

  @doc "Creates a zero-based source position."
  @spec new(non_neg_integer(), non_neg_integer()) :: t()
  def new(line, column)
      when is_integer(line) and line >= 0 and is_integer(column) and column >= 0 do
    %__MODULE__{line: line, column: column}
  end

  def new(line, column) do
    raise ArgumentError,
          "position requires non-negative integer line and column values, got: #{inspect({line, column})}"
  end
end
