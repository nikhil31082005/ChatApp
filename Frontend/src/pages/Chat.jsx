import { useContext } from "react";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

const Chat = () => {
  const { user } = useContext(useAuth);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Navbar />
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold">Welcome, {user.name}!</h2>
        <p className="text-gray-600">Start chatting with your friends.</p>
      </div>
    </div>
  );
};

export default Chat;
