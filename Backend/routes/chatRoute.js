const express = require('express');
const Chat = require('../models/Chat');
const User = require('../models/User');
const Message = require("../models/Message");

const router = express.Router();

router.get("/friend/:userId", async (req, res) => {
    try {
        const { userId } = req.params;

        // ✅ Validate user existence
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        // ✅ Find all chats where the user is a participant
        const chats = await Chat.find({ participants: { $in: [userId] } })
            .populate("participants", "name profilePic email isOnline")
            .populate({
                path: "lastMessage",
                select: "content createdAt senderId",
                populate: {
                    path: "senderId",
                    select: "name profilePic"
                }
            })
            .sort({ updatedAt: -1 })
            .lean();

        // ✅ Process chats (group and one-to-one)
        const processedChats = chats.map(chat => {
            // ✅ Handle Group Chats
            if (chat.isGroup) {
                return {
                    _id: chat._id,
                    chatName: chat.chatName,
                    profilePic: chat.profilePic || "",
                    participants: chat.participants.map(p => ({
                        _id: p._id,
                        name: p.name,
                        profilePic: p.profilePic,
                        email: p.email,
                        isOnline: p.isOnline
                    })),
                    lastMessage: chat.lastMessage
                        ? {
                            content: chat.lastMessage.content,
                            createdAt: chat.lastMessage.createdAt,
                            sender: chat.lastMessage.senderId
                                ? {
                                    name: chat.lastMessage.senderId.name,
                                    profilePic: chat.lastMessage.senderId.profilePic
                                }
                                : null
                        }
                        : null
                };
            } else {
                // ✅ Handle One-to-One Chats
                const otherParticipant = chat.participants.find(
                    participant => participant._id.toString() !== userId
                );

                if (!otherParticipant) return null;

                return {
                    _id: chat._id,
                    chatName: otherParticipant.name,
                    profilePic: otherParticipant.profilePic || "",
                    email: otherParticipant.email,
                    isOnline: otherParticipant.isOnline,
                    lastMessage: chat.lastMessage
                        ? {
                            content: chat.lastMessage.content,
                            createdAt: chat.lastMessage.createdAt,
                            sender: chat.lastMessage.senderId
                                ? {
                                    name: chat.lastMessage.senderId.name,
                                    profilePic: chat.lastMessage.senderId.profilePic
                                }
                                : null
                        }
                        : null
                };
            }
        }).filter(Boolean); // ✅ Remove null values

        return res.status(200).json(processedChats);

    } catch (error) {
        console.error("Error fetching chats:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
