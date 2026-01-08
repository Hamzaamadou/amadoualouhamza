// backend/monitoring/metrics-server.js
const express = require('express');
const client = require('prom-client');

// 1️⃣ Collecte automatique des métriques par défaut (CPU, mémoire, event loop…)
client.collectDefaultMetrics();

// 2️⃣ Compteur pour les commandes
const orderCounter = new client.Counter({
  name: "orders_total",   // nom de la métrique
  help: "Nombre total de commandes créées"
});

// 3️⃣ Incrémenter le compteur (exemple : à placer dans ton code de création de commande)
function incrementOrderCounter() {
  orderCounter.inc(); // augmente de 1 à chaque nouvelle commande
}

// 4️⃣ Serveur Express pour exposer les métriques
const app = express();

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

// 5️⃣ Lancer le serveur metrics
app.listen(9090, () => console.log('📊 Metrics server running on port 9090'));

// 6️⃣ Export pour utilisation dans d'autres modules
module.exports = { orderCounter, incrementOrderCounter, client };