import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = Router();

/**
 * @route   POST /orders/create
 * @desc    Crée une commande et débite le wallet de l'utilisateur
 */
router.post("/create", async (req, res) => {
  const { userId, operator, plan, price } = req.body;

  // Validation simple des données entrantes
  if (!userId || !operator || !plan || !price) {
    return res.status(400).json({ 
      success: false, 
      message: "Tous les champs (userId, operator, plan, price) sont obligatoires." 
    });
  }

  try {
    // Utilisation d'une transaction Prisma pour assurer l'atomicité
    const result = await prisma.$transaction(async (tx) => {
      
      // 1. Vérification du solde de l'utilisateur
      const wallet = await tx.wallet.findUnique({ 
        where: { userId: userId } 
      });

      if (!wallet) {
        throw new Error("Portefeuille (wallet) introuvable pour cet utilisateur.");
      }

      if (wallet.balance < price) {
        throw new Error("Solde insuffisant pour effectuer cet achat.");
      }

      // 2. Débit du compte (Wallet)
      const updatedWallet = await tx.wallet.update({
        where: { userId: userId },
        data: { 
          balance: { decrement: price } 
        }
      });

      // 3. Création de la commande dans la base de données
      const newOrder = await tx.order.create({
        data: { 
          userId, 
          operator, 
          plan, 
          price: parseFloat(price), 
          status: "pending" 
        }
      });

      // Retourne les données pour la réponse finale
      return { order: newOrder, newBalance: updatedWallet.balance };
    });

    // Réponse en cas de succès
    res.json({ 
      success: true, 
      message: "Commande créée avec succès",
      data: result 
    });

  } catch (err) {
    // Gestion des erreurs (Solde insuffisant ou erreur technique)
    console.error("❌ Erreur lors de la transaction de commande :", err.message);
    res.status(400).json({ 
      success: false, 
      message: err.message 
    });
  }
});

/**
 * @route   GET /orders/user/:userId
 * @desc    Récupère l'historique des commandes d'un utilisateur
 */
router.get("/user/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const orders = await prisma.order.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: "Erreur lors de la récupération des commandes" });
  }
});
export default router
