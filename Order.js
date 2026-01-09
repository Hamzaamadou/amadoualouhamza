// routes/orders.js
import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = Router();

router.post("/create", async (req, res) => {
  const { userId, operator, plan, price } = req.body;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Vérification du solde
      const wallet = await tx.wallet.findUnique({ where: { userId } });
      if (!wallet || wallet.balance < price) {
        throw new Error("Solde insuffisant");
      }

      // 2. Débit du compte
      await tx.wallet.update({
        where: { userId },
        data: { balance: { decrement: price } }
      });

      // 3. Création de la commande
      return await tx.order.create({
        data: { userId, operator, plan, price, status: "pending" }
      });
    });

    res.json({ success: true, order: result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

export default router;
