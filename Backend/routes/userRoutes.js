const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const User = require('../models/User');

const router = express.Router();

router.get('/search', async (req, res)=>{
    try {
        const {query} = req.query;
        if(!query) return res.status(404).json({message: "Query is required"});

        const users = await User.find({
            $or: [
                {name: { $regex: query, $options: "i"}},
                {email: { $regex: query, $options: "i"}},
                {username: { $regex: query, $options: "i"}},
            ]
        }).select("name email username profilePic");
        // console.log(users);

        return res.status(200).json(users);
    } catch (error) {
        return res.status(500).json({error: error.message});
    }
})

router.get('/profile/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        // console.log("Requested User ID:", userId);

        const user = await User.findById(userId); // ✅ FIXED QUERY

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // console.log("User Found:", user);
        return res.status(200).json(user);
    } catch (error) {
        // console.error("Error fetching user:", error);
        return res.status(500).json({ error: "Server error" });
    }
});


module.exports = router;