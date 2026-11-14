// backend/socket.js
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("./models/User");

const initSocket = (server) => {
  const io = new Server(server, {
    cors: { origin: "http://localhost:5173", credentials: true },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error("No token"));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("name email");
      if (!user) return next(new Error("User not found"));
      socket.user = user;
      next();
    } catch (err) {
      next(new Error("Authentication failed"));
    }
  });

  const docUsers = {};

  io.on("connection", (socket) => {
    socket.on("join-document", ({ documentId }) => {
      socket.join(documentId);
      socket.currentDocId = documentId;

      if (!docUsers[documentId]) docUsers[documentId] = [];

      const color = getRandomColor();
      const userObj = {
        id: socket.id,
        name: socket.user.name,
        initial: socket.user.name[0]?.toUpperCase() || "?",
        color,
      };

      if (!docUsers[documentId].find((u) => u.id === socket.id)) {
        docUsers[documentId].push(userObj);
      }

      io.to(documentId).emit("room-users", docUsers[documentId]);
    });

    socket.on("document-update", ({ documentId, content }) => {
      socket.to(documentId).emit("document-updated", { content });
    });

    socket.on("cursor-move", ({ documentId, position }) => {
      const user = docUsers[documentId]?.find((u) => u.id === socket.id);
      if (!user) return;
      socket.to(documentId).emit("cursor-moved", {
        userId: socket.id,
        name: user.name,
        initial: user.initial,
        color: user.color,
        position,
      });
    });

    // 🆕 COMMENT EVENTS — BROADCAST TO OTHER USERS IN THE ROOM
    socket.on("comment-added", ({ documentId, comment }) => {
      console.log(`📝 Comment added to ${documentId}:`, comment.text);
      socket.to(documentId).emit("comment-added", { comment });
    });

    socket.on("comment-updated", ({ documentId, comment }) => {
      console.log(`✏️ Comment updated in ${documentId}`);
      socket.to(documentId).emit("comment-updated", { comment });
    });

    socket.on("comment-deleted", ({ documentId, commentId }) => {
      console.log(`🗑️ Comment deleted from ${documentId}`);
      socket.to(documentId).emit("comment-deleted", { commentId });
    });

    socket.on("disconnect", () => {
      Object.keys(docUsers).forEach((docId) => {
        docUsers[docId] = docUsers[docId].filter((u) => u.id !== socket.id);
        io.to(docId).emit("room-users", docUsers[docId]);
        io.to(docId).emit("cursor-remove", { userId: socket.id });
        if (docUsers[docId].length === 0) {
          delete docUsers[docId];
        }
      });
    });
  });

  return io;
};

function getRandomColor() {
  const colors = ["#8b5cf6", "#3b82f6", "#10b981", "#ec4899", "#f59e0b", "#ef4444"];
  return colors[Math.floor(Math.random() * colors.length)];
}

module.exports = initSocket;