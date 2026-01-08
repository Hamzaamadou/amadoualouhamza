// backend/server.js
import express from 'express';
import mongoose from './db.js';
import bodyParser from 'body-parser';
import http from 'http';
import websocket from './websocket.js';
import walletRouter from './wallet.js';

const app = express();
const server = http.createServer(app);
websocket(server); // initialise WebSocket avec le serveur HTTP

// Middleware
app.use(bodyParser.json());

// Routes principales
app.use('/auth', require('./routes/auth'));
app.use('/orders', require('./routes/orders'));
app.use('/admin', require('./routes/admin'));
app.use('/admin/analytics', require('./routes/admin-analytics'));
app.use('/webhook', require('./routes/webhook'));
app.use('/plans', require('./routes/plans'));
app.use('/credit', require('./routes/credit'));
app.use('/wallet', walletRouter);

// Lancement du serveur
const PORT = 3000;
server.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));

const cors = require('cors');
app.use(cors({
  origin: ["https://ahatopup.netlify.app"]
}));