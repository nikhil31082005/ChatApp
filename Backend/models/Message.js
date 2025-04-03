const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
    {
        // ✅ Sender information (Reference to User model)
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        // ✅ Chat association (Link to Chat model)
        chatId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Chat",
            required: true
        },

        // ✅ Message content (Supports text and media)
        content: {
            type: String
        },

        // ✅ Message Type (Text, Image, Video, File)
        messageType: {
            type: String,
            enum: ["text", "image", "video", "file"],
            default: "text"
        },

        // ✅ File URL (Optional for media and file attachments)
        fileUrl: {
            type: String
        },

        // ✅ Seen status (For group and individual chats)
        seenBy: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }],

        // ✅ Reply to specific message (For threaded replies)
        replyTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message"
        },

        // ✅ Message Status (For delivery and seen state)
        status: {
            type: String,
            enum: ["sent", "delivered", "seen"],
            default: "sent"
        },

        // ✅ Forwarded Message (Optional for message forwarding)
        forwardedFrom: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },

        // ✅ Soft deletion (To hide the message without deleting it from the database)
        isDeleted: {
            type: Boolean,
            default: false
        },

        // ✅ Reactions (To support emojis)
        reactions: [{
            userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            emoji: { type: String }
        }]
    },
    { timestamps: true }
);

// ✅ Indexing for better query performance
MessageSchema.index({ chatId: 1, createdAt: -1 });

const Message = mongoose.model("Message", MessageSchema);

module.exports = Message;
