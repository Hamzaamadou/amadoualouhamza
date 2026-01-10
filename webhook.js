const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const { broadcast } = require("../websocket");
const { log } = require("../services/logger");

/**
 * 📡 Callback opérateur (livraison crédit / data)
 */
router.post("/operator/:operator", async (req, res) => {
  try {
    const { reference, status } = req.body;
    const { operator } = req.params;

    if (!reference || !status) {
      return res.status(400).json({ message: "Invalid payload" });
    }

    const order = await Order.findOne({ reference });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status === "success" ? "delivered" : "failed";
    await order.save();

    broadcast({ type: "ORDER_UPDATE", order });

    await log("SYSTEM", "OPERATOR_CALLBACK", {
      operator,
      orderId: order._id,
      status
    });

    res.json({ ok: true });
  } catch (err) {
    console.error("Operator webhook error:", err);
    res.sendStatus(500);
  }
});

/**
 * 💳 Callback paiement générique
 */
router.post("/payment", async (req, res) => {
  try {
    const { transactionId, status } = req.body;
    if (!transactionId) return res.sendStatus(400);

    if (status === "SUCCESS") {
      await Order.findOneAndUpdate(
        { transactionId },
        { status: "PAID" }
      );
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("Payment webhook error:", err);
    res.sendStatus(500);
  }
});

/**
 * 💰 Callback officiel CinetPay
 */
router.post("/cinetpay", async (req, res) => {
  try {
    const { cpm_trans_id, cpm_result } = req.body;
    if (!cpm_trans_id) return res.sendStatus(400);

    const order = await Order.findById(cpm_trans_id);
    if (!order) return res.sendStatus(404);

    if (cpm_result === "00") {
      order.paymentStatus = "success";
      order.status = "paid";
    } else {
      order.paymentStatus = "failed";
    }

    await order.save();
    res.send("OK");
  } catch (err) {
    console.error("CinetPay webhook error:", err);
    res.sendStatus(500);
  }
});

module.exports = router;
