#[derive(Debug, Clone, Copy)]
struct Point {
    x: i32,
    y: i32,
}

fn distance_squared(point: Point) -> i32 {
    point.x.pow(2) + point.y.pow(2)
}

fn main() {
    println!("{}", distance_squared(Point { x: 3, y: 4 }));
}
