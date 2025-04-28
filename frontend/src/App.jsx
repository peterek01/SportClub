import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import useTokenRefresh from "./hooks/useTokenRefresh";
import TokenExpiryManager from "./components/TokenExpiryManager";
import { clearAuthStorage } from "./utils/clearAuthStorage";

import Home from "./components/Home";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
// import CourseClasses from "./components/admin/CourseClasses";
import API_BASE_URL from "./api/api";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [role, setRole] = useState(localStorage.getItem("role") || null);

  useTokenRefresh(setToken);

  useEffect(() => {
    if (token && token !== "undefined" && token !== null) {
      localStorage.setItem("token", token);
    } else {
      clearAuthStorage();
    }
  }, [token]);

  useEffect(() => {
    if (!token || token === "undefined") return;
    
    fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data?.role) {
          setRole(data.role);
          localStorage.setItem("role", data.role);
        } else {
          console.error("No role found in response:", data);
        }
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        clearAuthStorage();
        setToken(null);
      });

  }, [token]);

  return (
    <Router>
      <TokenExpiryManager setToken={setToken} />
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login setToken={setToken} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard role={role} />} />
          {/* <Route path="/courses/:courseId/classes" element={<CourseClasses />} /> */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
