import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../component/Header";

const Home = () => {
  const textOptions = ["Simple", "Easy", "Fast"];
  const [textIndex, setTextIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % textOptions.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white px-6 py-12 flex items-center justify-center">
      <Header />
      <div className="max-w-6xl w-full text-center">
        <h1 className="text-4xl sm:text-6xl font-extrabold mb-6 leading-tight">
          <span className="text-cyan-400">Real-time</span>{" "}
          <span className="text-white">Collaboration</span>{" "}
          <span
            className="text-indigo-400 whitespace-nowrap transition-all duration-500 ease-in-out drop-shadow-[0_0_6px_#6366f1]"
          >
            made {textOptions[textIndex]}
          </span>
        </h1>

        <div className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10">
          Share your code, notes live with others in seconds.
          Empower teamwork with drag-and-drop flow, Monaco editor, and more
          <div> — all in one place.</div>
        </div>



        <Link to="/login">
          <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition-all">
            Let’s Share 🚀
          </button>
        </Link>

        {/* Image with a glowing gradient border */}
        <div className="mt-16 relative w-full max-w-2xl mx-auto group">
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-500 blur-md opacity-60 group-hover:blur-lg group-hover:opacity-90 transition-all duration-300 z-0"></div>
          <img
            src="canvas.jpeg"
            alt="React Flow Canvas"
            className="relative rounded-2xl z-10 shadow-2xl hover:scale-105 transition-transform duration-300"
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
