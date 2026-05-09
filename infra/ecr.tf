resource "aws_ecr_repository" "app" {
  name = "portfolio-app"

  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_cloudwatch_log_group" "ecs" {
  name              = "/ecs/portfolio-app"
  retention_in_days = 7
}

resource "aws_cloudwatch_log_group" "ecs" {
  name              = "/ecs/portfolio-app"
  retention_in_days = 7
}