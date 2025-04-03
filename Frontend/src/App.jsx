import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Navbar from "./components/Navbar";
import { useAuth } from "./context/AuthContext";
import Profile from "./pages/Profile";

const App = () => {
  const { user } = useAuth();

  // If user is not authenticated, show only the Login page
  if (!user) {
    return <Login />;
  }

  return (
    <div className="flex flex-col h-screen"> {/* Ensuring the full viewport height */}
      <div className=""> {/* Fixed height for Navbar */}
        <Navbar />
      </div>
      <div className="flex-1 overflow-hidden"> {/* Fill remaining space, no scrolling */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile/:userId" element={<Profile />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;

