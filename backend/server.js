// backend/server.js
const express = require("express");
const cors = require("cors");
const http = require("http");   // <-- MUST BE HERE
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const workspaceRoutes = require("./routes/workspaceRoutes");
const documentRoutes = require("./routes/documentRoutes");
const initSocket = require("./socket");

const app = express();
app.use(express.json());
app.use(cors());

connectDB();

app.use("/api", authRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api/documents", documentRoutes);

app.get("/", (req, res) => {
  res.json({ message: "🚀 Docsyne API is running" });
});

// Create HTTP server for Socket.IO
const server = http.createServer(app);
initSocket(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));