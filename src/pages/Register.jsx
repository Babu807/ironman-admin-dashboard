import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Shield, User, Mail, Phone, Lock, Loader2 } from "lucide-react"; // Added Loader2
import axios from "axios";
import bgImage from "../assets/ironman-wallpaper.jpg";
import toast from "react-hot-toast";

// Define the unified brand colors
const ACCENT_COLOR = "text-indigo-600";

export default function Register() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        first_name: "",
        last_name: "",
        email: "",
        phone_number: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        if (!form.first_name.trim()) {
            toast.error("First name is required");
            return;
        }

        setLoading(true);

        try {
            const res = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/api/auth/crm/register`,
                {
                    ...form,
                    role: "super_admin",
                }
            );

            if (!res.data.status) {
                toast.error(res.data.message || "Registration failed");
                setLoading(false);
                return;
            }

            toast.success("Account created successfully! Redirecting to login…");

            setTimeout(() => {
                navigate("/login");
            }, 1200);

        } catch (err) {
            toast.error(
                err.response?.data?.message || "Something went wrong"
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
            {/* Soft dark overlay and subtle backdrop blur */}
            <div className="absolute inset-0 bg-gray-900/70 backdrop-blur-md"></div>

            {/* Registration Card: Clean white, subtle shadow, and rounded corners */}
            <div className="relative z-10 bg-white/95 border border-gray-200 rounded-3xl shadow-2xl p-8 sm:p-10 w-[400px]">
                <div className="flex flex-col items-center mb-8">
                    {/* Unified Logo/Icon Color: Cyan */}
                    <Shield className="h-10 w-10 text-cyan-600 mb-3" />
                    <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
                        ADMIN PORTAL
                    </h1>
                    <p className="text-gray-500 text-sm font-medium mt-1">
                        Create a New Admin Account
                    </p>
                </div>

                <form onSubmit={handleRegister} className="space-y-4"> {/* Reduced spacing */}

                    {/* First Name (required) */}
                    <div className="relative">
                        <User className="absolute left-3 top-3 text-gray-400 h-4 w-4" />
                        <input
                            type="text"
                            name="first_name"
                            placeholder="First Name *"
                            value={form.first_name}
                            onChange={handleChange}
                            required
                            className="w-full bg-gray-50 border border-gray-300 text-gray-800 placeholder-gray-500 rounded-lg py-3 pl-10 pr-3 transition focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                        />
                    </div>

                    {/* Last Name (optional) */}
                    <div className="relative">
                        <User className="absolute left-3 top-3 text-gray-400 h-4 w-4" />
                        <input
                            type="text"
                            name="last_name"
                            placeholder="Last Name (optional)"
                            value={form.last_name}
                            onChange={handleChange}
                            className="w-full bg-gray-50 border border-gray-300 text-gray-800 placeholder-gray-500 rounded-lg py-3 pl-10 pr-3 transition focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                        />
                    </div>

                    {/* Email (required) */}
                    <div className="relative">
                        <Mail className="absolute left-3 top-3 text-gray-400 h-4 w-4" />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email *"
                            value={form.email}
                            onChange={handleChange}
                            className="w-full bg-gray-50 border border-gray-300 text-gray-800 placeholder-gray-500 rounded-lg py-3 pl-10 pr-3 transition focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                            required
                        />
                    </div>

                    {/* Phone Number (optional) */}
                    <div className="relative">
                        <Phone className="absolute left-3 top-3 text-gray-400 h-4 w-4" />
                        <input
                            type="text"
                            name="phone_number"
                            placeholder="Phone Number (optional)"
                            value={form.phone_number}
                            onChange={handleChange}
                            className="w-full bg-gray-50 border border-gray-300 text-gray-800 placeholder-gray-500 rounded-lg py-3 pl-10 pr-3 transition focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                        />
                    </div>

                    {/* Password (required) */}
                    <div className="relative">
                        <Lock className="absolute left-3 top-3 text-gray-400 h-4 w-4" />
                        <input
                            type="password"
                            name="password"
                            placeholder="Password *"
                            value={form.password}
                            onChange={handleChange}
                            className="w-full bg-gray-50 border border-gray-300 text-gray-800 placeholder-gray-500 rounded-lg py-3 pl-10 pr-3 transition focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                            required
                        />
                    </div>

                    {/* Register Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        // Modern Button: Solid Cyan color, white text, subtle shadow
                        className="w-full bg-cyan-600 text-white font-semibold py-3 rounded-lg
                                 shadow-lg shadow-cyan-500/30
                                 hover:bg-cyan-700 transition disabled:opacity-60
                                 flex justify-center items-center text-sm tracking-wide mt-6"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            "CREATE ACCOUNT"
                        )}
                    </button>

                </form>


                <div className="mt-4 text-center">
                    <Link
                        to="/login"
                        className={`text-sm ${ACCENT_COLOR} hover:underline font-medium`}
                    >
                        Already have an account? Login
                    </Link>
                </div>

                <div className="mt-6 text-center text-xs text-gray-500">
                    © Stark Industries 2025
                </div>
            </div>
        </div>
    );
}