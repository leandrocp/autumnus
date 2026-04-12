defmodule MyBlogWeb.PageController do
  use MyBlogWeb, :controller

  def home(conn, _params) do
    render(conn, :home)
  end
end
