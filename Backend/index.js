const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
require("./config/passport");
const authRoute = require("./routes/authRoutes");
const userRoute = require("./routes/userRoutes");
const friendRoute = require("./routes/friendRoutes");
const chatRoute = require("./routes/chatRoute");
const messageRoute = require("./routes/messageRoutes");

const Chat = require('./models/Chat');

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/friends", friendRoute);
app.use("/api/chat", chatRoute);
app.use("/api/message", messageRoute);

// Server
const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const io = require('socket.io')(server, {
  pingTimeout: 60000,
  cors: {
    origin: process.env.FRONTEND_URL, // ✅ Use .env variable
    credentials: true,
  },
});


io.on("connect", (socket) => {
  console.log("connected to socket.io");

  socket.on('setup', (userData) => {
    socket.join(userData._id);
    console.log(userData._id);
    socket.emit('connected');
  });

  socket.on('join chat', (room) => {
    socket.join(room);
    console.log("user joined room: " + room);
  });

  socket.on("new message", async (newMessageReceived) => {
    try {
      console.log("New message", newMessageReceived.newMessage.chatId);

      const chat = await Chat.findById(newMessageReceived.newMessage.chatId).populate('participants');
      if (!chat || !chat.participants) {
        console.log("Chat or participants not found");
        return;
      }

      chat.participants.forEach(user => {
        if (user._id.toString() !== newMessageReceived.newMessage.senderId.toString()) {
          console.log("Sending to:", user._id);
          socket.to(user._id.toString()).emit("message received", newMessageReceived.newMessage);
        }
      });
    } catch (error) {
      console.error("Error emitting message:", error);
    }
  });
});