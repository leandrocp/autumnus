System.put_env("LUMIS_BUILD", "1")

Mix.install([
  {:phoenix_playground, "~> 0.1.8"},
  {:req, "~> 0.5"},
  {:rustler, "~> 0.29"},
  {:lumis, path: Path.expand("../../../packages/elixir/lumis", __DIR__)}
])

defmodule LumisDemoLive do
  use Phoenix.LiveView

  @source_url "https://raw.githubusercontent.com/mrdoob/three.js/6365c1a0af6a32ed45f99712197555fee2f4b24a/examples/webgpu_compute_reduce.html"
  @expected_sha256 "e1b31d91c25e9103931d7e830b9dfb9e075d97c175623e3e44fb3dc3685067af"
  @expected_lines 1397

  @impl true
  def mount(_params, _session, socket) do
    :ok = Lumis.preload_languages(["html", "css", "json", "javascript"])
    source = load_source()

    highlighted =
      Lumis.highlight!(source,
        formatter: {:html_inline, language: "html", theme: "dracula"}
      )

    {:ok, assign(socket, highlighted: highlighted, source_url: @source_url)}
  end

  @impl true
  def render(assigns) do
    ~H"""
    <main>
      <h1>Elixir dynamic parser WASMs</h1>
      <p>
        A real 1,397-line Three.js file with injected CSS, JSON, and JavaScript,
        rendered with <code>html-inline</code>.
      </p>
      <p><a href={@source_url}>Pinned source fixture</a></p>
      {Phoenix.HTML.raw(@highlighted)}
    </main>
    <style>
      body { font-family: system-ui, sans-serif; margin: 2rem; background: #f4f4f5; }
      main { max-width: 960px; margin: 0 auto; }
      section { margin-block: 1.5rem; }
      pre.lumis { overflow-x: auto; padding: 1rem; border-radius: 0.5rem; }
    </style>
    """
  end

  defp load_source do
    source = Req.get!(@source_url).body
    sha256 = :crypto.hash(:sha256, source) |> Base.encode16(case: :lower)
    line_count = source |> String.trim_trailing("\n") |> String.split("\n") |> length()

    @expected_sha256 = sha256
    @expected_lines = line_count
    source
  end
end

PhoenixPlayground.start(live: LumisDemoLive)
