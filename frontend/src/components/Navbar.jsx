import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("jwt");

  const handleLogout = () => {
    localStorage.removeItem("jwt");
    navigate("/"); // redirect to Home
  };

  return (
    <nav className="flex flex-col md:flex-row justify-between items-center px-6 md:px-12 py-4 bg-primary sticky top-0 z-50 shadow-md">
      <Link to="/" className="text-textDark font-extrabold text-2xl flex items-center gap-2 hover:opacity-90 transition-opacity">
        🍲 myfoodblog
        <span className="text-white text-sm font-normal opacity-90 mt-1">taste of asia</span>
      </Link>

      <ul className="flex flex-col md:flex-row gap-6 mt-4 md:mt-0 list-none m-0 p-0 items-center">
        <li><Link to="/" className="text-textDark font-semibold hover:text-white transition-colors">Home</Link></li>
        <li><Link to="/about" className="text-textDark font-semibold hover:text-white transition-colors">About</Link></li>
        <li><Link to="/recipes" className="text-textDark font-semibold hover:text-white transition-colors">Recipes</Link></li>
        {!token && (
          <>
            <li><Link to="/register" className="text-textDark font-semibold hover:text-white transition-colors">Register</Link></li>
            <li>
              <Link to="/login">
                <Button variant="secondary" className="bg-white text-primary hover:bg-gray-100 font-bold rounded-full px-6">
                  Login
                </Button>
              </Link>
            </li>
          </>
        )}
        {token && (
          <>
            <li><Link to="/admin" className="text-textDark font-semibold hover:text-white transition-colors">Admin</Link></li>
            <li>
              <Button onClick={handleLogout} variant="ghost" className="text-textDark font-semibold hover:text-white hover:bg-transparent px-0 transition-colors">
                Logout
              </Button>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
