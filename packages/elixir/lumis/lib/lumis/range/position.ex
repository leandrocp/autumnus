defmodule Lumis.Range.Position do
  @moduledoc """
  A half-open range expressed as zero-based lines and UTF-8 byte columns.

  An empty range is a point, as in `Lumis.Range.Offset`.
  """

  alias Lumis.Position

  @enforce_keys [:start, :end]
  defstruct [:start, :end]

  @type t :: %__MODULE__{
          start: Position.t(),
          end: Position.t()
        }

  @doc "Creates a source-position range. An empty range is a point."
  @spec new(Position.t(), Position.t()) :: t()
  def new(%Position{} = start, %Position{} = end_position) do
    if {start.line, start.column} <= {end_position.line, end_position.column} do
      %__MODULE__{start: start, end: end_position}
    else
      raise ArgumentError,
            "position range start must not be after its end, got: #{inspect({start, end_position})}"
    end
  end
end
