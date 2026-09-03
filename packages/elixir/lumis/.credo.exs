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
          # Classic McCabe cyclomatic complexity, at the ceiling shared by every
          # project in this family, in Elixir and in JavaScript alike.
          {Credo.Check.Refactor.CyclomaticComplexity, max_complexity: 9}
        ]
      }
    }
  ]
}
