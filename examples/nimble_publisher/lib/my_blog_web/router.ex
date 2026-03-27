defmodule MyBlogWeb.Router do
  use MyBlogWeb, :router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_live_flash
    plug :put_root_layout, html: {MyBlogWeb.Layouts, :root}
    plug :protect_from_forgery
    plug :put_secure_browser_headers
  end

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/", MyBlogWeb do
    pipe_through :browser

    get "/", BlogController, :index
    get "/blog", BlogController, :index
    get "/blog/:id", BlogController, :show
  end

  # Other scopes may use custom stacks.
  # scope "/api", MyBlogWeb do
  #   pipe_through :api
  # end
end
