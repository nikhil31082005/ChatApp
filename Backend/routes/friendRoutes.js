const express = require('express');
const FriendRequest = require("../models/FriendRequest");
const User = require("../models/User");
const Chat = require("../models/Chat");

const router = express.Router();

router.get("/requests/:userId", async (req, res) => {
    try {
        const { userId } = req.params;

        // ✅ Validate user existence
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        // ✅ Get pending requests
        const requests = await FriendRequest.find({
            receiver: userId,
            status: "pending"
        }).populate("sender", "name profilePic username");

        res.status(200).json(requests);
    } catch (error) {
        console.error("Error fetching friend requests:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});


router.post("/connect", async (req, res) => {
    try {
        const { senderId, receiverId } = req.body;

        // ✅ Validation: Check both IDs
        if (!senderId || !receiverId) {
            return res.status(400).json({ message: "Invalid data. Both sender and receiver IDs are required." });
        }

        if (senderId === receiverId) {
            return res.status(400).json({ message: "You cannot send a request to yourself!" });
        }

        // ✅ Ensure sender and receiver exist
        const sender = await User.findById(senderId);
        const receiver = await User.findById(receiverId);

        if (!sender || !receiver) {
            return res.status(404).json({ message: "User not found!" });
        }

        // ✅ Check if request already exists
        const existingRequest = await FriendRequest.findOne({
            sender: senderId,
            receiver: receiverId,
            status: { $in: ["pending", "accepted"] }
        });

        if (existingRequest) {
            return res.status(400).json({ message: "Friend request already sent or accepted!" });
        }

        // ✅ Create new request
        const newRequest = new FriendRequest({
            sender: senderId,
            receiver: receiverId,
            status: "pending",
        });

        await newRequest.save();

        res.status(201).json({ message: "Friend request sent!" });
    } catch (error) {
        console.error("Error sending friend request:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});



router.put("/respond", async (req, res) => {
    try {
        const { requestId, action } = req.body;

        // ✅ Validate action type
        if (!["accept", "reject"].includes(action)) {
            return res.status(400).json({ message: "Invalid action" });
        }

        // ✅ Find the friend request
        const request = await FriendRequest.findById(requestId);
        if (!request) {
            return res.status(404).json({ message: "Friend request not found!" });
        }

        if (request.status !== "pending") {
            return res.status(400).json({ message: "Friend request already processed" });
        }

        if (action === "reject") {
            // ✅ Update the status to "rejected"
            request.status = "rejected";
            await request.save();
            return res.status(200).json({ message: "Friend request rejected!" });
        }

        if (action === "accept") {
            // ✅ Update the status to "accepted"
            request.status = "accepted";
            await request.save();

            // ✅ Add both users as friends
            const sender = await User.findById(request.sender);
            const receiver = await User.findById(request.receiver);

            if (!sender || !receiver) {
                return res.status(404).json({ message: "User not found!" });
            }

            await User.findByIdAndUpdate(request.sender, { $addToSet: { friends: receiver._id } });
            await User.findByIdAndUpdate(request.receiver, { $addToSet: { friends: sender._id } });

            // ✅ Check if a chat already exists between the users
            const existingChat = await Chat.findOne({
                participants: { $all: [sender._id, receiver._id] },
                isGroupChat: false
            });

            if (!existingChat) {
                // ✅ Create a single private chat using the `participants` array
                const newChat = new Chat({
                    chatName: receiver.name, // For sender, chat name should be receiver's name
                    isGroupChat: false,
                    participants: [sender._id, receiver._id],
                });

                await newChat.save();
            }

            return res.status(200).json({ message: "Friend request accepted and chat created!" });
        }
    } catch (error) {
        console.error("Error processing friend request:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});



module.exports = router;
