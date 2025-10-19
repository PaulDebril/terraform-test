# ========================================
# Database Instance Outputs
# ========================================
output "database_instance_id" {
  description = "ID of the database EC2 instance"
  value       = aws_instance.database.id
}

output "database_public_ip" {
  description = "Public IP address of the database instance"
  value       = aws_instance.database.public_ip
}

output "database_private_ip" {
  description = "Private IP address of the database instance"
  value       = aws_instance.database.private_ip
}

output "database_ssh_command" {
  description = "SSH command to connect to database instance"
  value       = "ssh -i ${local_file.private_key.filename} ec2-user@${aws_instance.database.public_ip}"
}

# ========================================
# Backend Instance Outputs
# ========================================
output "backend_instance_id" {
  description = "ID of the backend EC2 instance"
  value       = aws_instance.backend.id
}

output "backend_public_ip" {
  description = "Public IP address of the backend instance"
  value       = aws_instance.backend.public_ip
}

output "backend_private_ip" {
  description = "Private IP address of the backend instance"
  value       = aws_instance.backend.private_ip
}

output "backend_api_url" {
  description = "Backend API URL"
  value       = "http://${aws_instance.backend.public_ip}:3001"
}

output "backend_ssh_command" {
  description = "SSH command to connect to backend instance"
  value       = "ssh -i ${local_file.private_key.filename} ec2-user@${aws_instance.backend.public_ip}"
}

# ========================================
# Frontend Instance Outputs
# ========================================
output "frontend_instance_id" {
  description = "ID of the frontend EC2 instance"
  value       = aws_instance.frontend.id
}

output "frontend_public_ip" {
  description = "Public IP address of the frontend instance"
  value       = aws_instance.frontend.public_ip
}

output "frontend_url" {
  description = "Frontend application URL"
  value       = "http://${aws_instance.frontend.public_ip}"
}

output "frontend_ssh_command" {
  description = "SSH command to connect to frontend instance"
  value       = "ssh -i ${local_file.private_key.filename} ec2-user@${aws_instance.frontend.public_ip}"
}

# ========================================
# General Outputs
# ========================================
output "ssh_private_key_path" {
  description = "Path to the SSH private key"
  value       = local_file.private_key.filename
}

output "application_summary" {
  description = "Summary of all application endpoints"
  value = <<-EOT

  ========================================
  Résumé des points d'accès de l'application
  ========================================

  Frontend:  http://${aws_instance.frontend.public_ip}
  Backend:   http://${aws_instance.backend.public_ip}:3001
  Database:  ${aws_instance.database.public_ip}:5432

  ========================================
  Les commandes SSH pour accéder aux instances
  ========================================

  Database:  ssh -i ${local_file.private_key.filename} ec2-user@${aws_instance.database.public_ip}
  Backend:   ssh -i ${local_file.private_key.filename} ec2-user@${aws_instance.backend.public_ip}
  Frontend:  ssh -i ${local_file.private_key.filename} ec2-user@${aws_instance.frontend.public_ip}

  ========================================
  Les commandes pour tester les services
  ========================================

  Backend Health:  curl http://${aws_instance.backend.public_ip}:3001/health
  Database Check:  curl http://${aws_instance.backend.public_ip}:3001/api/check-db

  ========================================
  Logs docker des services
  ========================================

  # Database logs
  ssh -i ${local_file.private_key.filename} ec2-user@${aws_instance.database.public_ip} "sudo cat /var/log/user-data.log"

  # Backend logs
  ssh -i ${local_file.private_key.filename} ec2-user@${aws_instance.backend.public_ip} "sudo docker logs backend"

  # Frontend logs
  ssh -i ${local_file.private_key.filename} ec2-user@${aws_instance.frontend.public_ip} "sudo docker logs frontend"

  ========================================
  EOT
}
