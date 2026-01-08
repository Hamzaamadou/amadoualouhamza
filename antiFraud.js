// backend/routes/secureOrder.js
const express = require("express");
const router = express.Router();
const Order = require("../models/Order");

/**
 * Service anti-fraude
 */
async function checkFraud(user, payload) {
  // Limite sur les dernières 24h
  const since = new Date(Date.now() - 24 * 3600 * 1000);

  // Statistiques journalières de l'utilisateur
  const daily = await Order.aggregate([
    { $match: { userPhone: user.phone, createdAt: { $gt: since } } },
    { $group: { _id: null, total: { $sum: "$price" }, count: { $sum: 1 } } }
  ]);

  const stats = daily[0] || { total: 0, count: 0 };

  // Limites journalières
  if (stats.total + payload.price > 100000)
    return "Limite journalière dépassée";

  if (stats.count > 40)
    return "Trop d’opérations aujourd’hui";

  // Vérifie doublons récents (2 minutes)
  const duplicate = await Order.findOne({
    beneficiary: payload.beneficiary,
    plan: payload.plan,
    createdAt: { $gt: new Date(Date.now() - 120000) }
  });

  if (duplicate) return "Opération suspecte (doublon)";

  return null;
}

/**
 * Vérification simple des limites
 */
function simpleCheck(phone, amount, history = []) {
  if (amount > 100000) return false;
  if (history.length > 10) return false;
  return true;
}

/**
 * Route sécurisée pour créer une commande
 */
router.post("/secure-order", async (req, res) => {
  try {
    const reason = await checkFraud(req.user, req.body);

    if (reason) return res.status(429).json({ message: reason });

    // Ici : paiement + création de la commande
    const order = new Order({
      userPhone: req.user.phone,
      operator: req.body.operator,
      plan: req.body.plan,
      beneficiary: req.body.beneficiary,
      price: req.body.price,
      status: "pending",
    });

    await order.save();

    res.json({ success: true, message: "Commande validée", order });
  } catch (err) {
    console.error("Erreur secure-order:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;