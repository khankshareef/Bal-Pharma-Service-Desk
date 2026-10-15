import { useEffect, useRef, useState } from "react";
import { FiChevronDown, FiLogOut, FiUser } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import bal_pharma_limited_logo from "../../../assets/bal_pharma_limited_logo.jpg";

import type { AppDispatch } from "../../../store/store/Store";
import { logout } from "../../../store/user/slice/Login_Slice";

const Admin_Header = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const user = useSelector((s: any) => s.auth?.user ?? s.loginRoute?.user);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const initials =
    user?.initials ||
    (user?.name
      ? user.name
          .split(" ")
          .map((n: string) => n.charAt(0))
          .slice(0, 2)
          .join("")
          .toUpperCase()
      : "NA");

  return (
    <header className="h-[72px] bg-white border-b border-gray-100 flex items-center justify-between pr-6 pl-4 shrink-0 shadow-sm z-[100] sticky top-0 font-sans">
      <div className="flex items-center gap-4">
        <div
          onClick={() => navigate("/super-manager/dashboard")}
          className="w-12 h-12 rounded-lg flex items-center justify-center cursor-pointer overflow-hidden"
        >
          <img
            src={bal_pharma_limited_logo}
            alt="Bal Pharma Limited"
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-800 tracking-tight">
            Super Manager
          </h1>
          <p className="text-xs text-gray-500 font-medium">
            Bal Pharma Limited
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 md:gap-6">

        <div className="hidden md:block h-8 w-px bg-gray-200" />

        <div className="relative flex-shrink-0" ref={dropdownRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 p-1 pr-2 rounded-full hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all focus:outline-none cursor-pointer max-w-full"
          >
            <div className="h-9 w-9 min-w-9 bg-[#003D8C]/10 rounded-full flex items-center justify-center text-[#003D8C] text-sm font-bold">
              {initials}
            </div>
            <div className="hidden md:flex flex-col items-start min-w-0 max-w-[180px]">
              <span className="text-sm font-bold text-gray-700 leading-none">Super Manager</span>
              <h2 className="text-xs text-gray-900 truncate w-full" title={user?.name || "N/A"}>
                {user?.name || "N/A"}
              </h2>
            </div>
            <FiChevronDown className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${isProfileOpen ? "rotate-180" : ""}`} />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-3 w-max min-w-56 max-w-[300px] bg-white rounded-xl shadow-lg border border-gray-100 py-2 flex flex-col z-50">
              <button
                onClick={() => { navigate("admin-profile"); setIsProfileOpen(false); }}
                className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:text-[#003D8C] transition-colors cursor-pointer whitespace-nowrap"
              >
                <FiUser size={18} /> View Profile
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors mt-1 cursor-pointer whitespace-nowrap"
              >
                <FiLogOut size={18} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Admin_Header;