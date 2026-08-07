defmodule Lumis.BenchmarkRuntime do
  @moduledoc """
  Points Lumis at the parsers `mise run prepare:languages` laid out, so nothing
  in a timed run depends on the network.
  """

  def configure(repo_dir) do
    packages = Path.join(repo_dir, "target/benchmarks/language-packages")

    unless File.dir?(Path.join(packages, "parsers")) do
      raise "run `mise run -C benchmarks prepare:languages` first, no parsers at #{packages}"
    end

    # One store directory, so the prepared packages are what the runtime reads
    # and where it writes compiled modules. Nothing in a timed run reaches the
    # network as long as every language a scenario names is prepared.
    #
    # After Application.start, so the NIF store is configured here rather than
    # from config; it is built lazily on first use, which has not happened yet.
    true = Lumis.Native.configure_store(packages)
  end
end
