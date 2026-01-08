// db.js
const mongoose = require('mongoose');

// Connexion à MongoDB avec options et gestion des erreurs
mongoose.connect(
  process.env.MONGO_URI || 'mongodb://localhost:27017/aha_topup',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
)
.then(() => console.log("✅ MongoDB connecté"))
.catch(err => console.error("❌ Erreur MongoDB :", err));

// Exporter mongoose pour l'utiliser dans les modèles
module.exports = mongoose;