import React from "react";
import { useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import { Home, Search, Plus, MessageCircle, User } from "lucide-react";

const Navbar = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const navItems = [
    { label: "Feed", path: "/feed", icon: Home, authOnly: false },
    { label: "Search", path: "/search", icon: Search, authOnly: false },
    { label: "Create", path: "/create-listing", icon: Plus, authOnly: true },
    { label: "Chat", path: "/chat", icon: MessageCircle, authOnly: true },
    {
      label: user ? "Profile" : "Login",
      path: user ? "/profile" : "/login",
      icon: User,
      authOnly: false,
    },
  ].filter((item) => !item.authOnly || user);

  const isActive = (path) => location.pathname === path;
  return (
    <>
      {/* Desktop — top navbar */}
      <nav className="hidden md:flex fixed top-0 left-0 right-0 z-50 items-center justify-between px-8 py-4 bg-white/10 backdrop-blur-md border-b border-white/20">
        <span
          onClick={() => navigate("/")}
          className="text-xl font-bold text-white cursor-pointer tracking-wide"
        >
          ReelEstate
        </span>

        <div className="flex items-center gap-6">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full transition-all
              ${
                isActive(item.path)
                  ? "bg-white text-primary-900"
                  : "text-white hover:bg-white/20"
              }`}
            >
              <item.icon size={16} />
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Mobile — bottom navbar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-4 py-3 bg-white/10 backdrop-blur-md border-t border-white/20">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center gap-1 text-xs font-semibold transition-all
            ${isActive(item.path) ? "text-white scale-110" : "text-white/60"}`}
          >
            <item.icon size={20} />
            {item.label}
          </button>
        ))}
      </nav>
    </>
  );
};

export default Navbar;
