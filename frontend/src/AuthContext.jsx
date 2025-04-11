import React, { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { refreshToken as apiRefreshToken, loginUser } from "./api/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem("refresh_token") || null);
  const [role, setRole] = useState(localStorage.getItem("role") || null);

  const isAuthenticated = !!token;
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    }
    if (refreshToken) {
      localStorage.setItem("refresh_token", refreshToken);
    }
    if (role) {
      localStorage.setItem("role", role);
    }
  }, [token, refreshToken, role]);

  const login = async (username, password) => {
    const data = await loginUser({ username, password });
    setToken(data.access_token);
    setRefreshToken(data.refresh_token);
    setRole(data.role);
    navigate("/dashboard");
  };

  const logout = () => {
    setToken(null);
    setRefreshToken(null);
    setRole(null);
    localStorage.clear();
    navigate("/login");
  };

  const refresh = async () => {
    const newToken = await apiRefreshToken();
    if (newToken) setToken(newToken);
    else logout();
  };

  return (
    <AuthContext.Provider value={{ token, refreshToken, role, isAuthenticated, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
};