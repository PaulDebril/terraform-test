const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Charger la configuration de la base de données
let dbConfig;
try {
  const configPath = path.join(__dirname, 'config.json');
  const configFile = fs.readFileSync(configPath, 'utf8');
  const config = JSON.parse(configFile);

  // Utiliser la configuration active (local ou remote)
  const activeEnv = config.database.active || 'local';
  dbConfig = config.database[activeEnv];

  console.log(`📊 Using ${activeEnv} database configuration`);
} catch (error) {
  console.error('❌ Error loading config.json:', error.message);
  dbConfig = null;
}

// Créer le pool de connexion PostgreSQL
let pool = null;
if (dbConfig) {
  pool = new Pool(dbConfig);
  pool.on('error', (err) => {
    console.error('❌ Unexpected error on idle client', err);
  });
}

// Route /hello
app.get('/hello', (req, res) => {
  res.json({
    message: 'Hello from the backend!',
    timestamp: new Date().toISOString(),
    emoji: '👋'
  });
});

// Route /health
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: 'Backend API',
    emoji: '✅'
  });
});

// Route /api/check-db - Tester la connexion à la base de données
app.get('/api/check-db', async (req, res) => {
  if (!pool) {
    return res.status(500).json({
      success: false,
      error: 'Database configuration not loaded',
      message: 'Le fichier config.json est manquant ou invalide'
    });
  }

  let client;
  try {
    // Tester la connexion
    client = await pool.connect();

    // Exécuter une requête de test
    const result = await client.query('SELECT NOW() as current_time, version() as pg_version');

    // Récupérer les données des tables
    const usersResult = await client.query('SELECT * FROM users ORDER BY id LIMIT 10');
    const productsResult = await client.query('SELECT * FROM products ORDER BY id LIMIT 10');

    // Compter le nombre total d'enregistrements
    const userCountResult = await client.query('SELECT COUNT(*) as count FROM users');
    const productCountResult = await client.query('SELECT COUNT(*) as count FROM products');

    res.json({
      success: true,
      message: 'Connexion à la base de données réussie!',
      connection: {
        timestamp: result.rows[0].current_time,
        version: result.rows[0].pg_version,
        host: dbConfig.host,
        database: dbConfig.database
      },
      data: {
        users: {
          count: parseInt(userCountResult.rows[0].count),
          data: usersResult.rows
        },
        products: {
          count: parseInt(productCountResult.rows[0].count),
          data: productsResult.rows
        }
      }
    });
  } catch (error) {
    console.error('❌ Database error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Erreur lors de la connexion à la base de données',
      details: {
        code: error.code,
        hint: error.hint
      }
    });
  } finally {
    if (client) {
      client.release();
    }
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
