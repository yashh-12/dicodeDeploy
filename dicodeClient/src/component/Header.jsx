import React from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "/code.png"; 

const Header = () => {
  const location = useLocation();

  const links = [
    { name: "Home", to: "/", color: "text-cyan-400" },
    { name: "Signup", to: "/register", color: "text-indigo-400" },
    { name: "Login", to: "/login", color: "text-blue-400" },
  ];

  return (
    <header className="fixed top-4 left-4 right-4 z-50 flex items-center justify-between px-4 sm:px-8">

      <Link to="/" className="flex items-center gap-2">
        <img
          src={logo}
          alt="Logo"
          className="w-10 h-10 hover:drop-shadow-[0_0_8px_#0ff] transition-transform hover:scale-110"
        />
      </Link>

      <nav className="flex gap-6 text-sm sm:text-base font-medium">
        {links.map(({ name, to, color }) => (
          <Link
            key={to}
            to={to}
            className={`relative transition duration-200 ${
              location.pathname === to ? `${color} underline underline-offset-4` : "text-white"
            } hover:underline hover:underline-offset-4`}
          >
            {name}
          </Link>
        ))}
      </nav>
    </header>
  );
};

export default Header;
