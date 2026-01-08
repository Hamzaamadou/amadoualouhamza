// backend/services/offlineQueue.js
const Order = require('../models/Order');

/**
 * Queue en mémoire pour commandes hors ligne côté serveur
 */
let queue = [];

/**
 * Ajouter une commande à la queue serveur
 * @param {Object} orderData - données de la commande
 */
module.exports.addOrder = (orderData) => {
  queue.push(orderData);
};

/**
 * Traiter toutes les commandes en queue côté serveur
 * @param {Object} operatorGateway - service USSD
 * @param {Object} logger - service de logs
 */
module.exports.processQueue = async (operatorGateway, logger) => {
  while(queue.length) {
    const orderData = queue.shift();
    try {
      const order = new Order(orderData);
      const result = await operatorGateway.sendUSSD(order.operator, order.plan, order.number);
      order.status = result.success ? 'delivered' : 'failed';
      await order.save();
      await logger.logAction(order.userId, 'offline_order_processed', { orderId: order._id });
    } catch(err) {
      console.error('Erreur en traitant la commande hors ligne:', err);
      // Réinsérer dans la queue pour retry
      orderData.status = 'failed';
      queue.push(orderData);
    }
  }
};

/* ----------------------------------------------------------- */

// frontend/offlineQueue.js
// Queue côté client (localStorage)
let offlineQueue = JSON.parse(localStorage.getItem("offlineQueue") || "[]");

/**
 * Ajouter une commande hors ligne côté client
 * @param {Object} order
 */
function queueOrder(order) {
  offlineQueue.push(order);
  localStorage.setItem("offlineQueue", JSON.stringify(offlineQueue));
}

/**
 * Envoyer toutes les commandes stockées dès que l'utilisateur est en ligne
 */
async function processQueue() {
  if (!offlineQueue.length) return;

  const token = localStorage.getItem("token");
  for (const order of offlineQueue) {
    try {
      const res = await fetch("/orders/create-offline", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token
        },
        body: JSON.stringify(order)
      });
      if (res.ok) console.log("Commande envoyée:", order);
    } catch(err) {
      console.error("Erreur en envoyant la commande:", err);
    }
  }

  // Vider la queue après envoi
  offlineQueue = [];
  localStorage.setItem("offlineQueue", JSON.stringify([]));
}

// Écoute le retour en ligne
window.addEventListener("online", processQueue);

/* ----------------------------------------------------------- */

// backend/routes/offlineOrders.js
const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// Route pour recevoir les commandes hors ligne
router.post("/create-offline", async (req, res) => {
  try {
    const order = new Order({ ...req.body, status: "pending", queued: true });
    await order.save();
    res.json({ success: true, order });
  } catch(err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

module.exports = router;