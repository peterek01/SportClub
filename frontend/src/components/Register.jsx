import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../api/api";
import { Home } from "lucide-react";

const TOKEN_EXPIRY_TIME = 5 * 60 * 1000;

function Register() {
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        confirm_password: "",
        date_of_birth: "",
        phone_number: "",
    });
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (formData.password !== formData.confirm_password) {
            setError("Password do not match");
            return;
        }

        try {
            const response = await registerUser(formData);

            localStorage.setItem("token", response.access_token);
            localStorage.setItem("refresh_token", response.refresh_token);
            localStorage.setItem("role", response.role);

            const expiryTime = Date.now() + TOKEN_EXPIRY_TIME;
            localStorage.setItem("tokenExpiry", expiryTime);

            navigate("/dashboard");
        } catch (err) {
            console.error("Registration error:", err);
            setError("Registration failed. Please try again later.")
        }
    };

    return (
        <div className="w-full min-h-screen bg-gradient-to-br from-[#000046] to-[#1cb5e0] flex items-center justify-center p-4 sm:p-8">
            <div className="bg-white rounded-lg w-full max-w-5xl flex flex-col md:flex-row overflow-hidden font-['Nunito'] shadow-lg">

                <div className="hidden md:block md:w-1/2 max-h-[750px] overflow-hidden">
                    <img src="/images/register-logo.jpg" alt="form" className="h-full w-full object-fill" />
                </div>

                <div className="w-full md:w-1/2 p-8 md:p-10">
                    <form onSubmit={handleSubmit} className="relative text-gray-800 font-bold w-full max-w-md mx-auto p-8 bg-white min-h-[500px]">
                        {error && <p className="text-red-500">{error}</p>}
                        <button type="button" onClick={() => navigate("/")} className="absolute top-0 right-0 z-50 flex items-center justify-center p-3 rounded-full bg-blue-600 text-white shadow-lg animate-pulse border-2 border-white hover:scale-105 hover:shadow-blue-500 transition-transform" title="Back to Home">
                            <Home size={24} strokeWidth={2.5} className="drop-shadow-glow" />
                        </button>
                        <h2 className="text-[35px] text-center mt-10">Register Form</h2>

                        <div className="flex gap-4 mt-10">
                            <input 
                                type="text" 
                                name="first_name" 
                                placeholder="First Name" 
                                required
                                value={formData.first_name}
                                onChange={handleChange}
                                className="w-[44%] border-0 border-b-2 border-gray-300 focus:border-[#fe892a] outline-none p-2 text-[16px]" />
                            <input 
                                type="text" 
                                name="last_name" 
                                placeholder="Last Name" 
                                required
                                value={formData.last_name}
                                onChange={handleChange}
                                className="w-[44%] border-0 border-b-2 border-gray-300 focus:border-[#fe892a] outline-none p-2 text-[16px]" />
                        </div>

                        <div className="mb-7">
                            <input 
                                type="date" 
                                name="date_of_birth" 
                                required
                                value={formData.date_of_birth}
                                onChange={handleChange}
                                className="w-[92%] border-0 border-b-2 border-gray-300 focus:border-[#fe892a] outline-none p-2 text-[16px]" />
                        </div>

                        <div className="mb-7">
                            <input 
                                type="text" 
                                name="phone_number"
                                placeholder="Phone Number"
                                required
                                value={formData.phone_number}
                                onChange={handleChange}
                                className="w-[92%] border-0 border-b-2 border-gray-300 focus:border-[#fe892a] outline-none p-2 text-[16px]" />
                        </div>

                        <div className="mb-7">
                            <input 
                                type="email" 
                                name="email" 
                                placeholder="Email Address" 
                                required
                                value={formData.email}
                                onChange={handleChange}
                                pattern="[^@]+@[^@]+\.[a-zA-Z]{2,6}"
                                className="w-[92%] border-0 border-b-2 border-gray-300 focus:border-[#fe892a] outline-none p-2 text-[16px]" />
                        </div>

                        <div className="mb-7">
                            <input 
                                type="password" 
                                name="password" 
                                placeholder="Password" 
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="w-[92%] border-0 border-b-2 border-gray-300 focus:border-[#fe892a] outline-none p-2 text-[16px]" />
                        </div>

                        <div className="mb-7">
                            <input 
                                type="password" 
                                name="confirm_password" 
                                placeholder="Confirm Password" 
                                required
                                value={formData.confirm_password}
                                onChange={handleChange}
                                className="w-[92%] border-0 border-b-2 border-gray-300 focus:border-[#fe892a] outline-none p-2 text-[16px]" />
                        </div>

                        <div className="text-center">
                            <input type="submit" value="Register"
                            className="bg-[#fe892a] hover:bg-[#e37b27] text-white text-[20px] font-bold py-2 px-8 rounded-md shadow-md cursor-pointer" />
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;

