const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { requireRole } = require('../middleware/authMiddleware');
const { generate2FA, verify2FA } = require('../services/twofa');
const { log } = require('../services/logger');

// Activer la 2FA pour un admin
router.post(
  "/enable-2fa",
  requireRole("admin", "superadmin"),
  async (req, res) => {
    try {
      const { base32, ascii } = generate2FA();
      req.user.twofaEnabled = true;
      req.user.twofaSecret = ascii;
      await req.user.save();

      res.json({ success: true, qrcode_secret: base32 });
    } catch (err) {
      console.error("Erreur activation 2FA :", err);
      res.status(500).json({ error: "Impossible d'activer la 2FA" });
    }
  }
);

// Login admin avec vérification mot de passe + 2FA
router.post("/admin-login", async (req, res) => {
  try {
    const { email, password, token } = req.body;

    const user = await User.findOne({ email });

    if (!user || user.role === "user") {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const okPass = await bcrypt.compare(password, user.password);
    if (!okPass) {
      await log(email, "LOGIN_FAILED");
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Vérification 2FA si activée
    if (user.twofaEnabled) {
      if (!verify2FA(user.twofaSecret, token)) {
        await log(email, "2FA_FAILED");
        return res.status(401).json({ message: "Invalid 2FA code" });
      }
    }

    await log(email, "LOGIN_SUCCESS");

    // Générer JWT
    const jwtToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "SECRET",
      { expiresIn: "12h" }
    );

    res.json({ success: true, token: jwtToken });
  } catch (err) {
    console.error("Erreur login admin :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;