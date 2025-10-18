# Projet Full Stack - Next.js + Node.js

Application full stack avec un frontend Next.js et un backend Node.js/Express, entièrement dockerisée.

## Structure du projet

```
.
├── frontend/              # Application Next.js (React + TypeScript)
│   ├── src/
│   │   ├── app/          # Pages de l'application
│   │   └── config/       # Configuration API centralisée
│   ├── Dockerfile        # Image Docker du frontend
│   └── package.json
├── backend/              # API Node.js avec Express
│   ├── index.js         # Point d'entrée de l'API
│   ├── Dockerfile       # Image Docker du backend
│   └── package.json
├── docker-compose.yml   # Orchestration des services
└── .env.example         # Variables d'environnement exemple
```

## Démarrage rapide

### Option 1: Avec Docker (Recommandé)

**Prérequis**: Docker et Docker Compose installés

```bash
# Démarrer tous les services
docker-compose up --build

# Ou en mode détaché (background)
docker-compose up -d --build
```

Les services seront accessibles sur:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001

Pour arrêter les services:
```bash
docker-compose down
```

Pour voir les logs:
```bash
docker-compose logs -f
```

### Option 2: En mode développement local

#### 1. Démarrer le Backend (Port 3001)

```bash
cd backend
npm install
npm start
```

Le backend sera accessible sur `http://localhost:3001`

#### 2. Démarrer le Frontend (Port 3000)

Dans un nouveau terminal:

```bash
cd frontend
npm install
npm run dev
```

Le frontend sera accessible sur `http://localhost:3000`

## Configuration

### Variables d'environnement

Le projet utilise une configuration centralisée via [frontend/src/config/api.js](frontend/src/config/api.js).

**Pour le développement local**, vous pouvez créer un fichier `.env.local` dans le dossier `frontend`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**Pour Docker**, les variables sont définies dans [docker-compose.yml](docker-compose.yml).

## Fonctionnalités

### Backend API

Le backend expose deux endpoints:

- **GET /hello** - Retourne un message de bienvenue avec timestamp et emoji
- **GET /health** - Retourne l'état de santé du serveur (status, uptime, service info)

**Health Check**: Le backend inclut un health check Docker qui vérifie l'endpoint `/health` toutes les 30 secondes.

### Frontend

Le frontend Next.js affiche un dashboard moderne qui:
- Appelle automatiquement les deux routes backend au chargement
- Affiche les réponses dans des cartes stylisées avec effet glassmorphism
- Permet de rafraîchir les données avec un bouton
- Gère les états de chargement avec spinners animés
- Affiche des messages d'erreur clairs si le backend est inaccessible
- Utilise une configuration API centralisée avec timeout
- Design moderne avec Tailwind CSS (dégradés violet/rose, animations, responsive)

### Configuration API centralisée

Le frontend utilise un module de configuration centralisé ([frontend/src/config/api.js](frontend/src/config/api.js)) qui permet:
- Gestion centralisée des URLs d'endpoints
- Helper `getApiUrl()` pour construire les URLs
- Helper `fetchWithTimeout()` pour les requêtes avec timeout (10s par défaut)
- Configuration flexible via variables d'environnement

## Architecture Docker

### Backend
- Image: `node:20-alpine` (légère)
- Port exposé: 3001
- Health check intégré
- Mode production avec dependencies optimisées

### Frontend
- Build multi-stage pour optimiser la taille de l'image
- Next.js standalone mode pour production
- Port exposé: 3000
- Dépend du backend (attend que le health check passe)

### Network
- Les services communiquent via un réseau bridge nommé `app-network`
- Le frontend accède au backend via `http://backend:3001` à l'intérieur du réseau Docker
- Exposition externe via `localhost:3000` et `localhost:3001`

## Commandes Docker utiles

```bash
# Rebuild sans cache
docker-compose build --no-cache

# Voir les conteneurs en cours d'exécution
docker-compose ps

# Logs d'un service spécifique
docker-compose logs -f frontend
docker-compose logs -f backend

# Restart un service
docker-compose restart frontend

# Supprimer tous les conteneurs, volumes et images
docker-compose down -v --rmi all

# Accéder au shell d'un conteneur
docker-compose exec backend sh
docker-compose exec frontend sh
```

## Technologies utilisées

### Backend
- Node.js 20
- Express
- CORS
- Docker

### Frontend
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Docker (multi-stage build)

### DevOps
- Docker
- Docker Compose
- Health checks
- Standalone builds
