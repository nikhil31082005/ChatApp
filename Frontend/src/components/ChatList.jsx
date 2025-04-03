import React from 'react';
import { FiSearch } from "react-icons/fi";

function ChatList({ chats, activeChat, setActiveChat }) {
    const formatTime = (date) => {
        if (!date) return '';
        const options = { hour: 'numeric', minute: 'numeric', hour12: true };
        return new Date(date).toLocaleString(undefined, options);
    };

    return (
        <div className="overflow-y-auto h-[calc(100vh-80px)] bg-gray-50 dark:bg-gray-900 shadow-md">
            {/* ✅ Search Bar */}
            <div className="p-4">
                <div className="relative">
                    <FiSearch className="absolute left-3 top-3 text-gray-400 dark:text-gray-300" />
                    <input
                        type="text"
                        placeholder="Search chats"
                        className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* ✅ Chat List */}
            {chats.map((chat) => {
                return (
                    <div
                        key={chat._id}
                        onClick={() => setActiveChat(chat)}
                        className={`p-4 flex items-center space-x-3 cursor-pointer transition ${
                            activeChat?._id === chat._id
                                ? "bg-blue-500 text-white"
                                : "hover:bg-blue-100 dark:hover:bg-gray-800"
                        }`}
                    >
                        {/* ✅ Profile Picture */}
                        <div className="relative">
                            <img
                                src={chat.profilePic}
                                alt={chat.chatName}
                                className="w-12 h-12 rounded-full shadow-md"
                            />
                            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 ${
                                chat.isOnline ? "bg-green-500 border-white" : "bg-gray-400 border-gray-200"
                            }`} />
                        </div>

                        {/* ✅ Chat Details */}
                        <div className="flex-1">
                            {/* ✅ Chat Name */}
                            <h4 className={`font-semibold ${
                                activeChat?._id === chat._id
                                    ? "text-white"
                                    : "text-gray-900 dark:text-white"
                            }`}>
                                {chat.chatName}({chat.email})
                            </h4>

                            {/* ✅ Last Message */}
                            <p className={`text-sm ${
                                activeChat?._id === chat._id
                                    ? "text-gray-200"
                                    : "text-gray-500 dark:text-gray-400"
                            }`}>
                                {chat.lastMessage
                                    ? `${chat.lastMessage.sender?.name || "You"}: ${chat.lastMessage.content}`
                                    : "No messages yet"}
                            </p>
                        </div>

                        {/* ✅ Last Message Time */}
                        {chat.lastMessage?.createdAt && (
                            <div className="text-sm text-gray-400">
                                {formatTime(chat.lastMessage.createdAt)}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export default ChatList;
