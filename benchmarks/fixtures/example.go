package main

import "fmt"

func main() {
	values := []int{2, 4, 8, 16}
	for index, value := range values {
		fmt.Printf("%d: %d\n", index, value)
	}
}
