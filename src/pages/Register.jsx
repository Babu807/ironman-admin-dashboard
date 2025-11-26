import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Shield, User, Mail, Phone, Lock } from "lucide-react";
import axios from "axios";
import bgImage from "../assets/ironman-wallpaper.jpg";

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
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            const res = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/api/auth/crm/register`,
                {
                    ...form,
                    role: "super_admin",
                }
            );

            if (res.data.status) {
                setSuccess("Account created successfully!");
                setTimeout(() => navigate("/login"), 1200);
            } else {
                setError(res.data.message || "Registration failed");
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
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
                        Create a New Admin Account
                    </p>
                </div>

                <form onSubmit={handleRegister} className="space-y-5">
                    {/* Error */}
                    {error && (
                        <div className="text-red-600 text-sm text-center font-medium">
                            {error}
                        </div>
                    )}

                    {/* Success */}
                    {success && (
                        <div className="text-green-600 text-sm text-center font-medium">
                            {success}
                        </div>
                    )}

                    {/* First Name (optional) */}
                    <div className="relative">
                        <User className="absolute left-3 top-2.5 text-gray-400 h-5 w-5" />
                        <input
                            type="text"
                            name="first_name"
                            placeholder="First Name (optional)"
                            value={form.first_name}
                            onChange={handleChange}
                            className="w-full bg-gray-50 border border-gray-300 rounded-md py-2 pl-10 pr-3 focus:ring-2 focus:ring-[#FFD700]"
                        />
                    </div>

                    {/* Last Name (optional) */}
                    <div className="relative">
                        <User className="absolute left-3 top-2.5 text-gray-400 h-5 w-5" />
                        <input
                            type="text"
                            name="last_name"
                            placeholder="Last Name (optional)"
                            value={form.last_name}
                            onChange={handleChange}
                            className="w-full bg-gray-50 border border-gray-300 rounded-md py-2 pl-10 pr-3 focus:ring-2 focus:ring-[#FFD700]"
                        />
                    </div>

                    {/* Email (required) */}
                    <div className="relative">
                        <Mail className="absolute left-3 top-2.5 text-gray-400 h-5 w-5" />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email *"
                            value={form.email}
                            onChange={handleChange}
                            className="w-full bg-gray-50 border border-gray-300 rounded-md py-2 pl-10 pr-3 focus:ring-2 focus:ring-[#FFD700]"
                            required
                        />
                    </div>

                    {/* Phone Number (optional) */}
                    <div className="relative">
                        <Phone className="absolute left-3 top-2.5 text-gray-400 h-5 w-5" />
                        <input
                            type="text"
                            name="phone_number"
                            placeholder="Phone Number (optional)"
                            value={form.phone_number}
                            onChange={handleChange}
                            className="w-full bg-gray-50 border border-gray-300 rounded-md py-2 pl-10 pr-3 focus:ring-2 focus:ring-[#FFD700]"
                        />
                    </div>

                    {/* Password (required) */}
                    <div className="relative">
                        <Lock className="absolute left-3 top-2.5 text-gray-400 h-5 w-5" />
                        <input
                            type="password"
                            name="password"
                            placeholder="Password *"
                            value={form.password}
                            onChange={handleChange}
                            className="w-full bg-gray-50 border border-gray-300 rounded-md py-2 pl-10 pr-3 focus:ring-2 focus:ring-[#FFD700]"
                            required
                        />
                    </div>

                    {/* Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-[#FFD700] to-[#B91C1C] text-black font-semibold py-2 rounded-md hover:opacity-90 transition disabled:opacity-60"
                    >
                        {loading ? "Registering..." : "REGISTER"}
                    </button>
                </form>


                <div className="mt-3 text-center">
                    <Link
                        to="/login"
                        className="text-sm text-[#B91C1C] hover:underline font-medium"
                    >
                        Already have an account? Login
                    </Link>
                </div>

                <div className="mt-4 text-center text-xs text-gray-600">
                    © Stark Industries 2025
                </div>
            </div>
        </div>
    );
}
