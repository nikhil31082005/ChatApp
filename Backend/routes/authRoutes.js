const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Google OAuth Login
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google OAuth Callback
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    const token = jwt.sign({ id: req.user.id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.cookie("token", token, { httpOnly: true }).redirect(process.env.FRONTEND_URL);
  }
);

router.get("/session", protect, (req, res) => {
  // console.log(req.user);
  if (req.user) {
    res.status(200).json({ user: req.user });
  } else {
    res.status(401).json({ message: "No active session" });
  }
});

// Logout
router.get("/logout", (req, res) => {
  req.logout?.((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ message: "Logout failed" });
    }

    req.session.destroy((err) => {
      if (err) {
        console.error("Session destruction error:", err);
        return res.status(500).json({ message: "Logout failed" });
      }

      // Explicitly set cookies to expire
      res.cookie("connect.sid", "", {
        httpOnly: true,
        expires: new Date(0),
        secure: false, // Set to `true` only in production (HTTPS)
        sameSite: "Lax",
        path: "/",
      });

      res.cookie("token", "", {
        httpOnly: true,
        expires: new Date(0),
        secure: false, // Change to `true` for HTTPS in production
        sameSite: "Lax",
        path: "/",
      });

      return res.status(200).json({ message: "Logged out successfully" });
    });
  });
});

module.exports = router;
