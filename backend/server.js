// backend/server.js
const express = require("express");
const cors = require("cors");
const http = require("http");
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const workspaceRoutes = require("./routes/workspaceRoutes");
const documentRoutes = require("./routes/documentRoutes");
const initSocket = require("./socket");

const app = express();
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));

connectDB();

app.use("/api", authRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api/documents", documentRoutes);

app.get("/", (req, res) => {
  res.json({ message: "🚀 Docsyne API is running" });
});

// Create HTTP server for Socket.IO
const server = http.createServer(app);

// 🆕 Initialize Socket.IO and attach it to Express app
const io = initSocket(server);
app.set("io", io); // Makes `req.app.get("io")` available in controllers

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));