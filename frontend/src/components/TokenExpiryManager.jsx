import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function TokenExpiryManager({ setToken }) {
    const location = useLocation();

    useEffect(() => {
      const token = localStorage.getItem("token");
      if (!token || token === "undefined") {
        localStorage.removeItem("tokenExpiry");
        return;
      }

      const expiryTime = Date.now() + 5 * 60 * 1000;
      localStorage.setItem("tokenExpiry", expiryTime.toString());
  
    }, [location.pathname]);
  
    return null;
  }

export default TokenExpiryManager;


