import express from 'express';
import User from '../models/User.js'; // Ajoutez .js à la fin
import Otp from '../models/Otp.js';   // Ajoutez .js à la fin
import jwt from 'jsonwebtoken';
import { sendSms } from '../services/sms.js'; // Ajoutez .js à la fin

const router = express.Router();

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

    let user = await User.findOne({ phone });
    if (!user) {
      const email = `${phone}@aha.tech`;
      user = await User.create({ phone, email, password: crypto.randomUUID() });
    }

    await Otp.deleteMany({ phone });

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

// À LA PLACE DE module.exports = router;
export default router;import express from 'express';
import User from '../models/User.js'; // Ajoutez .js à la fin
import Otp from '../models/Otp.js';   // Ajoutez .js à la fin
import jwt from 'jsonwebtoken';
import { sendSms } from '../services/sms.js'; // Ajoutez .js à la fin

const router = express.Router();

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

    let user = await User.findOne({ phone });
    if (!user) {
      const email = `${phone}@aha.tech`;
      user = await User.create({ phone, email, password: crypto.randomUUID() });
    }

    await Otp.deleteMany({ phone });

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

// À LA PLACE DE module.exports = router;
export default router;
