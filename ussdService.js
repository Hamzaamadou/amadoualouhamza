// backend/services/operatorGateway.js
const axios = require('axios');

/**
 * Envoi USSD via une API de téléphone
 * @param {string} code - Code USSD à envoyer
 */
async function sendViaAPI(code) {
  try {
    await axios.post("http://IP_DU_TELEPHONE:8080/ussd", { code });
    console.log(`✅ USSD envoyé via API: ${code}`);
    return { status: 'SENT' };
  } catch (err) {
    console.error('❌ Erreur en envoyant USSD via API:', err);
    return { status: 'FAILED', error: err.message };
  }
}

/**
 * Simulation d'un envoi USSD (console log)
 * @param {string} operator - Nom de l'opérateur
 * @param {string} phone - Numéro de téléphone
 * @param {number} amount - Montant ou code
 */
async function simulate(operator, phone, amount) {
  console.log(`💡 USSD AUTO ${operator} → ${phone} : ${amount} FCFA`);
  return { status: 'SENT' };
}

/**
 * Log uniquement, pas d'envoi réel
 * @param {string} operator - Nom de l'opérateur
 * @param {string} phone - Numéro de téléphone
 * @param {number} amount - Montant ou code
 */
function logOnly(operator, phone, amount) {
  console.log(`📝 USSD LOG ${operator.toUpperCase()} → ${phone} : ${amount} FCFA`);
}

/**
 * Fonction principale pour envoyer un top-up (choisir le mode)
 * @param {string} operator
 * @param {string} phone
 * @param {number} amount
 * @param {string} mode - 'api' | 'simulate' | '