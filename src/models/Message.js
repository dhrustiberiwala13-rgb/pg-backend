const mongoose = require("mongoose");
const { MESSAGE_MAX_LENGTH } = require("../config/env");

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: MESSAGE_MAX_LENGTH,
    },
  },
  { timestamps: true }
);

messageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });

module.exports = mongoose.model("Message", messageSchema);
