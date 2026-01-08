// backend/routes/webhook.js
const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { broadcast } = require('../websocket');
const { log } = require('../services/logger');

// Callback opérateur pour mise à jour de commande
router.post('/operator/:operator', async (req, res) => {
  const { reference, status } = req.body;

  const order = await Order.findOne({ reference });
  if (!order) return res.status(404).json({ message: 'Order not found' });

  order.status = status === 'success' ? 'delivered' : 'failed';
  await order.save();

  broadcast({ type: 'ORDER_UPDATE', order });
  await log('SYSTEM', 'OPERATOR_CALLBACK', { orderId: order._id, status });

  res.json({ ok: true });
});

// Callback pour paiement réussi
router.post('/payment', async (req, res) => {
  const { transactionId, status } = req.body;

  if (status === 'SUCCESS') {
    await Order.findOneAndUpdate(
      { transactionId },
      { status: 'PAID' }
    );
  }

  res.sendStatus(200);
});

module.exports = router;