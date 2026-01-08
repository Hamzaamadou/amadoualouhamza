// backend/jobs/cleanupOrders.js
const Order = require('../models/Order');

async function cleanup() {
  try {
    const limitDate = new Date();
    // Supprimer toutes les commandes datant de plus de 6 mois
    limitDate.setMonth(limitDate.getMonth() - 6);

    const result = await Order.deleteMany({ createdAt: { $lt: limitDate } });
    console.log(`🧹 ${result.deletedCount} anciennes commandes supprimées`);
  } catch (err) {
    console.error('❌ Erreur lors du nettoyage des commandes:', err);
  }
}

module.exports = cleanup;