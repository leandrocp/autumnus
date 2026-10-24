defmodule ThemePacksBothNIFsPoCTest do
  use ExUnit.Case, async: false

  @copyleft Mix.env() == :both

  test "both NIFs discover the same installed themes" do
    expected =
      if @copyleft, do: ~w(ayu_dark catppuccin_latte onedark), else: ~w(catppuccin_latte onedark)

    assert Enum.sort(Enum.map(Lumis.Theme.available(), & &1.name)) == expected

    assert Lumis.Theme.get("ayu_dark") != nil == @copyleft
    assert Lumis.Theme.get("dracula") == nil
    theme = if @copyleft, do: "ayu_dark", else: "onedark"
    background = if @copyleft, do: "#0b0e14", else: "#282c34"

    html =
      Lumis.highlight!("fn main() {}",
        formatter: {:html_inline, language: "rust", theme: theme}
      )

    assert html =~ background
  end
end
