import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api/api";
import { Home } from "lucide-react";

const TOKEN_EXPIRY_TIME = 5 * 60 * 1000;

function Login({ setToken }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const data = await loginUser({ email, password });

      if (data.access_token && data.refresh_token) {
        const expiryTime = Date.now() + TOKEN_EXPIRY_TIME;

        localStorage.setItem("token", data.access_token);
        localStorage.setItem("refresh_token", data.refresh_token);
        localStorage.setItem("role", data.role);
        localStorage.setItem("tokenExpiry", expiryTime.toString());

        console.log("Login as:", data.role, "| Expiry:", expiryTime);

        setToken(data.access_token);
        navigate("/dashboard");
      } else {
        setError(data.error || "Login failed");
      }
    } catch (error) {
      setError("Network error, try again later.");
      console.error("Login error:", error);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-[#000046] to-[#1cb5e0] flex items-center justify-center p-4 sm:p-8">
      <div className="bg-white rounded-lg w-full max-w-5xl flex flex-col md:flex-row overflow-hidden font-['Nunito'] shadow-lg">

        <div className="hidden md:block md:w-1/2 max-h-[750px] overflow-hidden">
            <img src="/images/form-v6.jpg" alt="form" className="h-full w-full object-fill" />
        </div>

        <div className="w-full md:w-1/2 p-8 md:p-10">
          <form onSubmit={handleSubmit} className="relative text-gray-800 font-bold w-full max-w-md mx-auto p-8 bg-white min-h-[500px]">
            {error && <p className="text-red-500">{error}</p>}
            <button onClick={() => navigate("/")} className="absolute top-0 right-0 z-50 flex items-center justify-center p-3 rounded-full bg-blue-600 text-white shadow-lg animate-pulse border-2 border-white hover:scale-105 hover:shadow-blue-500 transition-transform" title="Back to Home">
                <Home size={24} strokeWidth={2.5} className="drop-shadow-glow" />
            </button>
            <h2 className="text-[35px] text-center mt-36 mb-8">Log In</h2>

            <div className="mb-9">
              <input 
                type="email" 
                name="email" 
                placeholder="name@example.com" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                pattern="[^@]+@[^@]+\.[a-zA-Z]{2,6}"
                className="w-[92%] border-0 border-b-2 border-gray-300 focus:border-[#fe892a] outline-none p-2 text-[16px]" />
            </div>

            <div className="mb-9">
              <input 
                type="password" 
                name="password"
                placeholder="Password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-[92%] border-0 border-b-2 border-gray-300 focus:border-[#fe892a] outline-none p-2 text-[16px]" />
            </div>

            <div className="text-center">
                <input type="submit" value="Login"
                className="bg-[#fe892a] hover:bg-[#e37b27] text-white text-[20px] font-bold py-2 px-8 rounded-md shadow-md cursor-pointer" />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
