const mongoose = require("mongoose");
const GroupSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        admins: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        avatar: { type: String }, // Group profile picture
    },
    { timestamps: true }
);

const Group = mongoose.model("Group", GroupSchema);
module.exports = Group;
