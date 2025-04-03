import React, { useState, useCallback, useEffect } from 'react';
import { FiVideo, FiPhone, FiMoreVertical, FiPaperclip, FiSend, FiSmile } from "react-icons/fi";
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import io from 'socket.io-client';

const ENDPOINT = import.meta.env.VITE_API_URL;
let socket, selectedChatCompare;

function ChatWindow({ activeChat }) {
    const currentUser = useAuth();
    // console.log("user", currentUser.user._id);
    const [msg, setMsg] = useState("");
    const [chatMessages, setChatMessages] = useState([]);
    const [socketConnected, setSocketConnected] = useState(false);

    useEffect(() => {
        socket = io(ENDPOINT);
    
        socket.on("connect", () => {
            console.log("Socket connected");
            setSocketConnected(true);
        });
    
        socket.emit("setup", currentUser.user);
    
        return () => {
            socket.disconnect(); // ✅ Cleanup on unmount
        };
    }, []);
    

    
    
    useEffect(() => {
        if (!activeChat?._id) return;
    
        const fetchMessages = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/message/${activeChat._id}`, {
                    withCredentials: true,
                });
                setChatMessages(res.data.messages);
                socket.emit('join chat', activeChat._id);
            } catch (error) {
                console.error("Error fetching messages:", error.message);
            }
        };
    
        fetchMessages();
        selectedChatCompare = activeChat;
    }, [activeChat?._id]);
    
    // ✅ Listen for incoming messages properly
    useEffect(() => {
        if (!socket) return;
    
        const handleMessageReceived = (newMessageReceived) => {
            console.log("Message received", newMessageReceived);
    
            if (!selectedChatCompare || selectedChatCompare._id !== newMessageReceived.chatId) {
                console.log("Notification: New message");
            } else {
                setChatMessages((prev) => [...prev, newMessageReceived]);
            }
        };
    
        socket.on('message received', handleMessageReceived);
    
        return () => socket.off('message received', handleMessageReceived);
    }, []);
    

    // ✅ Handle sending messages
    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();

        if (!msg.trim()) return;

        try {
            const newMessage = {
                senderId: currentUser.user._id, // ✅ Send from current user
                chatId: activeChat._id,
                content: msg,
                messageType: 'text',
            };

            // console.log("new Mesage", newMessage);

            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/message/send`, newMessage, {
                withCredentials: true,
            });

            console.log("Message sent:", res.data);

            setMsg("");
            socket.emit("new message", {
                chatId: activeChat._id,
                newMessage: res.data.newMessage
            });
            
            setChatMessages((prev) => [
                ...prev,
                {
                    ...res.data.newMessage,
                    senderId: currentUser.user // ✅ Ensure senderId is populated with current user
                },
            ]);            
        } catch (error) {
            console.error("Error sending message:", error.message);
        }
    }, [msg, activeChat, currentUser]);

    // ✅ Format time
    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // ✅ Format date headers (e.g., Today, Yesterday, Date)
    const getDateLabel = (date) => {
        const messageDate = new Date(date);
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        if (messageDate.toDateString() === today.toDateString()) return "Today";
        if (messageDate.toDateString() === yesterday.toDateString()) return "Yesterday";
        return messageDate.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    // ✅ Group messages by date
    const groupMessagesByDate = () => {
        const groups = {};

        chatMessages.forEach((msg) => {
            const dateLabel = getDateLabel(msg.createdAt);
            if (!groups[dateLabel]) groups[dateLabel] = [];
            groups[dateLabel].push(msg);
        });

        return groups;
    };

    const groupedMessages = groupMessagesByDate();

    return (
        <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
            {activeChat ? (
                <>
                    {/* ✅ Chat Header */}
                    <div className="p-4 h-20 border-b flex items-center justify-between bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg">
                        <div className="flex items-center space-x-3">
                            {activeChat.profilePic && (
                                <img
                                    src={activeChat.profilePic}
                                    alt={activeChat.chatName}
                                    className="w-10 h-10 rounded-full border-2 border-white shadow-md"
                                />
                            )}
                            <div>
                                <h3 className="font-bold text-lg">{activeChat.chatName}</h3>
                                <p className={`text-sm ${activeChat.isOnline ? 'text-green-400' : 'text-gray-400'}`}>
                                    {activeChat.isOnline ? "Online" : "Offline"}
                                </p>
                            </div>
                        </div>
                        <div className="flex space-x-4">
                            <button className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition">
                                <FiVideo className="w-5 h-5" />
                            </button>
                            <button className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition">
                                <FiPhone className="w-5 h-5" />
                            </button>
                            <button className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition">
                                <FiMoreVertical className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* ✅ Chat Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                        {Object.keys(groupedMessages).map((dateLabel) => (
                            <div key={dateLabel}>
                                <div className="text-center text-gray-400 text-sm py-2">
                                    {dateLabel}
                                </div>

                                {groupedMessages[dateLabel].map((msg) => (
                                    <div
                                        key={msg._id}
                                        className={`flex ${msg.senderId._id === currentUser.user._id ? 'justify-end' : 'justify-start'} mb-2`}
                                    >
                                        <div
                                            className={`max-w-[50%] min-w-[10%] p-3 rounded-xl shadow-md ${
                                                msg.senderId._id === currentUser.user._id
                                                    ? 'bg-blue-500 text-white'
                                                    : 'bg-white text-gray-800 border border-gray-200'
                                            }`}
                                        >
                                            {msg.messageType === 'text' && (
                                                <p className="text-sm leading-5">{msg.content}</p>
                                            )}

                                            {msg.messageType === 'image' && (
                                                <img src={msg.fileUrl} alt="Uploaded" className="max-w-full rounded-lg" />
                                            )}

                                            {msg.messageType === 'file' && (
                                                <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                                                    Download File
                                                </a>
                                            )}

                                            {/* ✅ Timestamp */}
                                            <p className="text-[10px] opacity-70 mt-1 text-right">
                                                {formatTime(msg.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>

                    {/* ✅ Message Input */}
                    <form
                        className="p-4 border-t flex items-center bg-white dark:bg-gray-800 shadow-md mb-28 md:mb-16"
                        onSubmit={handleSubmit}
                    >
                        <input
                            type="text"
                            placeholder="Type a message..."
                            value={msg}
                            onChange={(e) => setMsg(e.target.value)}
                            className="flex-1 p-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button type="submit" className="p-2 ml-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition">
                            <FiSend className="w-5 h-5" />
                        </button>
                    </form>
                </>
            ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                    Select a chat to start messaging
                </div>
            )}
        </div>
    );
}

export default ChatWindow;
