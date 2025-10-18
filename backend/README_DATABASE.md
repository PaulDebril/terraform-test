# Configuration de la Base de Données PostgreSQL

## Vue d'ensemble

Ce projet utilise PostgreSQL comme base de données. La configuration permet de basculer facilement entre une base de données locale (Docker) et une base de données distante (EC2).

## Configuration

### Fichier `config.json`

Le fichier `config.json` contient deux configurations :

```json
{
  "database": {
    "local": {
      "host": "postgres",
      "port": 5432,
      "database": "testdb",
      "user": "admin",
      "password": "admin123"
    },
    "remote": {
      "host": "YOUR_EC2_IP_HERE",
      "port": 5432,
      "database": "testdb",
      "user": "admin",
      "password": "admin123"
    },
    "active": "local"
  }
}
```

### Basculer entre Local et Remote

Pour changer de base de données, modifiez la valeur de `"active"` :
- `"active": "local"` - Utilise la base de données Docker locale
- `"active": "remote"` - Utilise la base de données sur EC2

### Configuration EC2

Pour utiliser une base de données EC2 :

1. Modifiez la section `"remote"` dans `config.json` :
```json
"remote": {
  "host": "12.34.56.78",  // IP de votre instance EC2
  "port": 5432,
  "database": "testdb",
  "user": "admin",
  "password": "votre_mot_de_passe"
}
```

2. Changez `"active"` à `"remote"`

3. Assurez-vous que le Security Group EC2 autorise les connexions sur le port 5432

## Structure de la Base de Données

### Table `users`
- `id` : Identifiant unique (SERIAL PRIMARY KEY)
- `name` : Nom de l'utilisateur (VARCHAR 100)
- `email` : Email unique (VARCHAR 100)
- `created_at` : Date de création (TIMESTAMP)

### Table `products`
- `id` : Identifiant unique (SERIAL PRIMARY KEY)
- `name` : Nom du produit (VARCHAR 200)
- `description` : Description (TEXT)
- `price` : Prix (DECIMAL 10,2)
- `stock` : Quantité en stock (INTEGER)
- `created_at` : Date de création (TIMESTAMP)

## Données de Test

Le fichier `init.sql` contient :
- 5 utilisateurs de test
- 6 produits de test

Ces données sont automatiquement insérées au premier démarrage de PostgreSQL.

## API Endpoints

### GET `/api/check-db`

Teste la connexion à la base de données et récupère les données.

**Réponse Success (200):**
```json
{
  "success": true,
  "message": "Connexion à la base de données réussie!",
  "connection": {
    "timestamp": "2025-01-15T10:30:00.000Z",
    "version": "PostgreSQL 16.x...",
    "host": "postgres",
    "database": "testdb"
  },
  "data": {
    "users": {
      "count": 5,
      "data": [...]
    },
    "products": {
      "count": 6,
      "data": [...]
    }
  }
}
```

**Réponse Error (500):**
```json
{
  "success": false,
  "error": "message d'erreur",
  "message": "Erreur lors de la connexion à la base de données"
}
```

## Démarrage

### Avec Docker Compose

```bash
docker-compose up -d
```

PostgreSQL démarrera automatiquement et :
- Créera la base de données `testdb`
- Exécutera le script `init.sql`
- Sera accessible sur le port 5432

### Accès direct à PostgreSQL

```bash
docker exec -it postgres-db psql -U admin -d testdb
```

### Commandes SQL utiles

```sql
-- Lister les tables
\dt

-- Voir les utilisateurs
SELECT * FROM users;

-- Voir les produits
SELECT * FROM products;

-- Compter les enregistrements
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM products;
```

## Sécurité

⚠️ **IMPORTANT** : Les identifiants actuels sont pour le développement uniquement !

Pour la production :
1. Changez les mots de passe dans `config.json`
2. Utilisez des variables d'environnement au lieu de fichiers JSON
3. Ne commitez JAMAIS `config.json` avec des vrais identifiants
4. Ajoutez `config.json` au `.gitignore` si vous y mettez des secrets
