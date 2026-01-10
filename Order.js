const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  userId: String,
  operator: String,
  phone: String,
  type: { type: String, enum: ["DATA", "CREDIT"] },
  plan: String,
  amount: Number,
  price: Number,
  status: String,
  paymentStatus: String,
  transactionId: String,
  reference: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Order", OrderSchema);
