terraform {
  required_version = ">= 1.6.0"
}

resource "random_pet" "name" {
  length = 2
}
