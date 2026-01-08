// backend/services/logger.js
const Log = require('../models/Log');

/**
 * Enregistre une action utilisateur ou système dans la base.
 * @param {String} userId - ID ou identifiant de l'utilisateur (ex: phone ou _id MongoDB)
 * @param {String} action - Type d'action (ex: 'ORDER_CREATED', 'LOGIN_SUCCESS')
 * @param {Object} details - Détails supplémentaires sur l'action
 */
async function logAction(userId, action, details = {}) {
  try {
    const log = new Log({ userId, action, details });
    await log.save();
    console.log(`📝 Action enregistrée: ${action} pour ${userId}`);
  } catch (err) {
    console.error('❌ Erreur lors de l’enregistrement du log:', err);
  }
}

module.exports = { logAction };