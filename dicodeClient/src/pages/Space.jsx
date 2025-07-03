import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../component/Sidebar";

function Space() {
  return (
    <div className="bg-[#0a0a0a] text-white min-h-screen flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <main className="flex-1 ml-20 sm:ml-64 p-4 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

export default Space;
