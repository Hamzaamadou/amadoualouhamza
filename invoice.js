// backend/services/reports.js
const PDFDocument = require('pdfkit');
const fs = require('fs');
const ExcelJS = require('exceljs');

/**
 * Génère un PDF pour un tableau de commandes
 * @param {Array} orders - Liste des commandes
 * @param {String} path - Chemin du fichier PDF
 */
module.exports.generatePDF = async (orders, path) => {
  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream(path));
  doc.text('Rapport de commandes', { align: 'center', underline: true });
  orders.forEach(o => {
    doc.moveDown(0.5);
    doc.text(`Commande ${o._id || ''}`);
    doc.text(`Opérateur: ${o.operator}`);
    doc.text(`Forfait: ${o.plan}`);
    doc.text(`Montant: ${o.amount} F`);
    doc.text(`Statut: ${o.status}`);
    if (o.createdAt) doc.text(`Date: ${new Date(o.createdAt).toLocaleString()}`);
    doc.moveDown();
  });
  doc.end();
};

/**
 * Génère un fichier Excel pour un tableau de commandes
 * @param {Array} orders - Liste des commandes
 * @param {String} path - Chemin du fichier XLSX
 */
module.exports.generateXLS = async (orders, path) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Commandes');

  sheet.columns = [
    { header: 'ID', key: '_id', width: 25 },
    { header: 'Opérateur', key: 'operator', width: 15 },
    { header: 'Forfait', key: 'plan', width: 20 },
    { header: 'Montant', key: 'amount', width: 10 },
    { header: 'Statut', key: 'status', width: 10 },
    { header: 'Date', key: 'createdAt', width: 20 }
  ];

  sheet.addRows(orders.map(o => ({
    _id: o._id,
    operator: o.operator,
    plan: o.plan,
    amount: o.amount,
    status: o.status,
    createdAt: o.createdAt ? new Date(o.createdAt).toLocaleString() : ''
  })));

  await workbook.xlsx.writeFile(path);
};

/**
 * Génère un PDF simple pour une seule commande (facture)
 * @param {Object} order - Commande unique
 */
module.exports.generateInvoicePDF = (order) => {
  const doc = new PDFDocument();
  const path = `exports/${order._id}.pdf`;
  doc.pipe(fs.createWriteStream(path));

  doc.text(`Facture ${order._id}`, { align: 'center', underline: true });
  doc.moveDown();
  doc.text(`Opérateur: ${order.operator}`);
  doc.text(`Forfait: ${order.plan}`);
  doc.text(`Montant: ${order.amount} F`);
  doc.text(`TVA (18%): ${order.amount * 0.18} F`);
  doc.text(`Total: ${order.amount * 1.18} F`);
  doc.end();
};