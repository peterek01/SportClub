import { useEffect } from "react";
import { refreshToken } from "../api/api";
import { clearAuthStorage } from "../utils/clearAuthStorage";

function useTokenRefresh(setToken) {
  useEffect(() => {
    const storedRefresh = localStorage.getItem("refresh_token");
    const expiry = localStorage.getItem("tokenExpiry");
    const now = Date.now();

    // // Odświeżamy TYLKO jeśli oba tokeny są obecne
    if (!storedRefresh || storedRefresh === "undefined") return;

    if (expiry && now < parseInt(expiry)) {
      const existingToken = localStorage.getItem("token");
      if (existingToken && existingToken !== "undefined") {
        setToken(existingToken);
      }
      return;
    }

    const runRefresh = async () => {
      try {
        const newToken = await refreshToken();

        if (newToken) {
          console.log("✅ Odświeżono token:", newToken);
          setToken(newToken);
        } else {
          console.warn("Token refresh failed");
          clearAuthStorage();
          setToken(null)
        }
      } catch (error) {
        console.error("Error refreshing token:", error);
        clearAuthStorage();
        setToken(null);
      }
    };

    runRefresh();
  }, [setToken]);
}

export default useTokenRefresh;

