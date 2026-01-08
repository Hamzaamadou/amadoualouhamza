// backend/services/i18n.js
const fs = require('fs');
const path = require('path');

// Langues supportées
const languages = ['fr','en','ha','ar'];
const translations = {};

// Chargement des fichiers JSON de traduction
languages.forEach(lang => {
  try {
    translations[lang] = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../i18n', `${lang}.json`))
    );
  } catch (err) {
    console.error(`Erreur lors du chargement des traductions ${lang}:`, err);
    translations[lang] = {};
  }
});

/**
 * Fonction pour traduire une clé selon la langue
 * @param {string} lang - code langue ('fr','en','ha','ar')
 * @param {string} key - clé à traduire
 * @returns {string} - texte traduit ou la clé si non trouvée
 */
function t(lang, key) {
  return translations[lang]?.[key] || key;
}

module.exports = { t, translations };

// middleware pour Express : récupérer la langue depuis le header
function langMiddleware(req, res, next) {
  req.lang = req.headers['x-lang'] || 'fr';
  next();
}

module.exports.langMiddleware = langMiddleware;

// -----------------------
// Exemple d'utilisation backend
// -----------------------
/*
const { t } = require('./services/i18n');
app.use(langMiddleware);

app.get('/api/example', (req,res) => {
  res.json({ message: t(req.lang, "success") });
});
*/

// -----------------------
// Frontend usage
// -----------------------
/*
const lang = localStorage.getItem("lang") || 'fr';
fetch("/api/...", { headers: { "x-lang": lang }});
text.innerText = i18n[lang].buy;
*/

// -----------------------
// Exemple de JSON pour i18n/*.json
// fr.json
/*
{
  "buy": "Acheter",
  "credit": "Crédit",
  "success": "Opération réussie"
}
*/
// en.json
/*
{
  "buy": "Buy",
  "credit": "Credit",
  "success": "Operation successful"
}
*/
// ha.json
/*
{
  "buy": "Sayi",
  "credit": "Kudi",
  "success": "Aiki ya yi nasara"
}
*/
// ar.json
/*
{
  "buy": "شراء",
  "credit": "رصيد",
  "success": "نجحت العملية"
}
*/

// -----------------------
// Bonus : fonction de bonus selon le jour
// -----------------------
module.exports.applyBonus = function(plan) {
  const day = new Date().getDay(); // 0=Dimanche, 1=Lundi, ...
  if ([1,3,5].includes(day)) {
    plan.bonus = '+100%';
  }
  return plan;
};

// -----------------------
// Devises selon pays
// -----------------------
module.exports.currencies = {
  Niger: 'XOF',
  Ghana: 'GHS',
  Nigeria: 'NGN'
};