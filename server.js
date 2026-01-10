require("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");
const bodyParser = require("body-parser");

const connectDB = require("./db");
const websocket = require("./websocket");

// Routes
const authRoutes = require("./routes/auth");
const orderRoutes = require("./routes/orders");
const adminRoutes = require("./routes/admin");
const analyticsRoutes = require("./routes/admin-analytics");
const walletRoutes = require("./routes/wallet");

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors({
  origin: ["https://ahatopup.netlify.app"],
  credentials: true
}));
app.use(bodyParser.json());

// MongoDB
connectDB();

// WebSocket
websocket(server);

// Routes
app.use("/auth", authRoutes);
app.use("/orders", orderRoutes);
app.use("/admin", adminRoutes);
app.use("/admin/analytics", analyticsRoutes);
app.use("/wallet", walletRoutes);

// Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
