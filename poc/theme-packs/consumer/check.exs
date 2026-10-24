ExUnit.start(autorun: false)

defmodule ThemePacksPoCTest do
  use ExUnit.Case, async: false

  @markdown "```rust\nfn main() { let answer = 42; }\n```"
  @copyleft Mix.env() in [:copyleft, :both]
  @both Mix.env() in [:both_default, :both]

  defp options(formatter) do
    [
      render: [full_info_string: true],
      syntax_highlight: [engine: :lumis, opts: [formatter: formatter]]
    ]
  end

  test "the default pack is transitive, with no Lumis application required" do
    assert Application.spec(:lumis_themes) != nil
    assert Code.ensure_loaded?(Lumis) == @both
    assert length(Lumis.Themes.installed_dirs()) == if(@copyleft, do: 2, else: 1)
    assert is_binary(MDEx.to_html!(@markdown))

    for render <- [&MDEx.to_html!/2, &MDExNative.Comrak.markdown_to_html/2] do
      html = render.(@markdown, options({:html_inline, theme: "onedark"}))
      assert html =~ "#282c34"
      assert html =~ "#c678dd"
    end
  end

  test "the dependency controls raw names, multi-theme options and code-fence names" do
    formatter = {:html_inline, theme: "ayu_dark"}
    multi = {:html_multi_themes, themes: [light: "catppuccin_latte", dark: "ayu_dark"]}
    fence = "```rust theme=ayu_dark\nfn main() {}\n```"

    for render <- [&MDEx.to_html!/2, &MDExNative.Comrak.markdown_to_html/2] do
      if @copyleft do
        assert render.(@markdown, options(formatter)) =~ "#0b0e14"
        html = render.(@markdown, options(multi))
        assert html =~ "ayu_dark"
        assert html =~ "catppuccin_latte"
        assert render.(fence, options({:html_inline, theme: "onedark"})) =~ "#0b0e14"
      else
        assert_raise ArgumentError, fn -> render.(@markdown, options(multi)) end
        refute render.(@markdown, options(formatter)) =~ "#0b0e14"
        refute render.(fence, options({:html_inline, theme: "onedark"})) =~ "#0b0e14"
      end
    end
  end
end

if Mix.env() in [:both_default, :both], do: Code.require_file("check_both.exs", __DIR__)

result = ExUnit.run()
if result.failures != 0, do: System.halt(1)
