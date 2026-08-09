defmodule Lumis.HighlightError do
  defexception [:error]

  @type t() :: %__MODULE__{error: Exception.t() | term()}

  def message(%__MODULE__{error: error}) do
    detail = if is_exception(error), do: Exception.message(error), else: inspect(error)

    """
    error highlighting source code

    got:

      #{detail}
    """
  end
end
