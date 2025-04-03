const express = require('express');
const Message = require('../models/Message');
const Chat = require('../models/Chat');

const router = express.Router();

/** ✅ Get all messages in a chat */
router.get('/:chatId', async (req, res) => {
    const { chatId } = req.params;

    try {
        // ✅ Fetch messages with sender details
        const messages = await Message.find({ chatId })
            .populate({
                path: 'senderId',
                select: 'name profilePic'
            })
            .populate({
                path: 'replyTo',
                populate: {
                    path: 'senderId',
                    select: 'name profilePic'
                }
            })
            .populate({
                path: 'forwardedFrom',
                select: 'name profilePic'
            })
            .sort({ createdAt: 1 }); // Oldest first

        return res.status(200).json({ success: true, messages });
    } catch (error) {
        console.error('Error fetching messages:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

/** ✅ Send a message */
router.post('/send', async (req, res) => {
    try {
        const {
            senderId,
            chatId,
            content,
            messageType,
            fileUrl,
            replyTo,
            forwardedFrom,
            reactions
        } = req.body;

        console.log("send", req.body);

        // ✅ Validate required fields
        if (!senderId || !chatId || !content) {
            return res.status(400).json({ message: 'Sender, chat, and content are required.' });
        }

        // ✅ Create a new message
        const newMessage = new Message({
            senderId,
            chatId,
            content,
            messageType: messageType || 'text',
            fileUrl,
            replyTo,
            forwardedFrom,
            reactions,
            status: 'sent'
        });

        // ✅ Save message to DB
        await newMessage.save();

        // ✅ Update last message in Chat model
        await Chat.findByIdAndUpdate(chatId, {
            lastMessage: newMessage._id,
            updatedAt: Date.now()
        });

        return res.status(201).json({ success: true, message: 'Message sent successfully', newMessage });
    } catch (error) {
        console.error('Error while sending message:', error);
        return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
});

/** ✅ Mark messages as delivered */
router.post('/status/delivered', async (req, res) => {
    try {
        const { messageId, userId } = req.body;

        if (!messageId || !userId) {
            return res.status(400).json({ message: 'Message ID and user ID are required' });
        }

        // ✅ Update message status to "delivered"
        const message = await Message.findByIdAndUpdate(
            messageId,
            { status: 'delivered' },
            { new: true }
        );

        return res.status(200).json({ success: true, message });
    } catch (error) {
        console.error('Error updating message status:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

/** ✅ Mark messages as seen */
router.post('/status/seen', async (req, res) => {
    try {
        const { messageId, userId } = req.body;

        if (!messageId || !userId) {
            return res.status(400).json({ message: 'Message ID and user ID are required' });
        }

        const message = await Message.findById(messageId);

        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        // ✅ Add user to seenBy array if not already seen
        if (!message.seenBy.includes(userId)) {
            message.seenBy.push(userId);
            message.status = 'seen';
            await message.save();
        }

        return res.status(200).json({ success: true, message });
    } catch (error) {
        console.error('Error updating seen status:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

module.exports = router;
