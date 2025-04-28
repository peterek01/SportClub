import { useEffect } from "react";
import API_BASE_URL from "../api/api";

export function usePingBackend() {
  useEffect(() => {
    const interval = setInterval(() => {
      console.log("Sending ping to backend...");

      fetch(`${API_BASE_URL}/courses/public`)
        .then((response) => {
          if (response.ok) {
            console.log("Ping success");
          } else {
            console.warn("Ping failed");
          }
        })
        .catch((error) => {
          console.error("Ping error:", error);
        });

    }, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);
}
