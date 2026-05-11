terraform {
  required_version = "1.15.2"

  cloud {
    organization = "example_123123123"

    workspaces {
      name = "teamspace-ECSInfra"
    }
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
     cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }
}

provider "aws" {
  region     = "ap-northeast-2"
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}
