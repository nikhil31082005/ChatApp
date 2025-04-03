const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    googleId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    username: { type: String, unique: true },
    profilePic: { type: String },
    groups: [{ type: mongoose.Schema.Types.ObjectId, ref: "Group" }],
    isOnline: { type: Boolean, default: false },
    lastSeen: { type: Date, default: Date.now },
    socialLinks: {
      twitter: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      github: { type: String, default: "" }
    },  
    visibility: { type: Boolean, default: true }
  },
  { timestamps: true }
);
userSchema.index({ name: "text", username: "text", email: "text" });

module.exports = mongoose.model("User", userSchema);
