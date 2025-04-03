const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");
const { createCanvas } = require("canvas");
require("dotenv").config();

// Function to generate a profile picture
function generateProfilePicture(name) {
  const width = 200; // Image width
  const height = 200; // Image height
  const canvas = createCanvas(width, height);
  const context = canvas.getContext("2d");

  // Extract initials from the name
  const initials = name
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
    .substring(0, 2); // Limit to 2 characters

  // Generate a background color based on the name
  const hash = name.split("").reduce((acc, char) => char.charCodeAt(0) + acc, 0);
  const color = `hsl(${hash % 360}, 70%, 50%)`; // Use HSL for vibrant colors

  // Fill the background
  context.fillStyle = color;
  context.fillRect(0, 0, width, height);

  // Add the initials
  context.font = "bold 80px Arial";
  context.fillStyle = "#ffffff"; // White text
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(initials, width / 2, height / 2);

  // Return the image as a Base64 data URL
  return canvas.toDataURL();
}

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          // Generate a profile picture based on the user's name
          const profilePic = generateProfilePicture(profile.displayName);

          // Create the user with the generated profile picture
          user = await User.create({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
            profilePic, // Store the Base64 string
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});