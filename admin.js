// ================================
// FRONTEND: public/assets/admin.js
// ================================
const token = localStorage.getItem('token');

if (!token) {
  alert("Vous devez être connecté !");
  window.location.href = '/admin.html';
}

// Récupération des statistiques globales
fetch('/admin/stats', {
  headers: { Authorization: 'Bearer ' + token }
})
  .then(res => res.json())
  .then(data => {
    const usersElem = document.getElementById('users');
    const ordersElem = document.getElementById('orders');
    const revenueElem = document.getElementById('revenue');

    if (usersElem) usersElem.textContent = data.users;
    if (ordersElem) ordersElem.textContent = data.orders;
    if (revenueElem) revenueElem.textContent = data.revenue;
  })
  .catch(err => console.error("Erreur stats :", err));

// Récupération des 100 dernières commandes
fetch('/admin/orders', {
  headers: { Authorization: 'Bearer ' + token }
})
  .then(res => res.json())
  .then(data => {
    const ordersTable = document.getElementById('ordersTable');
    if (!ordersTable) return;

    data.forEach(o => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${o.phone}</td>
        <td>${o.operator}</td>
        <td>${o.price}</td>
        <td>${new Date(o.createdAt).toLocaleString()}</td>
      `;
      ordersTable.appendChild(tr);
    });
  })
  .catch(err => console.error("Erreur orders :", err));


// ================================
// BACKEND: routes/admin.js
// ================================
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Order = require('../models/Order');
const User = require('../models/User');

// Statistiques globales
router.get('/stats', auth, async (req, res) => {
  try {
    const users = await User.countDocuments();
    const orders = await Order.countDocuments();
    const revenueAgg = await Order.aggregate([
      { $group: { _id: null, total: { $sum: '$price' } } }
    ]);
    const revenue = revenueAgg[0]?.total || 0;

    res.json({ users, orders, revenue });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Liste des 100 dernières commandes
router.get('/orders', auth, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).limit(100);
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;