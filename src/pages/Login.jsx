import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Shield, Lock, User } from "lucide-react";
import axios from "axios";
import bgImage from "../assets/ironman-wallpaper.jpg";
import toast from "react-hot-toast";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/api/auth/crm/login`,
                {
                    email: username,
                    password,
                }
            );

            if (!res.data.status) {
                toast.error(res.data.message || "Login failed");
                setLoading(false);
                return;
            }

            const user = res.data.user;

            if (user.role !== "super_admin") {
                toast.error("Access denied. Only super admins can login.");
                setLoading(false);
                return;
            }

            // ✅ Success
            localStorage.setItem("token", res.data.accessToken);
            localStorage.setItem("user", JSON.stringify(user));
            localStorage.setItem("auth", "true");

            toast.success("Login successful! Welcome back 👋");

            // slight delay so toast is visible
            setTimeout(() => {
                navigate("/dashboard");
            }, 800);

        } catch (err) {
            toast.error(
                err.response?.data?.message || "Unable to login. Try again."
            );
        } finally {
            setLoading(false);
        }
    };


    return (
        <div
            className="min-h-screen flex items-center justify-center bg-cover bg-center"
            style={{ backgroundImage: `url(${bgImage})` }}
        >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

            <div className="relative z-10 bg-white/90 border border-[#FFD700]/40 rounded-2xl shadow-2xl p-8 w-[400px]">
                <div className="flex flex-col items-center mb-6">
                    <Shield className="h-10 w-10 text-[#B91C1C] mb-2" />
                    <h1 className="text-2xl font-display font-bold tracking-wider text-[#B91C1C]">
                        IRONMAN ADMIN
                    </h1>
                    <p className="text-gray-600 text-sm font-medium">
                        Access the Ironman Admin Panel
                    </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">

                    {/* Username */}
                    <div className="relative">
                        <User className="absolute left-3 top-2.5 text-gray-400 h-5 w-5" />
                        <input
                            type="text"
                            placeholder="Email"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400 rounded-md py-2 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
                            required
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
                            required
                        />
                    </div>

                    {/* Login Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-[#FFD700] to-[#B91C1C]
             text-black font-semibold py-2 rounded-md
             hover:opacity-90 transition disabled:opacity-60
             flex justify-center items-center"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        ) : (
                            "LOGIN"
                        )}
                    </button>

                </form>

                {/* Register Link */}
                <div className="mt-3 text-center">
                    <Link
                        to="/register"
                        className="text-sm text-[#B91C1C] hover:underline font-medium"
                    >
                        New User? Register here
                    </Link>
                </div>

                <div className="mt-4 text-center text-xs text-gray-600">
                    © Stark Industries 2025
                </div>
            </div>
        </div>
    );
}
