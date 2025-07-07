import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Users, UserPlus, MessageSquare, LogOut } from "lucide-react";
import logo from "/code.png";
import useUser from "../provider/UserProvider";
import { logoutUser } from "../service/user.service";
import useLoader from "../provider/LoaderProvider";

const navItems = [
  { label: "Rooms", path: "/space/rooms", icon: <MessageSquare size={20} /> },
  { label: "Friends", path: "/space/friends", icon: <Users size={20} /> },
  { label: "Add Friend", path: "/space/add-friend", icon: <UserPlus size={20} /> },
];

export default function Sidebar() {
  const { setUserData } = useUser();
  const { setNavLoader } = useLoader();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const res = await logoutUser();
    if (res.success) {
      setNavLoader(true);
      setUserData(null);
      navigate("/");
      setNavLoader(false);
    }
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex flex-col justify-between bg-[#0b0b0b] border-r border-blue-400/10 w-20 sm:w-56 py-6 px-2 sm:px-4 shadow-[0_0_20px_#3b82f620]">

      <div>
        <NavLink
          to="/space/rooms"
          className="mb-8 flex items-center justify-center sm:justify-start"
        >
          <div className="relative group w-10 h-10 sm:w-12 sm:h-12">
            <div className="absolute inset-0 rounded-full bg-blue-500 blur-md opacity-30 group-hover:opacity-60 transition-all"></div>
            <img
              src={logo}
              alt="Logo"
              className="relative w-full h-full rounded-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          </div>
        </NavLink>

        <nav className="flex flex-col gap-2">
          {navItems.map(({ label, path, icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 px-3 py-2 rounded-full sm:rounded-lg transition-all duration-200
                ${isActive
                  ? "bg-blue-600/20 text-blue-300 shadow-[0_0_10px_#3b82f655]"
                  : "text-gray-300 hover:bg-blue-400/10 hover:text-blue-200 hover:shadow-[0_0_10px_#3b82f630]"
                }`
              }
            >
              <span className="shrink-0">{icon}</span>
              <span className="hidden sm:inline font-medium">{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="mt-6">
        <button
          onClick={handleLogout}
          className="group flex items-center gap-3 px-3 py-2 rounded-full sm:rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200 w-full"
        >
          <LogOut size={20} />
          <span className="hidden sm:inline font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
