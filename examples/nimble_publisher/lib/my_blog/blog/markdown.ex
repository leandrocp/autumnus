defmodule MyBlog.Blog.Markdown do
  def convert(_path, body, _attrs, _opts) do
    MDEx.to_html!(body,
      extension: [
        table: true,
        strikethrough: true,
        tasklist: true
      ],
      syntax_highlight: [
        formatter: {:html_inline, theme: "github_light"}
      ]
    )
  end
end
