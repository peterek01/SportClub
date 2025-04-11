import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// /protected will only be available to logged in users
const ProtectedPage = () => {
    const [message, setMessage] = useState("");

    useEffect(() => {
        const fetchProtectedContent = async () => {
          const token = localStorage.getItem("token");
    
          try {
            const response = await fetch("http://127.0.0.1:5000/api/auth/me", {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
    
            if (!response.ok) {
              throw new Error("Unauthorized");
            }
    
            const data = await response.json();
            setMessage(data.msg);
          } catch (error) {
            setMessage("You are not allowed to view this content.");
          }
        };
    
        fetchProtectedContent();
    }, []);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
            <h1 className="text-3xl font-bold text-blue-600">Protected Content</h1>
            <p className="text-lg text-gray-700">{message}</p>
        </div>
    );
};

export default ProtectedPage;

