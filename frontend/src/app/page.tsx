'use client';

import { useState, useEffect } from 'react';

// Déclaration TypeScript pour window.ENV_CONFIG
declare global {
  interface Window {
    ENV_CONFIG: {
      VITE_API_URL: string;
    };
  }
}

interface HelloResponse {
  message: string;
  timestamp: string;
  emoji: string;
}

interface HealthResponse {
  status: string;
  uptime: number;
  timestamp: string;
  service: string;
  emoji: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  stock: number;
  created_at: string;
}

interface DbCheckResponse {
  success: boolean;
  message: string;
  connection: {
    timestamp: string;
    version: string;
    host: string;
    database: string;
  };
  data: {
    users: {
      count: number;
      data: User[];
    };
    products: {
      count: number;
      data: Product[];
    };
  };
  error?: string;
}

export default function Home() {
  const [helloData, setHelloData] = useState<HelloResponse | null>(null);
  const [healthData, setHealthData] = useState<HealthResponse | null>(null);
  const [dbData, setDbData] = useState<DbCheckResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [dbLoading, setDbLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dbError, setDbError] = useState<string | null>(null);
  const [apiUrl, setApiUrl] = useState<string>('');

  useEffect(() => {
    // Récupérer l'URL de l'API depuis window.ENV_CONFIG
    if (typeof window !== 'undefined' && window.ENV_CONFIG) {
      setApiUrl(window.ENV_CONFIG.VITE_API_URL);
    }
  }, []);

  const fetchData = async () => {
    if (!apiUrl) return;

    setLoading(true);
    setError(null);

    try {
      const [helloResponse, healthResponse] = await Promise.all([
        fetch(`${apiUrl}/hello`),
        fetch(`${apiUrl}/health`)
      ]);

      if (!helloResponse.ok || !healthResponse.ok) {
        throw new Error('Erreur lors de la récupération des données');
      }

      const helloJson = await helloResponse.json();
      const healthJson = await healthResponse.json();

      setHelloData(helloJson);
      setHealthData(healthJson);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (apiUrl) {
      fetchData();
    }
  }, [apiUrl]);

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours}h ${minutes}m ${secs}s`;
  };

  const testDatabaseConnection = async () => {
    if (!apiUrl) return;

    setDbLoading(true);
    setDbError(null);

    try {
      const response = await fetch(`${apiUrl}/api/check-db`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Erreur lors de la connexion à la base de données');
      }

      setDbData(data);
    } catch (err) {
      setDbError(err instanceof Error ? err.message : 'Une erreur est survenue');
      setDbData(null);
    } finally {
      setDbLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            Dashboard API
          </h1>
          <p className="text-gray-300 text-lg">
            Connexion au backend Node.js
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8 bg-red-500/10 border border-red-500 rounded-lg p-4">
            <p className="text-red-400 text-center">⚠️ {error}</p>
            <p className="text-gray-400 text-sm text-center mt-2">
              Assurez-vous que le serveur backend est démarré sur le port 3001
            </p>
          </div>
        )}

        {/* Cards Container */}
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-8">
          {/* Hello Card */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl hover:transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Hello Endpoint</h2>
              <span className="text-4xl">{helloData?.emoji || '👋'}</span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
              </div>
            ) : helloData ? (
              <div className="space-y-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Message</p>
                  <p className="text-white text-lg font-medium">{helloData.message}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Timestamp</p>
                  <p className="text-purple-300 font-mono text-sm">
                    {new Date(helloData.timestamp).toLocaleString('fr-FR')}
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          {/* Health Card */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl hover:transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Health Check</h2>
              <span className="text-4xl">{healthData?.emoji || '✅'}</span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
              </div>
            ) : healthData ? (
              <div className="space-y-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Status</p>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                    <p className="text-green-400 text-lg font-medium capitalize">{healthData.status}</p>
                  </div>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Service</p>
                  <p className="text-white font-medium">{healthData.service}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Uptime</p>
                  <p className="text-blue-300 font-mono">{formatUptime(healthData.uptime)}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Last Check</p>
                  <p className="text-purple-300 font-mono text-sm">
                    {new Date(healthData.timestamp).toLocaleString('fr-FR')}
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Database Section */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-white">Test de Connexion Base de Données</h2>
              <button
                onClick={testDatabaseConnection}
                disabled={dbLoading}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {dbLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Test en cours...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    🗄️ TESTER LA CONNEXION BDD
                  </span>
                )}
              </button>
            </div>

            {/* Database Error */}
            {dbError && (
              <div className="mb-6 bg-red-500/10 border border-red-500 rounded-lg p-4">
                <p className="text-red-400">❌ {dbError}</p>
              </div>
            )}

            {/* Database Connection Info */}
            {dbData && dbData.success && (
              <div className="space-y-6">
                {/* Connection Details */}
                <div className="bg-green-500/10 border border-green-500 rounded-lg p-4">
                  <p className="text-green-400 font-bold text-lg mb-2">✅ {dbData.message}</p>
                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-gray-400 text-sm">Host</p>
                      <p className="text-white font-mono">{dbData.connection.host}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Database</p>
                      <p className="text-white font-mono">{dbData.connection.database}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-gray-400 text-sm">Version PostgreSQL</p>
                      <p className="text-cyan-300 font-mono text-xs">{dbData.connection.version}</p>
                    </div>
                  </div>
                </div>

                {/* Users Table */}
                <div className="bg-white/5 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-white mb-4">
                    👥 Utilisateurs ({dbData.data.users.count})
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/20">
                          <th className="text-left text-gray-400 text-sm py-2 px-4">ID</th>
                          <th className="text-left text-gray-400 text-sm py-2 px-4">Nom</th>
                          <th className="text-left text-gray-400 text-sm py-2 px-4">Email</th>
                          <th className="text-left text-gray-400 text-sm py-2 px-4">Créé le</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dbData.data.users.data.map((user) => (
                          <tr key={user.id} className="border-b border-white/10 hover:bg-white/5">
                            <td className="text-purple-300 py-3 px-4">{user.id}</td>
                            <td className="text-white py-3 px-4">{user.name}</td>
                            <td className="text-cyan-300 font-mono text-sm py-3 px-4">{user.email}</td>
                            <td className="text-gray-400 text-sm py-3 px-4">
                              {new Date(user.created_at).toLocaleDateString('fr-FR')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Products Table */}
                <div className="bg-white/5 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-white mb-4">
                    🛒 Produits ({dbData.data.products.count})
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/20">
                          <th className="text-left text-gray-400 text-sm py-2 px-4">ID</th>
                          <th className="text-left text-gray-400 text-sm py-2 px-4">Nom</th>
                          <th className="text-left text-gray-400 text-sm py-2 px-4">Prix</th>
                          <th className="text-left text-gray-400 text-sm py-2 px-4">Stock</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dbData.data.products.data.map((product) => (
                          <tr key={product.id} className="border-b border-white/10 hover:bg-white/5">
                            <td className="text-purple-300 py-3 px-4">{product.id}</td>
                            <td className="text-white py-3 px-4">
                              <div>
                                <p className="font-medium">{product.name}</p>
                                <p className="text-gray-400 text-sm">{product.description}</p>
                              </div>
                            </td>
                            <td className="text-green-400 font-bold py-3 px-4">{parseFloat(product.price).toFixed(2)} €</td>
                            <td className="text-cyan-300 py-3 px-4">{product.stock}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Initial State */}
            {!dbData && !dbError && !dbLoading && (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg mb-4">
                  Cliquez sur le bouton ci-dessus pour tester la connexion à la base de données PostgreSQL
                </p>
                <p className="text-gray-500 text-sm">
                  Vous verrez les utilisateurs et produits stockés dans la BDD
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Refresh Button */}
        <div className="text-center">
          <button
            onClick={fetchData}
            disabled={loading}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 px-8 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Chargement...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                🔄 Rafraîchir les données
              </span>
            )}
          </button>
        </div>

        {/* API Info */}
        <div className="mt-16 text-center">
          <div className="inline-block bg-white/5 backdrop-blur-lg rounded-lg px-6 py-3 border border-white/10">
            <p className="text-gray-400 text-sm">
              API Backend: <span className="text-purple-400 font-mono">{apiUrl || 'Chargement...'}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
