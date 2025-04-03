const mongoose = require("mongoose");

const ChatSchema = new mongoose.Schema(
    {
        chatName: { type: String, trim: true }, // For group chats
        isGroupChat: { type: Boolean, default: false },
        participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Users in the chat
        lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message", default: null }, // Store last message for quick access
        groupAdmin: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Only for group chats
        deleted: { type: Boolean, default: false }, // Soft deletion flag
        pinned: { type: Boolean, default: false }, // Pinned chat flag
        muted: { type: Boolean, default: false }, // Muted chat flag
        readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Users who have read the last message
    },
    { timestamps: true }
);

const Chat = mongoose.model("Chat", ChatSchema);
module.exports = Chat;
