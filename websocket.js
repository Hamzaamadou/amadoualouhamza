// backend/websocket.js
const Order = require('./models/Order');
const { Server } = require('socket.io');

module.exports = (http) => {
  // Création du serveur WebSocket avec CORS ouvert
  const io = new Server(http, {
    cors: { origin: '*' } // tu peux restreindre à ton frontend plus tard
  });

  io.on('connection', socket => {
    console.log('✅ Nouvelle connexion WebSocket');

    // Envoyer toutes les commandes existantes au nouvel utilisateur
    Order.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .then(orders => socket.emit('orders', orders))
      .catch(err => console.error('Erreur fetch orders:', err));

    // Recevoir une nouvelle commande depuis le frontend
    socket.on('newOrder', async (orderData) => {
      try {
        const order = await Order.create(orderData);
        // Diffuser la nouvelle commande à tous les clients connectés
        io.emit('orders', [order]);
      } catch (err) {
        console.error('Erreur création order:', err);
      }
    });

    socket.on('disconnect', () => {
      console.log('❌ Utilisateur WebSocket déconnecté');
    });
  });

  return io;
};