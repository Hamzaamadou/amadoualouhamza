// backend/routes/admin-analytics.js
const express = require("express");
const Order = require("../models/Order");
const { requireRole } = require("../utils/roles");

const router = express.Router();

// ✅ Statistiques globales, par opérateur et journalières
router.get("/stats", requireRole("admin","superadmin"), async (req,res) => {
  try {
    // Statistiques globales
    const globalAgg = await Order.aggregate([
      { $match: { status: "delivered" }},
      { $group: {
        _id: null,
        totalRevenue: { $sum: "$price" },
        totalOrders: { $sum: 1 }
      }}
    ]);
    const global = globalAgg[0] || { totalRevenue: 0, totalOrders: 0 };

    // Par opérateur
    const byOperator = await Order.aggregate([
      { $match: { status: "delivered" }},
      { $group: {
        _id: "$operator",
        revenue: { $sum: "$price" },
        count: { $sum: 1 }
      }}
    ]);

    // Statistiques journalières
    const daily = await Order.aggregate([
      { $match: { status: "delivered" }},
      { $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }},
        revenue: { $sum: "$price" },
        count: { $sum: 1 }
      }},
      { $sort: { "_id": 1 }}
    ]);

    res.json({ global, byOperator, daily });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;