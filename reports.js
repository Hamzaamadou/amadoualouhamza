// backend/routes/report.js
import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import { reportHtml } from "./pdf-template.js";

const prisma = new PrismaClient();
const router = Router();

router.post("/generate", async (req, res) => {
  try {
    const start = new Date(req.body.start);
    const end = new Date(req.body.end);

    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({ error: "Dates invalides" });
    }

    // Récupérer les commandes dans la période
    const orders = await prisma.order.findMany({
      where: { createdAt: { gte: start, lte: end } }
    });

    const totalSales = orders.reduce((sum, o) => sum + o.price, 0);

    // Générer le HTML du rapport
    const html = reportHtml({
      start: start.toDateString(),
      end: end.toDateString(),
      totalOrders: orders.length,
      totalSales
    });

    // S'assurer que le dossier reports existe
    const reportsDir = path.resolve("reports");
    if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir);

    // Générer PDF avec Puppeteer
    const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
    const page = await browser.newPage();
    await page.setContent(html);
    const filePath = path.join(reportsDir, `report-${Date.now()}.pdf`);
    await page.pdf({ path: filePath, format: "A4" });
    await browser.close();

    // Enregistrer dans la base de données
    await prisma.report.create({
      data: { periodStart: start, periodEnd: end, filePath }
    });

    res.json({ success: true, filePath });
  } catch (err) {
    console.error("Erreur génération rapport :", err);
    res.status(500).json({ error: "Impossible de générer le rapport" });
  }
});

export default router;