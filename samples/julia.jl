module Demo

struct Greeter
    name::String
end

function greet(g::Greeter)
    println("Hello, $(g.name)!")
end

greet(Greeter("Lumis"))

end
