// backend/routes/orders.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const operatorGateway = require('../services/operatorGateway');
const logger = require('../services/logger');
const { io } = require('../websocket'); // si websocket exporte l'instance io

// ===== Modèle Order =====
const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  operator: { type: String, enum: ['airtel','moov','zamani'], required: true },
  plan: { type: String },
  phone: { type: String, required: true },
  type: { type: String, enum: ['DATA','CREDIT'], default: 'CREDIT' },
  amount: { type: Number, required: true },
  price: { type: Number },
  status: { type: String, enum: ['PENDING','DELIVERED','FAILED'], default: 'PENDING' },
  createdAt: { type: Date, default: Date.now }
});
const Order = mongoose.model('Order', orderSchema);

// ===== Création d'une commande =====
router.post('/', async (req, res) => {
  try {
    const { userId, operator, plan, amount, phone } = req.body;

    if (!userId || !operator || !phone || !amount)
      return res.status(400).json({ success:false, message:"Champs manquants" });

    const order = new Order({ userId, operator, plan, amount, phone });
    await order.save();

    // Envoi USSD via le service
    const result = await operatorGateway.sendUSSD(operator, plan, phone);

    order.status = result.success ? 'DELIVERED' : 'FAILED';
    await order.save();

    // Log de l'action
    await logger.logAction(userId, 'order_created', { orderId: order._id, operator, plan });

    // Émission WebSocket pour mise à jour en temps réel
    if(io) io.emit('order:created', order);
    if(order.status === 'DELIVERED' && io) io.emit('order:delivered', order);

    res.json({ success:true, order });
  } catch (err) {
    console.error("Erreur création commande :", err);
    res.status(500).json({ success:false, message:"Erreur serveur" });
  }
});

// ===== Liste des commandes (exemple) =====
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).limit(100);
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success:false, message:"Erreur serveur" });
  }
});

module.exports = router;
