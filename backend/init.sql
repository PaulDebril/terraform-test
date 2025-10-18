-- Script d'initialisation de la base de données
-- Ce script est exécuté automatiquement au démarrage de PostgreSQL

-- Création de la table users
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Création de la table products
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertion de données de test pour users
INSERT INTO users (name, email) VALUES
    ('Alice Dupont', 'alice.dupont@example.com'),
    ('Bob Martin', 'bob.martin@example.com'),
    ('Claire Lefebvre', 'claire.lefebvre@example.com'),
    ('David Bernard', 'david.bernard@example.com'),
    ('Emma Rousseau', 'emma.rousseau@example.com');

-- Insertion de données de test pour products
INSERT INTO products (name, description, price, stock) VALUES
    ('Ordinateur Portable', 'Laptop puissant pour le développement', 999.99, 15),
    ('Souris Sans Fil', 'Souris ergonomique Bluetooth', 29.99, 50),
    ('Clavier Mécanique', 'Clavier RGB pour gaming', 149.99, 25),
    ('Écran 27 pouces', 'Moniteur 4K UHD', 399.99, 10),
    ('Webcam HD', 'Webcam 1080p pour visioconférence', 79.99, 30),
    ('Casque Audio', 'Casque avec réduction de bruit', 199.99, 20);

-- Affichage des données insérées
SELECT 'Users créés:' as info;
SELECT * FROM users;

SELECT 'Products créés:' as info;
SELECT * FROM products;
