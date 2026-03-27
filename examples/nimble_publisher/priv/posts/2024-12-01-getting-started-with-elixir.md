%{
  title: "Getting Started with Elixir",
  author: "Jane Doe",
  description: "A quick introduction to Elixir with syntax-highlighted code examples."
}
---
Elixir is a dynamic, functional language for building scalable applications.

## Pattern Matching

One of the most powerful features in Elixir is pattern matching:

```elixir
defmodule Greeter do
  def hello(%{name: name, age: age}) do
    IO.puts("Hello, #{name}! You are #{age} years old.")
  end

  def hello(%{name: name}) do
    IO.puts("Hello, #{name}!")
  end
end

Greeter.hello(%{name: "Alice", age: 30})
```

## Working with Lists

Elixir provides great tools for working with collections:

```elixir
numbers = [1, 2, 3, 4, 5]

numbers
|> Enum.filter(&(rem(&1, 2) == 0))
|> Enum.map(&(&1 * &1))
|> Enum.sum()
```

## A Simple GenServer

Here is a basic counter implemented as a GenServer:

```elixir
defmodule Counter do
  use GenServer

  def start_link(initial \\ 0) do
    GenServer.start_link(__MODULE__, initial, name: __MODULE__)
  end

  @impl true
  def init(count), do: {:ok, count}

  @impl true
  def handle_call(:get, _from, count), do: {:reply, count, count}

  @impl true
  def handle_cast(:increment, count), do: {:noreply, count + 1}
end
```
