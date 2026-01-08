// backend/routes/receipt.js
import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();
const router = Router();

// Fonction pour générer le HTML du reçu
const receiptHtml = (o) => `
<html>
<body style="font-family:Arial">
<h2>Reçu de commande</h2>
<p><b>ID :</b> ${o.id}</p>
<p><b>Bénéficiaire :</b> ${o.beneficiary}</p>
<p><b>Opérateur :</b> ${o.operator}</p>
<p><b>Validité :</b> ${o.validity}</p>
<p><b>Montant :</b> ${o.price} FCFA</p>
<p><b>Statut :</b> ${o.status}</p>
<p><b>Date :</b> ${o.createdAt}</p>
<hr>
<p>AHA TECH — Reçu généré automatiquement</p>
</body></html>
`;

// Endpoint pour générer et télécharger le PDF
router.get("/:orderId/pdf", async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.orderId }
    });

    if (!order) return res.status(404).json({ error: "Commande introuvable" });

    // S'assurer que le dossier receipts existe
    const receiptsDir = path.resolve("receipts");
    if (!fs.existsSync(receiptsDir)) fs.mkdirSync(receiptsDir);

    const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
    const page = await browser.newPage();
    await page.setContent(receiptHtml(order));

    const file = path.join(receiptsDir, `receipt-${order.id}.pdf`);
    await page.pdf({ path: file, format: "A4" });
    await browser.close();

    res.download(file);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de la génération du PDF" });
  }
});

export default router;