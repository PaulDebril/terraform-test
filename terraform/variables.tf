variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "eu-central-1"
}

variable "ami_id" {
  description = "AMI ID for EC2 instance"
  type        = string
  default     = "ami-0444794b421ec32e4" # Amazon Linux 2 AMI (HVM) - eu-central-1
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t2.micro"
}

variable "key_name" {
  description = "Name of the SSH key pair"
  type        = string
  default     = "deployer-key"
}

variable "instance_name" {
  description = "Name tag for the EC2 instance"
  type        = string
  default     = "web-server"
}

variable "github_username" {
  description = "GitHub username for GHCR"
  type        = string
  default     = "pauldebril"
}

variable "github_token" {
  description = "GitHub Personal Access Token for GHCR"
  type        = string
  sensitive   = true
}

variable "docker_tag" {
  description = "Docker image tag to deploy"
  type        = string
  default     = "latest"
}
