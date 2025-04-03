import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { FiMail, FiGlobe, FiMoon, FiSun, FiUserPlus, FiEdit2, FiPhone, FiVideo, FiSearch, FiMessageSquare, FiX, FiUpload } from "react-icons/fi";
import { FaTwitter, FaLinkedin, FaGithub } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";


const Profile = () => {
    const { userId } = useParams();
    const { user } = useAuth();
    const isCurrentUser = userId === user._id; // Check if visiting own profile
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [profileData, setProfileData] = useState({});

    // {
    //     name: "Sarah Anderson",
    //     email: "sarah.anderson@example.com",
    //     phone: "+1 (555) 123-4567",
    //     status: "Available for collaboration",
    //     isOnline: true,
    //     lastSeen: "2 minutes ago",
    //     website: "www.sarahanderson.dev",
    //     socialLinks: {
    //         twitter: "@sarahanderson",
    //         linkedin: "sarah-anderson",
    //         github: "sanderson"
    //     },
    //     visibility: true
    // }

    const getLastSeenText = (lastSeen) => {
        if (!lastSeen) return "Unknown";

        return formatDistanceToNow(new Date(lastSeen), { addSuffix: true });
    };


    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/profile/${userId}`);
                // console.log(res.data);
                setProfileData(res.data); // Store user data in state
            } catch (error) {
                console.error("Error fetching user:", error);
                // setError(error.response?.data?.error || "An error occurred");
            }
        };
        fetchUser();
    }, [userId]);


    const handleProfileUpdate = (field, value) => {
        setProfileData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleDarkModeToggle = () => setIsDarkMode(!isDarkMode);

    const handleConnectRequest = async () => {
        if (!user?._id || !userId) {
            alert("Invalid user ID!");
            return;
        }
    
        try {
            const res = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/friends/connect`,
                {
                    senderId: user._id,
                    receiverId: userId,
                },
                {
                    withCredentials: true,
                }
            );
    
            alert(res.data.message || "Connection request sent!");
        } catch (error) {
            console.error("Error sending connection request:", error);
            alert(error.response?.data?.message || "Failed to send request");
        }
    };
    
    return (
        <div className={`min-h-screen ${isDarkMode ? "dark bg-gray-900" : "bg-background"}`}>
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="flex justify-end mb-6">
                    <button
                        onClick={handleDarkModeToggle}
                        className="p-2 rounded-full hover:bg-secondary transition-colors"
                    >
                        {isDarkMode ? (
                            <FiSun className="w-6 h-6 text-white" />
                        ) : (
                            <FiMoon className="w-6 h-6 text-gray-700" />
                        )}
                    </button>
                </div>

                <div className="bg-card rounded-lg shadow-lg p-8">
                    <div className="relative w-40 h-40 mx-auto mb-6">
                        <img
                            src={profileData.profilePic}
                            alt="Profile"
                            className="w-full h-full rounded-full object-cover border-4 border-blue-700"
                            onError={(e) => {
                                e.target.src = "https://images.unsplash.com/photo-1511367461989-f85a21fda167";
                            }}
                            loading="lazy"
                        />
                        <div className="absolute bottom-2 right-2">
                            <div className={`w-4 h-4 rounded-full ${profileData.isOnline ? "bg-chart-2" : "bg-destructive"}`}></div>
                        </div>
                    </div>

                    <div className="text-center mb-8">

                        <h1 className="text-3xl font-heading mb-2">{profileData.name}</h1>
                        <p className="text-accent">{profileData.status}</p>
                        <p className="text-sm text-muted-foreground">Last seen {getLastSeenText(profileData.lastSeen)}</p>

                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <FiMail className="text-primary w-5 h-5" />
                                <span>{profileData.email}</span>
                            </div>
                            {/* <div className="flex items-center space-x-3">
                                <FiPhone className="text-primary w-5 h-5" />
                                <span>{profileData.phone}</span>
                            </div> */}
                            {/* <div className="flex items-center space-x-3">
                                <FiGlobe className="text-primary w-5 h-5" />
                                <span>{profileData.website}</span>
                            </div> */}
                        </div>

                        <div className="flex justify-center md:justify-start space-x-6">
                            <a href="#" className="text-accent hover:text-primary transition-colors">
                                <FaTwitter className="w-6 h-6" />
                            </a>
                            <a href="#" className="text-accent hover:text-primary transition-colors">
                                <FaLinkedin className="w-6 h-6" />
                            </a>
                            <a href="#" className="text-accent hover:text-primary transition-colors">
                                <FaGithub className="w-6 h-6" />
                            </a>
                        </div>
                    </div>

                    <div className="flex justify-between items-center">
                        {isCurrentUser ? (
                            <button
                                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                                <FiEdit2 className="w-4 h-4" />
                                <span>Edit Profile</span>
                            </button>
                        ) : (
                            <button
                                onClick={handleConnectRequest}
                                className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                            >
                                <FiUserPlus className="w-5 h-5" />
                                <span>Connect</span>
                            </button>
                        )}

                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-accent">Profile Visibility</span>
                            <button
                                onClick={() => handleProfileUpdate("visibility", !profileData.visibility)}
                                className={`w-12 h-6 rounded-full transition-colors ${profileData.visibility ? "bg-green-500" : "bg-gray-400"
                                    }`}
                            >
                                <div
                                    className={`w-5 h-5 rounded-full bg-white transform transition-transform ${profileData.visibility ? "translate-x-6" : "translate-x-1"
                                        }`}
                                ></div>
                            </button>
                        </div>
                    </div>

                </div>
                <div className="lg:col-span-2">
                    <div className="bg-card rounded-lg p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-heading font-heading text-foreground">Connected Users</h2>
                        </div>

                        {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto">
                            {connectedUsers.map((user) => (
                                <Link to={`profile/${user._id}`}>
                                    <div
                                    key={user.id}
                                    className="bg-secondary p-4 rounded-lg hover:shadow-sm transition-all"
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="relative">
                                            <img
                                                src={user.avatar}
                                                alt={user.name}
                                                className="w-12 h-12 rounded-full object-cover"
                                                loading="lazy"
                                            />
                                            <span
                                                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${user.status === "online" ? "bg-chart-2" : "bg-accent"}`}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-heading text-foreground">{user.name}</h3>
                                            <p className="text-sm text-accent">{user.lastSeen}</p>
                                        </div>
                                    </div>
                                </div>
                                </Link>
                            ))}
                        </div> */}
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Profile;
