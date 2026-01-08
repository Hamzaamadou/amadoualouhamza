// =================== BACKEND ===================
const express = require('express');
const mongoose = require('mongoose');
const app = express();
app.use(express.json());

// MongoDB Order Schema
const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  operator: { type: String, enum: ['airtel','moov','zamani'], required: true },
  plan: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending','delivered','failed'], default: 'pending' },
  queued: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});
const Order = mongoose.model('Order', orderSchema);

// Connexion MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/aha_topup', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB connecté"))
.catch(err => console.error("❌ Erreur MongoDB :", err));

// Endpoint pour créer une commande (offline ou online)
app.post('/orders/create', async (req, res) => {
  try {
    const order = await Order.create({ ...req.body, queued: false, status: "pending" });
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));


// =================== FRONTEND (à mettre dans un fichier .js côté navigateur) ===================

// Queue pour commandes hors ligne
let queue = JSON.parse(localStorage.getItem("queue") || "[]");

function queueOrder(order) {
  queue.push(order);
  localStorage.setItem("queue", JSON.stringify(queue));
}

// Dès que l'utilisateur est en ligne, on envoie toutes les commandes
window.addEventListener("online", async () => {
  for (const order of queue) {
    try {
      await fetch("/orders/create", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": "Bearer " + localStorage.getItem("token")
        },
        body: JSON.stringify(order)
      });
    } catch (err) {
      console.error("Erreur en envoyant la commande:", err);
    }
  }
  queue = [];
  localStorage.setItem("queue", "[]");
});