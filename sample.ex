defmodule MyMod do
  @moduledoc """
  This is a built-in attribute on an example module.
  """

  @my_data 100 # This is a custom attribute.
  IO.inspect(@my_data) #=> 100
end
