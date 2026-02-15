import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Shield, Lock, User, Loader2 } from "lucide-react";
import axios from "axios";
import bgImage from "../assets/ironman-wallpaper.jpg";
import toast from "react-hot-toast";

// Unified brand colors
const BRAND_COLOR = "#06B6D4";
const ACCENT_COLOR = "text-indigo-600";


export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
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

            localStorage.setItem("token", res.data.accessToken);
            localStorage.setItem("user", JSON.stringify(user));
            localStorage.setItem("auth", "true");

            toast.success("Login successful! Welcome back 👋");

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
            className="min-h-screen flex items-center justify-center bg-cover bg-center font-sans"
            style={{ backgroundImage: `url(${bgImage})` }}
        >
            <div className="absolute inset-0 bg-gray-900/70 backdrop-blur-md"></div>

            <div className="relative z-10 bg-white/95 border border-gray-200 rounded-[2rem] shadow-2xl p-8 sm:p-10 w-[400px]">
                <div className="flex flex-col items-center mb-8">
                    <Shield className="h-10 w-10 text-cyan-600 mb-3" />
                    <h1 className="text-3xl font-extrabold tracking-tighter text-gray-900 uppercase">
                        Admin Portal
                    </h1>
                    <p className="text-gray-500 text-[10px] font-extrabold uppercase tracking-[0.2em] mt-1">
                        Secure access to the CRM dashboard
                    </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">

                    {/* Username Input */}
                    <div className="relative">
                        <User className="absolute left-3 top-4 text-gray-400 h-4 w-4" />
                        <input
                            type="text"
                            placeholder="EMAIL"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-300 text-gray-800 placeholder-gray-400 rounded-xl py-3.5 pl-10 pr-3 transition focus:outline-none focus:ring-2 focus:ring-cyan-500 font-extrabold text-sm tracking-tight"
                            required
                        />
                    </div>

                    {/* Password Input */}
                    <div className="relative">
                        <Lock className="absolute left-3 top-4 text-gray-400 h-4 w-4" />
                        <input
                            type="password"
                            placeholder="PASSWORD"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-300 text-gray-800 placeholder-gray-400 rounded-xl py-3.5 pl-10 pr-3 transition focus:outline-none focus:ring-2 focus:ring-cyan-500 font-extrabold text-sm tracking-tight"
                            required
                        />
                    </div>

                    {/* Login Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-cyan-600 text-white font-extrabold py-3.5 rounded-xl
                                 shadow-lg shadow-cyan-500/30
                                 hover:bg-cyan-700 transition disabled:opacity-60
                                 flex justify-center items-center text-[10px] italic uppercase tracking-[0.2em]"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            "Sign In"
                        )}
                    </button>

                </form>

                <div className="mt-6 text-center">
                    <Link
                        to="/register"
                        // Font Change: Small bold label style
                        className={`text-[10px] font-extrabold uppercase italic tracking-[0.1em] ${ACCENT_COLOR} hover:underline`}
                    >
                        New User? Register here
                    </Link>
                </div>

                <div className="mt-8 text-center text-[9px] font-extrabold text-gray-400 uppercase tracking-[0.2em]">
                    © Stark Industries 2026
                </div>
            </div>
        </div>
    );
}