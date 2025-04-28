import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { clearAuthStorage } from "../utils/clearAuthStorage";

function useTokenExpiry() {
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      const token = localStorage.getItem("token");
      const expiryTime = localStorage.getItem("tokenExpiry");
      const now = Date.now();

      if (!expiryTime || !token || now > parseInt(expiryTime, 10)) {
        console.warn("No token or tokenExpiry - logging out");
        clearAuthStorage();
        navigate("/login");
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [navigate]);

  return localStorage.getItem("token");
}

export default useTokenExpiry;
