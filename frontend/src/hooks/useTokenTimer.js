import { useEffect, useState } from "react";

function useTokenTimer() {
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        const updateTimeLeft = () => {
            const expiry = localStorage.getItem("tokenExpiry");
            if (expiry) {
                const diff = parseInt(expiry, 10) - Date.now(); // from 1.1.1970
                setTimeLeft(diff > 0 ? Math.floor(diff / 1000) : 0);
            } else {
                setTimeLeft(0);
            }
        };

        updateTimeLeft(); // pierwsze odliczanie

        const interval = setInterval(updateTimeLeft, 1000); // odświezanie co sekunde

        return () => clearInterval(interval);
    }, []);

    return timeLeft;
}

export default useTokenTimer;