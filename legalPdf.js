const PDFDocument = require('pdfkit');
const fs = require('fs');

module.exports.generateLegalPDF = () => {
  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream('exports/CGU_AHA_TOPUP.pdf'));
  doc.text("Conditions Générales d’Utilisation - AHA TopUp\n\n");
  doc.text("AHA TopUp est une plateforme de recharge télécom...");
  doc.end();
};