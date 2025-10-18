# Backend Dockerfile
FROM node:20-alpine

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm ci --only=production

# Copier le reste des fichiers
COPY . .

# Exposer le port
EXPOSE 3001

# Variables d'environnement par défaut
ENV PORT=3001
ENV NODE_ENV=production

# Démarrer l'application
CMD ["npm", "start"]

LABEL org.opencontainers.image.source="https://github.com/pauldebril/terraform-test"
