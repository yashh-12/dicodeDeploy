import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../component/Header";
import { registerUser } from "../service/user.service";
import logo from "/code.png"; // Add logo import
import useLoader from "../provider/LoaderProvider";

const Register = () => {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const {navLoader,setNavLoader} = useLoader();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setNavLoader(true);
    const res = await registerUser({ name, username, email, password });

    if (res.success) {
      navigate("/login")
    } else {
      setError(res.message)
      setTimeout(() => {
        setError("")
      }, 2000)
    }
    setNavLoader(false);
  };

  return (
    <div className="relative min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center px-4 overflow-hidden">
      <Header />
      {error && (
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-50 w-[90%] max-w-md">
          <div className="bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex justify-between items-center">
            <span className="text-sm font-medium">{error}</span>
            <button
              className="ml-4 text-white hover:text-gray-200 text-xl leading-none"
              onClick={() => setError("")}
            >
              &times;
            </button>
          </div>
        </div>
      )}
      {/* Neon animated glow */}
      <div className="absolute w-[360px] h-[500px] bg-gradient-to-br from-cyan-500 via-indigo-500 to-purple-600 rounded-3xl blur-2xl opacity-40 animate-pulse z-0" />

      {/* Glass Register card */}
      <div className="relative w-full max-w-sm z-10 bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-2xl shadow-2xl">

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Link to="/">
            <img
              src={logo}
              alt="Logo"
              className="w-12 h-12 hover:scale-110 transition-transform hover:drop-shadow-[0_0_10px_#0ff]"
            />
          </Link>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center text-indigo-400 mb-6 tracking-wide">
          Create an Account
        </h2>

        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            className="w-full px-4 py-3 rounded-lg bg-white/10 text-white border border-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            required
          />

          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="w-full px-4 py-3 rounded-lg bg-white/10 text-white border border-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            required
          />

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full px-4 py-3 rounded-lg bg-white/10 text-white border border-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-4 py-3 rounded-lg bg-white/10 text-white border border-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />

          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-500 hover:from-indigo-500 hover:to-cyan-500 text-white font-semibold shadow-md transition-all"
          >
            Register
          </button>
        </form>

        <p className="text-sm text-center text-gray-400 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-cyan-400 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
