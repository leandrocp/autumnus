defmodule Lumis.Range.Offset do
  @moduledoc """
  A half-open range expressed as absolute offsets measured in UTF-8 bytes.

  An empty range is a point: it marks a position rather than covering text, so
  a formatter receives `:annotation_start` immediately followed by
  `:annotation_end` there. A blank line has nothing to cover but is still
  somewhere a review comment can land.
  """

  @enforce_keys [:start, :end]
  defstruct [:start, :end]

  @type t :: %__MODULE__{
          start: non_neg_integer(),
          end: non_neg_integer()
        }

  @doc "Creates an offset range measured in UTF-8 bytes. An empty range is a point."
  @spec new(non_neg_integer(), non_neg_integer()) :: t()
  def new(start, end_offset)
      when is_integer(start) and start >= 0 and is_integer(end_offset) and end_offset >= start do
    %__MODULE__{start: start, end: end_offset}
  end

  def new(start, end_offset) do
    raise ArgumentError,
          "offset range start must not be after its end, got: #{inspect({start, end_offset})}"
  end
end
