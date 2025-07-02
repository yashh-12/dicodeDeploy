import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center px-4">
      <h1 className="text-5xl sm:text-7xl font-extrabold text-indigo-500 mb-4 animate-pulse">
        404
      </h1>
      <p className="text-lg sm:text-2xl text-gray-400 mb-8 text-center">
        Oops! The page you are looking for does not exist.
      </p>
      <Link to="/">
        <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-all shadow-md hover:shadow-indigo-500/50">
          Back to Home 
        </button>
      </Link>
    </div>
  );
};

export default NotFound;
