defmodule Lumis.Annotation do
  @moduledoc """
  A caller-provided semantic range consumed by a formatter.

  Ranges use either absolute UTF-8 byte offsets or zero-based lines and UTF-8
  byte columns. `properties` stays as an Elixir term and is passed unchanged
  to custom formatters.
  """

  @enforce_keys [:range, :properties]
  defstruct [:range, :properties]

  @typedoc "A half-open offset or source-position range."
  @type range :: Lumis.Range.Offset.t() | Lumis.Range.Position.t()

  @typedoc "A semantic source range with caller-owned properties."
  @type t(properties) :: %__MODULE__{
          range: range(),
          properties: properties
        }

  @typedoc "An annotation materialized to an offset range for formatter events."
  @type resolved_t(properties) :: %__MODULE__{
          range: Lumis.Range.Offset.t(),
          properties: properties
        }

  @doc """
  Creates an annotation for a non-empty offset or source-position range.

  Source bounds and UTF-8 character boundaries are checked when the annotation
  is used to highlight a specific source.

  This annotation marks only `price` in a one-line source:

      iex> source = "let total = price;"
      iex> annotation = Lumis.Annotation.new(Lumis.Range.Offset.new(12, 17), "search-match")
      iex> binary_part(source, annotation.range.start, annotation.range.end - annotation.range.start)
      "price"

  When passed in highlighting options, a custom formatter receives
  `{:annotation_start, annotation}` before `price` and `:annotation_end` after
  it.
  """
  @spec new(range(), properties) :: t(properties) when properties: term()
  def new(%Lumis.Range.Offset{} = range, properties) do
    %__MODULE__{range: range, properties: properties}
  end

  def new(%Lumis.Range.Position{} = range, properties) do
    %__MODULE__{range: range, properties: properties}
  end

  def new(range, _properties) do
    raise ArgumentError,
          "annotation requires a Lumis.Range.Offset or Lumis.Range.Position, got: #{inspect(range)}"
  end
end
