// backend/server.js
import express from 'express';
import mongoose from './db.js';
import bodyParser from 'body-parser';
import http from 'http';
import cors from 'cors';
import websocket from './websocket.js';
import walletRouter from './wallet.js';

// Importation des routes (Obligation d'ajouter l'extension .js)
import authRouter from './routes/auth.js';
import ordersRouter from './routes/orders.js';
import adminRouter from './routes/admin.js';
import adminAnalyticsRouter from './routes/admin-analytics.js';
import webhookRouter from './routes/webhook.js';
import plansRouter from './routes/plans.js';
import creditRouter from './routes/credit.js';

const app = express();
const server = http.createServer(app);

// Configuration CORS (déplacé en haut pour plus de clarté)
app.use(cors({
    origin: ["https://ahatopup.netlify.app"]
}));

// Initialisation WebSocket
websocket(server);

// Middleware
app.use(bodyParser.json());

// Routes principales (Remplacement des require par les imports ci-dessus)
app.use('/auth', authRouter);
app.use('/orders', ordersRouter);
app.use('/admin', adminRouter);
app.use('/admin/analytics', adminAnalyticsRouter);
app.use('/webhook', webhookRouter);
app.use('/plans', plansRouter);
app.use('/credit', creditRouter);
app.use('/wallet', walletRouter);

// Lancement du serveur
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Backend running on port ${PORT}`);
});
