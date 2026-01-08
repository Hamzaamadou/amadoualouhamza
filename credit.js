// backend/routes/credit.js
const express = require('express');
const router = express.Router();
const creditPlans = require('../services/creditPlans');
const Order = require('../models/Order');

// =====================
// Récupération des plans de crédit par opérateur
// =====================
router.get('/:operator', (req, res) => {
  const operator = req.params.operator;
  const plans = creditPlans[operator] || [];
  res.json(plans);
});

// =====================
// Achat de crédit
// =====================
router.post('/buy', async (req, res) => {
  try {
    const { userId, operator, phone, amount, price } = req.body;

    // Validation simple
    if (!userId || !operator || !phone || !amount || !price) {
      return res.status(400).json({ success: false, message: "Champs manquants" });
    }

    // Création de la commande
    const order = await Order.create({
      userId,
      operator,
      phone,
      type: 'CREDIT',
      amount,
      price,
      status: 'PENDING',
      createdAt: new Date()
    });

    res.json({ success: true, order });
  } catch (err) {
    console.error("Erreur achat crédit :", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

module.exports = router;