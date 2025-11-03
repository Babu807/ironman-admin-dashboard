import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Lock, User } from "lucide-react";
import bgImage from "../assets/ironman-wallpaper.jpg";


export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        if (username === "admin" && password === "ironman") {
            localStorage.setItem("auth", "true");
            navigate("/dashboard");
        } else {
            alert("Invalid credentials! Try admin / ironman 😎");
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center bg-cover bg-center"
            style={{ backgroundImage: `url(${bgImage})` }}
        >
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

            {/* Card */}
            <div className="relative z-10 bg-white/90 border border-[#FFD700]/40 rounded-2xl shadow-2xl p-8 w-[400px]">
                <div className="flex flex-col items-center mb-6">
                    <Shield className="h-10 w-10 text-[#B91C1C] mb-2" />
                    <h1 className="text-2xl font-display font-bold tracking-wider text-[#B91C1C]">
                        IRONMAN ADMIN
                    </h1>
                    <p className="text-gray-600 text-sm font-medium">
                        Access the Stark Control Panel
                    </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                    {/* Username */}
                    <div className="relative">
                        <User className="absolute left-3 top-2.5 text-gray-400 h-5 w-5" />
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400 rounded-md py-2 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
                        />
                    </div>

                    {/* Password */}
                    <div className="relative">
                        <Lock className="absolute left-3 top-2.5 text-gray-400 h-5 w-5" />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400 rounded-md py-2 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
                        />
                    </div>

                    {/* Button */}
                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-[#FFD700] to-[#B91C1C] text-black font-semibold py-2 rounded-md hover:opacity-90 transition"
                    >
                        LOGIN
                    </button>
                </form>

                <div className="mt-4 text-center text-xs text-gray-600">
                    © Stark Industries 2025
                </div>
            </div>
        </div>
    );
}
