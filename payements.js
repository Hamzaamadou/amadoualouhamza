const router = require("express").Router();
const pay = require("../payments");
const Order = require("../models/Order");

router.post("/pay", async (req, res) => {
  const { provider, order, customer } = req.body;

  const payment = await pay(provider, {
    amount: order.price,
    transactionId: order._id,
    customer
  });

  await Order.findByIdAndUpdate(order._id, {
    paymentProvider: provider,
    paymentStatus: "pending"
  });

  res.json(payment);
});

module.exports = router;