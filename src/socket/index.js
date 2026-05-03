const mongoose = require("mongoose");
const Message = require("../models/Message");
const { corsAllowedOrigins, CORS_ORIGIN } = require("../config/env");

function isValidObjectId(id) {
  return typeof id === "string" && mongoose.Types.ObjectId.isValid(id);
}

function registerSocket(io) {
  io.on("connection", (socket) => {
    socket.on("join", (userId) => {
      if (isValidObjectId(userId)) {
        socket.join(userId);
      }
    });

    socket.on("send_message", async (data, ack) => {
      try {
        const senderId = data?.senderId;
        const receiverId = data?.receiverId;
        const text = data?.message;

        if (!isValidObjectId(senderId) || !isValidObjectId(receiverId)) {
          if (typeof ack === "function") ack({ error: "Invalid sender or receiver id" });
          return;
        }
        if (!text || typeof text !== "string" || !text.trim()) {
          if (typeof ack === "function") ack({ error: "Message text required" });
          return;
        }

        const doc = await Message.create({
          senderId,
          receiverId,
          message: text.trim().slice(0, 8000),
        });
        await doc.populate("senderId receiverId", "name email");

        io.to(receiverId).emit("receive_message", doc.toJSON());
        io.to(senderId).emit("message_sent", doc.toJSON());

        if (typeof ack === "function") ack({ ok: true, message: doc.toJSON() });
      } catch (err) {
        if (typeof ack === "function") ack({ error: err.message || "Failed to save message" });
      }
    });

    socket.on("disconnect", () => {});
  });
}

/** Socket.IO v4 cors option shape */
function socketCorsConfig() {
  if (CORS_ORIGIN === "*") {
    return { origin: true, methods: ["GET", "POST"] };
  }
  return {
    origin: corsAllowedOrigins(),
    methods: ["GET", "POST"],
  };
}

module.exports = { registerSocket, socketCorsConfig };
