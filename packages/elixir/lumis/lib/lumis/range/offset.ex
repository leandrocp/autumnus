defmodule Lumis.Range.Offset do
  @moduledoc """
  A half-open range expressed as absolute offsets measured in UTF-8 bytes.
  """

  @enforce_keys [:start, :end]
  defstruct [:start, :end]

  @type t :: %__MODULE__{
          start: non_neg_integer(),
          end: pos_integer()
        }

  @doc "Creates a non-empty offset range measured in UTF-8 bytes."
  @spec new(non_neg_integer(), pos_integer()) :: t()
  def new(start, end_offset)
      when is_integer(start) and start >= 0 and is_integer(end_offset) and end_offset > start do
    %__MODULE__{start: start, end: end_offset}
  end

  def new(start, end_offset) do
    raise ArgumentError,
          "offset range start must be before its end, got: #{inspect({start, end_offset})}"
  end
end
