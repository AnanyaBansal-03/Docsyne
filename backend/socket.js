// backend/socket.js
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("./models/User");

const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      credentials: true,
    },
  });

  // 🆕 Map to store userId -> socketId
  const userSocketMap = new Map();

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error("No token"));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("name email");
      if (!user) return next(new Error("User not found"));
      socket.user = user;

      // 🆕 Store the mapping when the socket connects
      userSocketMap.set(user._id.toString(), socket.id);

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

    // COMMENT EVENTS
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
      // 🆕 Remove user from the socket map when they disconnect
      if (socket.user) {
        userSocketMap.delete(socket.user._id.toString());
      }

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

  // 🆕 Helper function to send notifications to a specific user
  // backend/socket.js (replace just the sendNotificationToUser helper)

io.sendNotificationToUser = (userId, notification) => {
  const socketId = userSocketMap.get(userId.toString());
  console.log(`📬 sendNotificationToUser called for: ${userId}`);
  console.log(`🔌 Found socket: ${socketId || "❌ NOT CONNECTED"}`);

  if (socketId) {
    io.to(socketId).emit("new-notification", notification);
    console.log(`✅ Notification emitted to socket ${socketId}`);
  } else {
    console.log(`❌ No active socket for user ${userId}`);
  }
};

  return io;
};

function getRandomColor() {
  const colors = ["#8b5cf6", "#3b82f6", "#10b981", "#ec4899", "#f59e0b", "#ef4444"];
  return colors[Math.floor(Math.random() * colors.length)];
}

module.exports = initSocket;