// backend/routes/adminAuth.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { requireRole } = require('../utils/roles');
const User = require('../models/User');
const { logAction } = require('../services/logger');
const speakeasy = require('speakeasy');

const router = express.Router();

/**
 * Générer un secret 2FA
 * @returns {Object} base32 et ascii
 */
function generate2FA() {
  const secret = speakeasy.generateSecret({ length: 20 });
  return { base32: secret.base32, ascii: secret.ascii };
}

/**
 * Vérifier le token 2FA
 * @param {String} secret
 * @param {String} token
 * @returns {Boolean}
 */
function verify2FA(secret, token) {
  return speakeasy.totp.verify({
    secret,
    encoding: 'ascii',
    token,
    window: 1
  });
}

/**
 * Activation du 2FA pour un admin
 */
router.post(
  '/enable-2fa',
  requireRole('admin', 'superadmin'),
  async (req, res) => {
    try {
      const { base32, ascii } = generate2FA();
      req.user.twofaEnabled = true;
      req.user.twofaSecret = ascii;
      await req.user.save();
      res.json({ qrcode_secret: base32 });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }
);

/**
 * Login admin avec mot de passe + 2FA
 */
router.post('/admin-login', async (req, res) => {
  try {
    const { email, password, token } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe requis' });
    }

    const user = await User.findOne({ email });
    if (!user || !['admin','superadmin'].includes(user.role)) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const okPass = await bcrypt.compare(password, user.password);
    if (!okPass) {
      await logAction(email, 'LOGIN_FAILED');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.twofaEnabled) {
      if (!token) {
        return res.status(400).json({ message: 'Code 2FA requis' });
      }
      if (!verify2FA(user.twofaSecret, token)) {
        await logAction(email, '2FA_FAILED');
        return res.status(401).json({ message: 'Invalid 2FA code' });
      }
    }

    await logAction(email, 'LOGIN_SUCCESS');

    const jwtToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '12h' }
    );

    res.json({ token: jwtToken, user: { id: user._id, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;