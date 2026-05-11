variable "aws_region" {
  default = "ap-northeast-2"
}

variable "project" {
  default = "myapp"
}

variable "container_image" {
  description = "ECR image URI"
  type        = string
}

variable "container_port" {
  default = 3000
}

variable "desired_count" {
  default = 2
}

variable "secrets_arn" {
  type = string
}

variable "cloudflare_zone_id" {
  type      = string
  default = "9a345989fd581079d2d436196d57d37b"
  sensitive = true
}

variable "cloudflare_api_token" {
  type      = string
  sensitive = true
}