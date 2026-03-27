defmodule MyBlog.Blog.Post do
  @enforce_keys [:id, :title, :author, :description, :body, :date]
  defstruct [:id, :title, :author, :description, :body, :date]

  def build(filename, attrs, body) do
    [year, month, day, id] =
      filename
      |> Path.rootname()
      |> Path.split()
      |> List.last()
      |> String.split("-", parts: 4)

    date = Date.from_iso8601!("#{year}-#{month}-#{day}")

    struct!(__MODULE__,
      id: id,
      title: attrs.title,
      author: attrs.author,
      description: attrs.description,
      body: body,
      date: date
    )
  end
end
