import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { Button } from "@/components/ui/button";

function Register() {
  const [message, setMessage] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    const confirmPassword = e.target.confirmPassword.value;

    if (password !== confirmPassword) {
      setMessage("Passwords do not match!");
      return;
    }
    try {
      await register(email, password);
      navigate("/");
    } catch {
      setMessage("Registration failed!");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center">
        <h1 className="text-3xl font-extrabold text-primary mb-8 tracking-tight">Register</h1>
        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <input 
            type="email" 
            name="email" 
            placeholder="Email" 
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-700 bg-gray-50"
            required 
          />
          <input 
            type="password" 
            name="password" 
            placeholder="Password" 
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-700 bg-gray-50"
            required 
          />
          <input 
            type="password" 
            name="confirmPassword" 
            placeholder="Confirm Password" 
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-700 bg-gray-50"
            required 
          />
          <Button type="submit" className="w-full mt-2 bg-primary hover:bg-primaryHover text-white py-6 rounded-lg text-lg font-semibold transition-all">
            Register
          </Button>
        </form>
        {message && <p className="text-red-500 mt-4 font-semibold">{message}</p>}
      </div>
    </div>
  );
}

export default Register;