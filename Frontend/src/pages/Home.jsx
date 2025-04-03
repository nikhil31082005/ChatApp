import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import { FiArrowLeft } from "react-icons/fi";
import axios from "axios";
import UserProfile from "../components/UserProfile";
import ChatList from "../components/ChatList";
import ChatWindow from "../components/ChatWindow";

const Home = () => {
  const { user } = useAuth();
  const [activeChat, setActiveChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);

  // ✅ Handle screen resizing for responsive behavior
  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ Fetch chat data
  useEffect(() => {
    const fetchChat = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/chat/friend/${user._id}`, {
          withCredentials: true,
        });
        setChats(res.data);
      } catch (error) {
        console.error("Error fetching friends", error);
      }
    };
    fetchChat();
  }, [user._id]);

  return (
    <div className="flex h-screen w-full pt-16">
      {/* ✅ Sidebar */}
      {(!isMobileView || !activeChat) && (
        <div
          className={`transition-transform transform ${
            activeChat && isMobileView ? "-translate-x-full" : "translate-x-0"
          } w-full md:w-1/3 border-r border-gray-300`}
        >
          {/* ✅ Hide User Profile on Mobile */}
          <div className="hidden md:block">
            <UserProfile />
          </div>
          <ChatList chats={chats} activeChat={activeChat} setActiveChat={setActiveChat} />
        </div>
      )}

      {/* ✅ Chat Window */}
      {(!isMobileView || activeChat) && (
        <div
          className={`w-full md:w-2/3 transition-transform transform ${
            !activeChat && isMobileView ? "translate-x-full" : "translate-x-0"
          }`}
        >
          {/* ✅ Back Button on Mobile */}
          {isMobileView && activeChat && (
            <div className="p-4 bg-gray-800 text-white flex items-center shadow-md">
              <FiArrowLeft
                className="w-6 h-6 cursor-pointer mr-4"
                onClick={() => setActiveChat(null)}
              />
              <span className="font-semibold">{activeChat?.receiver?.name}</span>
            </div>
          )}
          <ChatWindow activeChat={activeChat} />
        </div>
      )}
    </div>
  );
};

export default Home;
