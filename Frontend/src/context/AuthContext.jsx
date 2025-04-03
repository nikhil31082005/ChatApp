import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data } = await axios.get("http://localhost:8080/api/auth/session", { withCredentials: true });
        setUser(data.user);
      } catch (error) {
        setUser(null);
      }
    };

    checkSession();
  }, []);

  const login = () => {
    window.open("http://localhost:8080/api/auth/google", "_self");
  };

  const logout = async () => {
    try {
      await axios.get("http://localhost:8080/api/auth/logout", {
        withCredentials: true,  // Important for sessions/cookies
      });
  
      setUser(null);
      navigate("/login");
      console.log("logout suucees")
  
      // Force refresh to ensure session is cleared
      window.location.reload();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  


  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
