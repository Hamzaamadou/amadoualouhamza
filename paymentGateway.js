// backend/services/paymentGateway.js
const Order = require('../models/Order');

/**
 * Payement selon le provider choisi
 * @param {String} provider - nom du provider
 * @param {Object} payload - données de paiement { amount, user, etc. }
 * @returns {Object} { status, reference }
 */
module.exports.pay = async (provider, payload) => {
  switch (provider) {
    case "airtel_money":
    case "moov_money":
    case "zamani_money":
      return mobileWallet(provider, payload);

    case "wave":
    case "momo":
      return externalWallet(provider, payload);

    case "mynita":
    case "amanata":
      return partnerGateway(provider, payload);

    case "card":
      return cardGateway(payload);

    default:
      throw new Error("Provider non supporté");
  }
};

/** Simule un paiement via mobile wallet */
async function mobileWallet(name, p) {
  console.log("Mobile Wallet:", name, p);
  return { status: "pending", reference: Date.now().toString() };
}

/** Simule un paiement via wallet externe */
async function externalWallet(name, p) {
  console.log("External Wallet:", name, p);
  return { status: "success", reference: Date.now().toString() };
}

/** Simule un paiement via partenaire */
async function partnerGateway(name, p) {
  console.log("Partner Gateway:", name, p);
  return { status: "success", reference: Date.now().toString() };
}

/** Simule un paiement par carte bancaire */
async function cardGateway(p) {
  console.log("Card Payment:", p);
  return { status: "success", reference: Date.now().toString() };
}

// --------------------------
// Route Express pour paiement + commande
// --------------------------
const express = require('express');
const router = express.Router();
const { pay } = module.exports;

router.post("/pay-and-order", async (req, res) => {
  try {
    const { provider, order } = req.body;

    // Paiement
    const payment = await pay(provider, {
      amount: order.price,
      user: req.user.phone
    });

    // Création de la commande
    const saved = await Order.create({
      ...order,
      paymentProvider: provider,
      reference: payment.reference,
      paymentStatus: payment.status
    });

    res.json({ order: saved, payment });
  } catch (err) {
    console.error("Erreur paiement + commande:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports.router = router;