// backend/scripts/createSuperAdmin.js
const User = require("../models/User");
const bcrypt = require("bcryptjs");

module.exports.up = async () => {
  try {
    // Vérifier si l'utilisateur existe déjà
    const existing = await User.findOne({ email: "hamzaamadoualou1@gmail.com" });

    if (!existing) {
      // Hasher le mot de passe
      const hashedPassword = await bcrypt.hash("Admin123!", 10);

      // Créer le superadmin
      await User.create({
        email: "hamzaamadoualou1@gmail.com",
        password: hashedPassword,
        role: "superadmin"
      });

      console.log("✅ Superadmin créé avec succès !");
    } else {
      console.log("ℹ️ Superadmin déjà existant.");
    }
  } catch (err) {
    console.error("❌ Erreur création superadmin :", err);
  }
};