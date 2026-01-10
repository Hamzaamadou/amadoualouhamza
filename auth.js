const express = require("express");
const router = express.Router();

/**
 * POST /auth/login
 */
router.post("/login", async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ message: "Téléphone requis" });
  }

  res.json({
    success: true,
    token: "fake-jwt-token",
    user: {
      id: "USER_" + Date.now(),
      phone
    }
  });
});

/**
 * POST /auth/register
 */
router.post("/register", async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ message: "Téléphone requis" });
  }

  res.json({
    success: true,
    message: "Utilisateur créé",
    userId: "USER_" + Date.now()
  });
});

module.exports = router;
