require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const http = require("http");
const websocket = require("./websocket");

// Routes
const authRoutes = require("./routes/auth");
const ordersRoutes = require("./routes/orders");
const adminRoutes = require("./routes/admin");
const adminAnalyticsRoutes = require("./routes/admin-analytics");
const webhookRoutes = require("./routes/webhook");
const plansRoutes = require("./routes/plans");
const creditRoutes = require("./routes/credit");
const walletRoutes = require("./routes/wallet");

const app = express();
const server = http.createServer(app);

// WebSocket
websocket(server);

// Middleware
app.use(cors({ origin: ["https://ahatopup.netlify.app"] }));
app.use(bodyParser.json());

// Routes principales
app.use("/auth", authRoutes);
app.use("/orders", ordersRoutes);
app.use("/admin", adminRoutes);
app.use("/admin/analytics", adminAnalyticsRoutes);
app.use("/webhook", webhookRoutes);
app.use("/plans", plansRoutes);
app.use("/credit", creditRoutes);
app.use("/wallet", walletRoutes);

// MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connecté"))
  .catch((err) => console.error("Erreur MongoDB :", err));

// Lancement serveur
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
