%{
  configs: [
    %{
      name: "default",
      files: %{
        included: ["**/*.{ex,exs}"],
        excluded: [~r"/_build/", ~r"/deps/", ~r"/node_modules/"]
      },
      checks: %{
        extra: [
          {Credo.Check.Refactor.CyclomaticComplexity, max_complexity: 20}
        ]
      }
    }
  ]
}
