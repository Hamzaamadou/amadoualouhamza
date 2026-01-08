// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Otp = require('../models/Otp');
const jwt = require('jsonwebtoken');
const { sendSms } = require('../services/sms');

// =====================
// SIGNUP
// =====================
router.post('/signup', async (req, res) => {
  try {
    const { phone, password } = req.body;
    const email = `${phone}@aha.tech`;

    let user = await User.findOne({ phone });
    if (user) return res.status(400).json({ success: false, message: "Utilisateur existe déjà" });

    user = new User({ phone, password, email });
    await user.save();

    res.json({ success: true, message: 'Utilisateur créé' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// =====================
// SEND OTP
// =====================
router.post('/otp/send', async (req, res) => {
  try {
    const { phone } = req.body;
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60000);

    await Otp.create({ phone, code, expiresAt, used: false });

    // Optionnel: envoyer SMS via service externe
    await sendSms(phone, `Votre code AHA TopUp : ${code}`);

    console.log(`OTP pour ${phone}: ${code}`);
    res.json({ success: true, message: "OTP envoyé" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// =====================
// VERIFY OTP & LOGIN
// =====================
router.post('/otp/verify', async (req, res) => {
  try {
    const { phone, code } = req.body;

    const otp = await Otp.findOne({ phone, code, used: false });
    if (!otp || otp.expiresAt < new Date())
      return res.status(400).json({ success: false, message: "OTP invalide ou expiré" });

    otp.used = true;
    await otp.save();

    // Crée l’utilisateur s’il n’existe pas
    let user = await User.findOne({ phone });
    if (!user) {
      const email = `${phone}@aha.tech`;
      user = await User.create({ phone, email, password: crypto.randomUUID() }); // password aléatoire
    }

    // Supprime tous les OTP restants
    await Otp.deleteMany({ phone });

    // Génération JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'aha_secret',
      { expiresIn: '7d' }
    );

    res.json({ success: true, token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

module.exports = router;