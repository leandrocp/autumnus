defmodule MyBlog.Blog do
  @moduledoc """
  Publishes and queries the example application's Markdown posts.
  """

  alias MyBlog.Blog.Post

  use NimblePublisher,
    build: Post,
    from: Application.app_dir(:my_blog, "priv/posts/**/*.md"),
    as: :posts,
    html_converter: MyBlog.Blog.Markdown,
    highlighters: []

  @posts Enum.sort_by(@posts, & &1.date, {:desc, Date})

  def all_posts, do: @posts

  def get_post_by_id!(id) do
    Enum.find(@posts, &(&1.id == id)) ||
      raise "post with id=#{id} not found"
  end
end
