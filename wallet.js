import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = Router();

router.get("/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    // Récupération du wallet
    const wallet = await prisma.wallet.findUnique({
      where: { userId }
    });

    if (!wallet) return res.status(404).json({ message: "Wallet non trouvé" });

    // Total commandes
    const ordersStats = await prisma.order.aggregate({
      where: { userId },
      _sum: { price: true },
      _count: { id: true }
    });

    // Total transactions (si tu as un modèle Transaction)
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

export default router;