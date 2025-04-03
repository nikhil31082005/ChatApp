import { useState, useCallback, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { FiSearch, FiSettings, FiBell, FiChevronDown, FiLogOut, FiCheck, FiX, FiMenu } from "react-icons/fi";
import { BsChatDots } from "react-icons/bs";
import { useAuth } from "../context/AuthContext";
import debounce from "lodash/debounce";
import axios from "axios";

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [friends, setFriends] = useState([]);
  const [query, setQuery] = useState("");
  const [request, setRequest] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  const [requestCount, setRequestCount] = useState(0);
  const notificationRef = useRef(null);

  const fetchUsers = async (searchTerm) => {
    if (!searchTerm) return setFriends([]);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/search?query=${searchTerm}`);
      setFriends(res.data);
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };

  const debouncedFetchUsers = useCallback(debounce(fetchUsers, 500), []);

  const handleChange = (e) => {
    setQuery(e.target.value);
    debouncedFetchUsers(e.target.value);
  };

  useEffect(() => {
    const fetchRequests = async () => {
      if (!user?._id) return;
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/friends/requests/${user._id}`, {
          withCredentials: true,
        });
        setRequest(res.data);
        setRequestCount(res.data.length);
      } catch (error) {
        console.error("Error fetching friend requests:", error);
      }
    };

    fetchRequests();
  }, [user._id]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotification(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleAccept = async (requestId) => {
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/friends/respond`,
        { requestId, action: "accept" },
        { withCredentials: true }
      );
      setRequest((prev) => prev.filter((req) => req._id !== requestId));
      setRequestCount((prev) => prev - 1);
    } catch (error) {
      console.error("Error accepting friend request:", error);
    }
  };

  const handleReject = async (requestId) => {
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/friends/respond`,
        { requestId, action: "reject" },
        { withCredentials: true }
      );
      setRequest((prev) => prev.filter((req) => req._id !== requestId));
      setRequestCount((prev) => prev - 1);
    } catch (error) {
      console.error("Error rejecting friend request:", error);
    }
  };

  return (
    <nav className="w-full bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg fixed top-0 z-50 text-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        {/* Logo and Mobile Menu Button */}
        <div className="flex items-center space-x-4">
          <button
            className="sm:hidden p-2 hover:bg-white/20 rounded-full transition"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <FiMenu className="h-6 w-6 text-white" />
          </button>
          <Link to="/" className="flex items-center space-x-2 text-white">
            <BsChatDots className="text-3xl" />
            <span className="text-xl font-semibold hidden sm:block">ChatApp</span>
          </Link>
        </div>

        {/* Search Bar (Hidden on Mobile by Default) */}
        <div className={`flex-1 max-w-xl px-6 ${isMobileMenuOpen ? "block" : "hidden sm:block"}`}>
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
            <input
              type="text"
              placeholder="Search chats or contacts"
              className="w-full pl-10 pr-4 py-2 bg-white text-gray-900 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-white transition-all duration-200"
              value={query}
              onChange={handleChange}
            />
            {friends.length > 0 && (
              <ul className="absolute bg-white border mt-2 w-full rounded-md shadow-lg">
                {friends.map((user) => (
                  <Link to={`profile/${user._id}`} key={user._id}>
                    <li className="p-2 flex items-center border-b last:border-none hover:bg-gray-100 cursor-pointer">
                      <img src={user.profilePic} alt={user.name} className="w-10 h-10 rounded-full mr-2" />
                      <span>{user.name} (@{user.email}) </span>
                    </li>
                  </Link>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Icons & Profile (Hidden on Mobile by Default) */}
        <div className={`flex items-center space-x-4 ${isMobileMenuOpen ? "block" : "hidden sm:flex"}`}>
          {/* Notifications */}
          <button
            className="relative p-2 hover:bg-white/20 rounded-full transition"
            onClick={() => setShowNotification(!showNotification)}
          >
            <FiBell className="h-6 w-6 text-white" />
            {requestCount > 0 && (
              <span className="absolute top-0 right-0 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                {requestCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {showNotification && (
            <div
              ref={notificationRef}
              className="absolute top-full right-10 mt-2 w-96 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
            >
              <div className="p-4 border-b">
                <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {request.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">No notifications</div>
                ) : (
                  request.map((notification) => (
                    <div key={notification._id} className="p-4 border-b hover:bg-gray-100 transition">
                      <Link to={`profile/${notification.sender._id}`} className="flex items-center">
                        <img src={notification.sender.profilePic} alt={notification.sender.name} className="h-10 w-10 rounded-full mr-3" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">
                            <strong>{notification.sender.name}</strong> sent you a friend request.
                          </p>
                        </div>
                        <div className="flex space-x-2 mt-2">
                          <button onClick={() => handleAccept(notification._id)} className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600">
                            <FiCheck className="w-5 h-5" />
                          </button>
                          <button onClick={() => handleReject(notification._id)} className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600">
                            <FiX className="w-5 h-5" />
                          </button>
                        </div>
                      </Link>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Settings */}
          {/* <button className="p-2 hover:bg-white/20 rounded-full transition">
            <FiSettings className="text-white text-xl" />
          </button> */}

          {/* User Profile Dropdown */}
          <div className="relative">
            <button className="flex items-center space-x-3 p-2 hover:bg-white/20 rounded-full transition" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
              <img src={user.profilePic} alt="User" className="w-8 h-8 rounded-full object-cover" />
              <FiChevronDown className="text-white" />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg">
                <Link to={`/profile/${user._id}`} className="block px-4 py-2 text-sm text-gray-900 hover:bg-gray-100">Profile</Link>
                <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center space-x-2">
                  <FiLogOut className="text-red-500" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;