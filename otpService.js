// backend/services/otpService.js
const mongoose = require('mongoose');
const Otp = require('../models/Otp');

// Génère un code OTP aléatoire à 6 chiffres
function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

module.exports = {
  /**
   * Envoie un OTP au numéro donné
   * @param {string} phone - Numéro de téléphone
   * @param {number} [expiryMinutes=5] - Durée de validité
   */
  async send(phone, expiryMinutes = 5) {
    const code = generateCode();
    await Otp.create({
      phone,
      code,
      expiresAt: new Date(Date.now() + expiryMinutes * 60000),
      used: false
    });

    // 🚨 Ici tu peux appeler ton service SMS au lieu de console.log
    console.log(`✅ OTP envoyé à ${phone} : ${code}`);
    return code;
  },

  /**
   * Vérifie un OTP pour un utilisateur
   * @param {string} phone
   * @param {string} code
   * @param {boolean} isAdmin
   * @returns {boolean} true si valide, false sinon
   */
  async verify(phone, code, isAdmin = false) {
    if (isAdmin && !code) {
      throw new Error("OTP requis pour les admins");
    }

    const otp = await Otp.findOne({ phone, code, used: false });
    if (!otp) return false;
    if (otp.expiresAt < new Date()) return false;

    // Marque comme utilisé et supprime les anciens OTP pour ce numéro
    otp.used = true;
    await otp.save();
    await Otp.deleteMany({ phone, used: true, _id: { $ne: otp._id } });

    return true;
  },

  /**
   * Supprime les OTP expirés (peut être lancé périodiquement)
   */
  async cleanup() {
    await Otp.deleteMany({ expiresAt: { $lt: new Date() } });
  }
};