// backend/backup.js
const { exec } = require("child_process");
const cron = require("node-cron");

/**
 * Fonction pour exécuter le backup MongoDB
 */
function runBackup() {
  const file = `/backups/backup-${Date.now()}.gz`;

  exec(`mongodump --archive=${file} --gzip`, (err) => {
    if (err) {
      console.error("❌ Backup failed:", err);
    } else {
      console.log("✅ Backup saved:", file);
    }
  });
}

// Planification du backup tous les jours à 02:00 AM
cron.schedule("0 2 * * *", () => {
  console.log("⏰ Démarrage du backup automatique...");
  runBackup();
});

// Export si besoin de l'utiliser ailleurs
module.exports = { runBackup };