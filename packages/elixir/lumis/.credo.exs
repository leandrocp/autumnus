%{
  configs: [
    %{
      name: "default",
      files: %{
        included: ["**/*.{ex,exs}"],
        excluded: [~r"/_build/", ~r"/deps/", ~r"/node_modules/"]
      }
    }
  ]
}
