const express = require("express");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

/**
 * 📊 Statistiques complètes par userId
 */
router.get("/stats/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const wallet = await prisma.wallet.findUnique({
      where: { userId }
    });

    if (!wallet) {
      return res.status(404).json({ message: "Wallet non trouvé" });
    }

    const ordersStats = await prisma.order.aggregate({
      where: { userId },
      _sum: { price: true },
      _count: { id: true }
    });

    const transactionsStats = await prisma.transaction.aggregate({
      where: { userId },
      _sum: { amount: true },
      _count: { id: true }
    });

    res.json({
      wallet,
      orders: {
        totalAmount: ordersStats._sum.price || 0,
        totalOrders: ordersStats._count.id || 0
      },
      transactions: {
        totalAmount: transactionsStats._sum.amount || 0,
        totalTransactions: transactionsStats._count.id || 0
      }
    });
  } catch (err) {
    console.error("Erreur récupération wallet :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

/**
 * 💰 Solde du wallet
 */
router.get("/balance/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const wallet = await prisma.wallet.findUnique({
      where: { userId }
    });

    res.json({
      balance: wallet ? wallet.balance : 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
