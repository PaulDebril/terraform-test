# Terraform AWS 3-Tier Architecture

Infrastructure as Code pour déployer une application fullstack sur AWS avec architecture 3-tier (Frontend, Backend, Database).

## 🏗️ Architecture

### 3 instances EC2 séparées :

1. **Frontend** - Serveur web (Next.js / React)
   - Pull l'image Docker : `ghcr.io/pauldebril/frontend:TAG`
   - Ports : 80, 5173
   - Configure automatiquement l'URL du backend

2. **Backend** - API (Node.js + Express)
   - Pull l'image Docker : `ghcr.io/pauldebril/backend:TAG`
   - Port : 3001
   - Configure automatiquement la connexion à la DB

3. **Database** - PostgreSQL
   - Utilise l'image : `postgres:15-alpine`
   - Port : 5432
   - Initialise automatiquement les tables et données

## 📋 Prérequis

1. **Terraform** installé (>= 1.0)
2. **AWS CLI** configuré avec vos credentials
3. **GitHub Personal Access Token** avec permissions `read:packages`

## 🔑 Obtenir un GitHub Token

1. Aller sur https://github.com/settings/tokens
2. Cliquer sur "Generate new token (classic)"
3. Cocher la permission `read:packages`
4. Copier le token généré (commence par `ghp_`)

## 🚀 Déploiement a la main

### 1. Configurer les variables

Copier le fichier d'exemple et le modifier :

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
```

Éditer `terraform.tfvars` et ajouter votre token GitHub :

```hcl
github_username = "pauldebril"
github_token    = "ghp_VotreTOKENici"
docker_tag      = "1835928"  # Hash du commit de votre image Docker
```

### 2. Initialiser Terraform

```bash
terraform init
```

### 3. Vérifier le plan

```bash
terraform plan
```

### 4. Déployer l'infrastructure

```bash
terraform apply
```

Taper `yes` pour confirmer.

**Attendre 3-5 minutes** que les instances démarrent et que les conteneurs Docker soient téléchargés et lancés.

### 5. Voir les outputs

```bash
terraform output application_summary
```

Cela affiche toutes les URLs et commandes SSH.

## Que fait Terraform ?

### Phase 1 : Création de l'infrastructure

1. Génère une paire de clés SSH (sauvegardée dans `deployer-key.pem`)
2. Crée 3 Security Groups (un pour chaque instance)
3. Lance 3 instances EC2 t2.micro

### Phase 2 : Déploiement automatique (user_data)

**Sur l'instance Database :**
- Installe Docker
- Lance PostgreSQL
- Crée les tables `users` et `products`
- Insert des données de test

**Sur l'instance Backend :**
- Installe Docker
- Se connecte à GHCR avec votre token
- Pull l'image `ghcr.io/pauldebril/backend:TAG`
- Crée `config.json` avec l'IP privée de la DB
- Lance le conteneur backend sur le port 3001

**Sur l'instance Frontend :**
- Installe Docker
- Se connecte à GHCR avec votre token
- Pull l'image `ghcr.io/pauldebril/frontend:TAG`
- Crée `config.js` avec l'IP publique du backend
- Lance le conteneur frontend sur les ports 80 et 5173

## 🌐 Communication entre instances

- **Frontend → Backend** : Via IP publique du backend sur le port 3001
- **Backend → Database** : Via IP privée de la DB sur le port 5432
- **User → Frontend** : Via IP publique du frontend sur le port 80/5173

Les Security Groups assurent que :
- La DB accepte les connexions PostgreSQL (5432)
- Le Backend accepte les appels API (3001)
- Le Frontend accepte les connexions HTTP/HTTPS (80/443/5173)
- Toutes les instances acceptent SSH (22)

## 🔍 Vérifier le déploiement

Pour vérifier que tout fonctionne :
Faire :

```bash
terraform output application_summary
```
et tester les URLs du frontend et backend dans votre navigateur ou via `curl`.
