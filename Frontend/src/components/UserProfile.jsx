import React from 'react'
import { useAuth } from '../context/AuthContext'
import { FiSettings, FiVideo, FiPhone, FiMoreVertical, FiSearch, FiPaperclip, FiSend, FiSmile } from "react-icons/fi";
import { BsCircleFill } from "react-icons/bs";

function UserProfile() {
    const user = useAuth();
    console.log("user profile", user);
    return (
        <div className="p-4 border-b border-border bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg">
            <div className="flex items-center space-x-3">
                <img src={user.user.profilePic} alt="User" className="w-12 h-12 rounded-full border-2 border-white shadow-md" />
                <div className="flex-1">
                    <h3 className="font-bold text-white">My Profile ( {user.user.email} )</h3>
                    <div className="flex items-center space-x-2">
                        <BsCircleFill className="text-green-400 w-3 h-3" />
                        <span className="text-sm text-white">Online</span>
                    </div>
                </div>
                <button className="p-2 bg-white rounded-full shadow-md hover:bg-gray-200 transition">
                    <FiSettings className="w-5 h-5 text-gray-700" />
                </button>
            </div>
        </div>
    )
}

export default UserProfile