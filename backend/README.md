# Backend API Node.js

API simple avec Express qui expose deux endpoints.

## Installation

```bash
npm install
```

## Démarrage

```bash
npm start
```

Le serveur démarrera sur `http://localhost:3001`

## Routes disponibles

### GET /hello
Retourne un message de bienvenue.

**Réponse:**
```json
{
  "message": "Hello from the backend!",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "emoji": "👋"
}
```

### GET /health
Retourne l'état de santé du serveur.

**Réponse:**
```json
{
  "status": "healthy",
  "uptime": 123.456,
  "timestamp": "2024-01-01T12:00:00.000Z",
  "service": "Backend API",
  "emoji": "✅"
}
```

## Technologies

- Node.js
- Express
- CORS
