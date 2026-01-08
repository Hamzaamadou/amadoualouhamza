// backend/services/crypto.js
const crypto = require('crypto');

const algorithm = 'aes-256-cbc';
// La clé doit faire exactement 32 bytes pour AES-256
const key = Buffer.from(process.env.SECRET_KEY || '12345678901234567890123456789012');

/**
 * Chiffre un texte en AES-256-CBC
 * @param {string} text - texte en clair
 * @returns {Object} - { iv, data } où iv est nécessaire pour le déchiffrement
 */
module.exports.encrypt = (text) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return { iv: iv.toString('hex'), data: encrypted };
};

/**
 * Déchiffre un texte chiffré avec AES-256-CBC
 * @param {string} ivHex - vecteur d'initialisation utilisé lors du chiffrement
 * @param {string} encryptedData - texte chiffré
 * @returns {string} - texte déchiffré
 */
module.exports.decrypt = (ivHex, encryptedData) => {
  const decipher = crypto.createDecipheriv(algorithm, key, Buffer.from(ivHex, 'hex'));
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};