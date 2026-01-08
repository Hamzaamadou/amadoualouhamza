// db.js corrigé
import mongoose from 'mongoose'; // Utilisez import au lieu de require

// Connexion à MongoDB
mongoose.connect(
  process.env.MONGO_URI || 'mongodb://localhost:27017/aha_topup',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
)
.then(() => console.log("✅ MongoDB connecté"))
.catch(err => console.error("❌ Erreur MongoDB :", err));

// EXPORT OBLIGATOIRE POUR LE MODULE
export default mongoose;
