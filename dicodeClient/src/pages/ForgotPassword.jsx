import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { sendOtpForfgtPwd, verifyOtpPassword } from "../service/user.service";
import useLoader from "../provider/LoaderProvider";

function ForgotPassword() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const {navLoader,setNavLoader} = useLoader();
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [enterOtpForm, setEnterOtpForm] = useState(false);
    const [error, setError] = useState("");

    const handleSendOtp = async (e) => {
        e.preventDefault();
        if (!email) return setError("Email is required");

        try {
            setNavLoader(true);
            const res = await sendOtpForfgtPwd(email);
            if (res?.success) {
                setEnterOtpForm(true);
                setError("");
            } else {
                setError(res?.message || "Failed to send OTP");
            }
            setNavLoader(false);
        } catch (err) {
            setError("Something went wrong. Try again.");
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();

        if (!otp || !newPassword || !confirmPassword) {
            return setError("All fields are required");
        }

        try {
            setNavLoader(true);
            const res = await verifyOtpPassword(otp, email, newPassword, confirmPassword);
            if (res?.success) {
                setOtp("");
                setNewPassword("");
                setConfirmPassword("");
                navigate("/login");
            } else {
                setError(res?.message || "Failed to reset password");
            }
            setNavLoader(false)
        } catch (err) {
            setError("Something went wrong. Try again.");
        }
    };

    return (
        <div className="relative min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center px-4 overflow-hidden">
            <div className="absolute w-[360px] h-[520px] bg-gradient-to-br from-cyan-500 via-indigo-500 to-purple-600 rounded-3xl blur-2xl opacity-40 animate-pulse z-0" />

            <div className="relative z-10 w-full max-w-md bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-2xl shadow-2xl">
                <div className="flex justify-center mb-6">
                    <Link to="/">
                        <img
                            src="code.png"
                            alt="Logo"
                            className="w-12 h-12 hover:scale-110 transition-transform hover:drop-shadow-[0_0_10px_#0ff]"
                        />
                    </Link>
                </div>

                <h2 className="text-3xl font-bold text-center text-indigo-400 mb-6">
                    {enterOtpForm ? "Reset Password" : "Recover Password"}
                </h2>

                {error && (
                    <div className="text-sm text-red-400 text-center mb-2">{error}</div>
                )}

                <form
                    onSubmit={enterOtpForm ? handleVerifyOtp : handleSendOtp}
                    className="space-y-4"
                >
                    {!enterOtpForm && (
                        <div className="flex flex-col">
                            <label htmlFor="email" className="text-sm text-gray-400 mb-1">
                                Email address
                            </label>
                            <input
                                type="email"
                                id="email"
                                placeholder="you@example.com"
                                className="p-3 bg-white/10 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    )}

                    {enterOtpForm && (
                        <>
                            <div className="flex flex-col">
                                <label htmlFor="otp" className="text-sm text-gray-400 mb-1">
                                    OTP sent to <span className="text-blue-300">{email}</span>
                                </label>
                                <input
                                    type="text"
                                    id="otp"
                                    placeholder="Enter OTP"
                                    className="p-3 bg-white/10 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="flex flex-col">
                                <label htmlFor="newPassword" className="text-sm text-gray-400 mb-1">
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    id="newPassword"
                                    placeholder="Enter new password"
                                    className="p-3 bg-white/10 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="flex flex-col">
                                <label htmlFor="confirmPassword" className="text-sm text-gray-400 mb-1">
                                    Confirm Password
                                </label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    placeholder="Confirm new password"
                                    className="p-3 bg-white/10 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </>
                    )}

                    <button
                        type="submit"
                        className="w-full py-3 rounded-lg bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-500 hover:from-indigo-500 hover:to-cyan-500 text-white font-semibold shadow-md transition-all"
                    >
                        {enterOtpForm ? "Reset Password" : "Send OTP"}
                    </button>
                </form>

                <div className="text-center mt-4 text-sm text-gray-400">
                    {enterOtpForm ? (
                        <>
                            Didn’t receive the code?{" "}
                            <button
                                type="button"
                                onClick={() => {
                                    setOtp("");
                                    setNewPassword("");
                                    setConfirmPassword("");
                                    setEnterOtpForm(false);
                                    setError("");
                                }}
                                className="text-blue-400 hover:underline"
                            >
                                Resend
                            </button>
                        </>
                    ) : (
                        <>
                            Remembered your password?{" "}
                            <Link to="/login" className="text-blue-400 hover:underline">
                                Login
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </div>
    );

}

export default ForgotPassword;
