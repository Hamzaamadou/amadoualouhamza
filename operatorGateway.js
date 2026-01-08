// backend/services/operatorGateway.js
const Order = require('../models/Order');
const { log } = require('../services/logger');
const { broadcast } = require('../websocket');

/**
 * Envoi d'un USSD pour achat de forfait
 * @param {String} operator - 'airtel', 'moov', 'zamani'
 * @param {String|Number} plan - forfait choisi
 * @param {String} number - numéro bénéficiaire
 * @returns {Object} { success:Boolean, ussd:String }
 */
module.exports.sendUSSD = async (operator, plan, number) => {
  console.log(`Envoi USSD ${operator} plan ${plan} pour ${number}`);
  return { success: true, ussd: `*141*${plan}#` };
};

/**
 * Génère le code USSD pour crédit mobile
 * @param {String} operator
 * @param {String} phone
 * @param {Number} amount
 * @returns {String} USSD code
 */
module.exports.sendCredit = async (operator, phone, amount) => {
  if (operator === 'airtel') return `*141*2*${phone}*${amount}#`;
  if (operator === 'moov') return `*155*1*${phone}*${amount}#`;
  if (operator === 'zamani') return `#144*${phone}*${amount}#`;
  throw new Error("Opérateur non supporté");
};

/**
 * Envoi d’un top-up via API simulée
 * @param {String} operator
 * @param {Object} payload - données de la commande
 * @returns {Object} { status:String, reference:String }
 */
module.exports.sendTopup = async (operator, payload) => {
  switch (operator) {
    case 'airtel': return simulateApi('Airtel', payload);
    case 'moov': return simulateApi('Moov', payload);
    case 'zamani': return simulateApi('Zamani', payload);
    default: throw new Error('Opérateur non supporté');
  }
};

/**
 * Simule l’appel API d’un opérateur
 */
async function simulateApi(name, payload) {
  console.log(`API ${name} TopUp`, payload);
  return { status: 'success', reference: Date.now().toString() };
}

/**
 * Exemple de route pour créer et livrer une commande
 */
const express = require('express');
const router = express.Router();

router.post('/create', async (req, res) => {
  try {
    const order = await Order.create(req.body);

    const api = await module.exports.sendTopup(order.operator, order);

    order.status = 'delivered';
    order.reference = api.reference;
    await order.save();

    broadcast({ type: 'ORDER_UPDATE', order });
    await log(req.user.phone, 'ORDER_DELIVERED', { id: order._id });

    res.json(order);
  } catch (err) {
    console.error('Erreur lors de la création de la commande:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports.router = router;