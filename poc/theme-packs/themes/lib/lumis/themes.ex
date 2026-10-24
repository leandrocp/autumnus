defmodule Lumis.Themes do
  @moduledoc false

  def installed_dirs do
    for path <- :code.get_path(),
        dir = to_string(path),
        Path.basename(dir) == "ebin",
        root = Path.dirname(dir),
        pack?(Path.basename(root)),
        themes = Path.join([root, "priv", "themes"]),
        File.dir?(themes),
        uniq: true,
        do: themes
  end

  defp pack?(name) do
    Enum.any?(~w(lumis_themes lumis_themes_copyleft), fn app ->
      name == app or String.starts_with?(name, app <> "-")
    end)
  end
end
