const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const { broadcast } = require("../websocket");
const { log } = require("../services/logger");

// Callback opérateur
router.post("/operator/:operator", async (req, res) => {
  const { reference, status } = req.body;
  const order = await Order.findOne({ reference });
  if (!order) return res.status(404).json({ message: "Order not found" });

  order.status = status === "success" ? "delivered" : "failed";
  await order.save();

  broadcast({ type: "ORDER_UPDATE", order });
  await log("SYSTEM", "OPERATOR_CALLBACK", { orderId: order._id, status });

  res.json({ ok: true });
});

// Callback paiement générique
router.post("/payment", async (req, res) => {
  const { transactionId, status } = req.body;
  if (status === "SUCCESS") {
    await Order.findOneAndUpdate({ transactionId }, { status: "PAID" });
  }
  res.sendStatus(200);
});

// CinetPay callback
router.post("/cinetpay", async (req, res) => {
  const { cpm_trans_id, cpm_result } = req.body;
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
});
module.exports = router;
