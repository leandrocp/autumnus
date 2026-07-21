User = Data.define(:name, :active)

users = [
  User.new("Ada", true),
  User.new("Grace", false)
]

active_names = users.filter(&:active).map(&:name)
puts active_names.join(", ")
