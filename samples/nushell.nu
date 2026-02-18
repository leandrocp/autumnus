#!/usr/bin/env nu

# A greeting command with typed parameters
def greet [name: string, --loud(-l)] {
    let message = $"Hello, ($name)!"
    if $loud {
        print ($message | str upcase)
    } else {
        print $message
    }
}

# Custom command with return type
def fibonacci [n: int]: nothing -> list<int> {
    mut a = 0
    mut b = 1
    mut result = []

    for _ in 0..$n {
        $result = ($result | append $a)
        let temp = $a + $b
        $a = $b
        $b = $temp
    }

    $result
}

# Working with tables and pipelines
let users = [
    { name: "Alice", age: 30, role: "admin" }
    { name: "Bob", age: 25, role: "user" }
    { name: "Carol", age: 35, role: "admin" }
]

let admins = $users | where role == "admin" | sort-by age

# File operations and error handling
def process_file [path: string] {
    if ($path | path exists) {
        open $path
            | lines
            | enumerate
            | each { |it| $"($it.index + 1): ($it.item)" }
    } else {
        error make { msg: $"File not found: ($path)" }
    }
}

# Pattern matching
def classify [value: any] -> string {
    match $value {
        null => "nothing"
        true | false => "boolean"
        $x if ($x | describe) == "int" => "integer"
        $x if ($x | describe) == "string" => $"text: ($x)"
        _ => "other"
    }
}

# HTTP request and JSON processing
def fetch_data [url: string] {
    http get $url
        | get data
        | select name email
        | to json
}

greet "World" --loud
fibonacci 10 | each { |n| print $n }
