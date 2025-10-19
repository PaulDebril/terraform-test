# On crée une paire de clés SSH pour accéder aux instances EC2
resource "tls_private_key" "deployer" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

# Crée la clé publique dans AWS
resource "aws_key_pair" "deployer" {
  key_name   = var.key_name
  public_key = tls_private_key.deployer.public_key_openssh
}

# On sauvegarde la clé privée localement
resource "local_file" "private_key" {
  content         = tls_private_key.deployer.private_key_pem
  filename        = "${path.module}/${var.key_name}.pem"
  file_permission = "0400"
}

# ========================================
# EC2 Instance - Database (PostgreSQL)
# ========================================
resource "aws_instance" "database" {
  ami             = var.ami_id
  instance_type   = var.instance_type
  security_groups = [aws_security_group.database.name]
  key_name        = aws_key_pair.deployer.key_name

  tags = {
    Name = "database-server"
    Role = "database"
  }

  user_data = <<-EOF
              #!/bin/bash
              set -e
              exec > >(tee /var/log/user-data.log)
              exec 2>&1

              echo "Starting Database EC2 initialization at $(date)"

              # Update and install Docker
              yum update -y
              yum install -y docker
              systemctl start docker
              systemctl enable docker
              usermod -aG docker ec2-user

              sleep 5

              echo "Starting PostgreSQL..."
              docker run -d \
                --name postgres \
                -e POSTGRES_DB=testdb \
                -e POSTGRES_USER=admin \
                -e POSTGRES_PASSWORD=admin123 \
                -p 5432:5432 \
                --restart unless-stopped \
                postgres:15-alpine

              # Wait for PostgreSQL to be ready
              sleep 15

              echo "Initializing database..."
              docker exec postgres psql -U admin -d testdb -c "
              CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
              );

              CREATE TABLE IF NOT EXISTS products (
                id SERIAL PRIMARY KEY,
                name VARCHAR(200) NOT NULL,
                price DECIMAL(10,2) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
              );

              INSERT INTO users (name, email) VALUES
                ('John Doe', 'john@example.com'),
                ('Jane Smith', 'jane@example.com')
              ON CONFLICT (email) DO NOTHING;

              INSERT INTO products (name, price) VALUES
                ('Product A', 19.99),
                ('Product B', 29.99)
              ON CONFLICT DO NOTHING;
              "

              echo "Database server ready at $(date)"
              EOF
}

# ========================================
# EC2 Instance - Backend (API)
# ========================================
resource "aws_instance" "backend" {
  ami             = var.ami_id
  instance_type   = var.instance_type
  security_groups = [aws_security_group.backend.name]
  key_name        = aws_key_pair.deployer.key_name

  depends_on = [aws_instance.database]

  tags = {
    Name = "backend-server"
    Role = "backend"
  }

  user_data = <<-EOF
              #!/bin/bash
              set -e
              exec > >(tee /var/log/user-data.log)
              exec 2>&1

              echo "Starting Backend EC2 initialization at $(date)"

              # Update and install Docker
              yum update -y
              yum install -y docker
              systemctl start docker
              systemctl enable docker
              usermod -aG docker ec2-user

              sleep 5

              echo "Logging in to GitHub Container Registry..."
              echo "${var.github_token}" | docker login ghcr.io -u ${var.github_username} --password-stdin

              echo "Pulling backend image..."
              docker pull ghcr.io/${var.github_username}/backend:${var.docker_tag}

              echo "Creating backend config..."
              mkdir -p /opt/app/backend
              cat > /opt/app/backend/config.json << 'CONFIG'
              {
                "database": {
                  "local": {
                    "host": "${aws_instance.database.private_ip}",
                    "port": 5432,
                    "database": "testdb",
                    "user": "admin",
                    "password": "admin123"
                  },
                  "remote": {
                    "host": "${aws_instance.database.private_ip}",
                    "port": 5432,
                    "database": "testdb",
                    "user": "admin",
                    "password": "admin123"
                  },
                  "active": "local"
                }
              }
              CONFIG

              echo "Starting backend..."
              docker run -d \
                --name backend \
                -p 3001:3001 \
                -v /opt/app/backend/config.json:/app/config.json:ro \
                --restart unless-stopped \
                ghcr.io/${var.github_username}/backend:${var.docker_tag}

              echo "Backend server ready at $(date)"
              EOF
}

# ========================================
# EC2 Instance - Frontend (Web)
# ========================================
resource "aws_instance" "frontend" {
  ami             = var.ami_id
  instance_type   = var.instance_type
  security_groups = [aws_security_group.frontend.name]
  key_name        = aws_key_pair.deployer.key_name

  depends_on = [aws_instance.backend]

  tags = {
    Name = "frontend-server"
    Role = "frontend"
  }

  user_data = <<-EOF
              #!/bin/bash
              set -e
              exec > >(tee /var/log/user-data.log)
              exec 2>&1

              echo "Starting Frontend EC2 initialization at $(date)"

              # Update and install Docker
              yum update -y
              yum install -y docker
              systemctl start docker
              systemctl enable docker
              usermod -aG docker ec2-user

              sleep 5

              echo "Logging in to GitHub Container Registry..."
              echo "${var.github_token}" | docker login ghcr.io -u ${var.github_username} --password-stdin

              echo "Pulling frontend image..."
              docker pull ghcr.io/${var.github_username}/frontend:${var.docker_tag}

              echo "Creating frontend config..."
              mkdir -p /opt/app/frontend
              cat > /opt/app/frontend/config.js << 'CONFIG'
              window.ENV_CONFIG = {
                VITE_API_URL: 'http://${aws_instance.backend.public_ip}:3001',
              };
              CONFIG

              echo "Starting frontend..."
              docker run -d \
                --name frontend \
                -p 80:3000 \
                -p 5173:5173 \
                -v /opt/app/frontend/config.js:/app/public/config.js:ro \
                --restart unless-stopped \
                ghcr.io/${var.github_username}/frontend:${var.docker_tag}

              echo "Frontend server ready at $(date)"
              EOF
}

# On met à jour un fichier local avec les adresses IP des instances
resource "null_resource" "update_local_config" {
  depends_on = [
    aws_instance.database,
    aws_instance.backend,
    aws_instance.frontend
  ]

  triggers = {
    database_ip = aws_instance.database.public_ip
    backend_ip  = aws_instance.backend.public_ip
    frontend_ip = aws_instance.frontend.public_ip
  }

  provisioner "local-exec" {
    command = <<-EOC
      cat > ${path.module}/instances.txt << 'INFO'
Database IP (private): ${aws_instance.database.private_ip}
Database IP (public):  ${aws_instance.database.public_ip}
Backend IP (private):  ${aws_instance.backend.private_ip}
Backend IP (public):   ${aws_instance.backend.public_ip}
Frontend IP (public):  ${aws_instance.frontend.public_ip}

Frontend URL: http://${aws_instance.frontend.public_ip}
Backend API:  http://${aws_instance.backend.public_ip}:3001
Database:     ${aws_instance.database.public_ip}:5432
INFO
      cat ${path.module}/instances.txt
    EOC
  }
}
