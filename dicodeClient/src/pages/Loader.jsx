import React from "react";

function Loader() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400 via-indigo-500 to-purple-600 blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-t-transparent border-indigo-400 rounded-full animate-spin"></div>
        </div>
      </div>
    </div>
  );
}

export default Loader;
