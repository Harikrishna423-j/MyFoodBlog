import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext();
const api = axios.create({ baseURL: "http://localhost:8000" });

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setUser(JSON.parse(savedUser));
    setLoading(false);
  }, []);

  // attach access token to every request
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem("access");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  // auto-refresh on 401
  api.interceptors.response.use(
    (res) => res,
    async (error) => {
      const original = error.config;
      if (error.response?.status === 401 && !original._retry) {
        original._retry = true;
        const refresh = localStorage.getItem("refresh");
        if (refresh) {
          try {
            const res = await api.post("/api/token/refresh/", { refresh });
            localStorage.setItem("access", res.data.access);
            original.headers.Authorization = `Bearer ${res.data.access}`;
            return api(original);
          } catch {
            logout();
          }
        }
      }
      return Promise.reject(error);
    }
  );

  const login = async (email, password) => {
    const res = await api.post("/api/login/", { email, password });
    localStorage.setItem("access", res.data.access);
    localStorage.setItem("refresh", res.data.refresh);
    localStorage.setItem("user", JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data;
  };

  const register = async (email, password) => {
    const res = await api.post("/api/register/", { email, password });
    localStorage.setItem("access", res.data.access);
    localStorage.setItem("refresh", res.data.refresh);
    localStorage.setItem("user", JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout, loading, api }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}