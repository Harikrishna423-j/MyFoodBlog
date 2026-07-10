import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Toast from "../Toast";          // ✅ adjust path if Toast is in src/
import { AuthContext } from "../AuthContext";  // ✅ adjust path if needed

axios.defaults.baseURL = "http://localhost:8000/api";
axios.defaults.withCredentials = true;

export default function Logout() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post("/logout/");
      logout();   // ✅ mark user unauthenticated via context
      navigate("/login");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <div className="logout-section">
      <h2>Are you sure you want to log out?</h2>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
