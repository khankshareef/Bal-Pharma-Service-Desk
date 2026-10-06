import { useEffect, useRef, useState } from "react";
import { FiBell, FiChevronDown, FiLogOut, FiUser } from "react-icons/fi";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import bal_pharma_limited_logo from "../../../assets/bal_pharma_limited_logo.jpg";
import Reusable_Button from "../../button/Reusable_Button";

const WarningIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
    <line x1="12" x2="12" y1="9" y2="13" stroke="white"/>
    <line x1="12" x2="12.01" y1="17" y2="17" stroke="white"/>
  </svg>
);

const initialNotifications = [
  { id: 'TKT-0010', target: '4h', date: '07 Sept 2026', isRead: false },
  { id: 'TKT-0007', target: '4h', date: '07 Sept 2026', isRead: false },
  { id: 'TKT-0006', target: '24h', date: '07 Sept 2026', isRead: false },
  { id: 'TKT-0004', target: '8h', date: '07 Sept 2026', isRead: false },
  { id: 'TKT-0003', target: '24h', date: '07 Sept 2026', isRead: false },
  { id: 'TKT-0002', target: '8h', date: '07 Sept 2026', isRead: false },
  { id: 'TKT-0001', target: '4h', date: '07 Sept 2026', isRead: false },
];

const Dep_Header = () => {
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState(initialNotifications);
    const {user} = useSelector((state : any) => state.auth);
  const initials = `${user?.first_name?.charAt(0) || ""}${user?.last_name?.charAt(0) || ""}`.toUpperCase();


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    console.log("User logged out");
    navigate("/login");
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, isRead: true } : notif))
    );
  };

  return (
    <header className="h-[72px] bg-white border-b border-gray-100 flex items-center justify-between pr-6 pl-4 shrink-0 shadow-sm z-[100] sticky top-0 font-sans">
      <div className="flex items-center gap-4">
        <div
          onClick={() => navigate("/deputy-manager/dashboard")}
          className="w-12 h-12 rounded-lg flex items-center justify-center cursor-pointer overflow-hidden"
        >
          <img 
            src={bal_pharma_limited_logo} 
            alt="Bal Pharma Limited" 
            className="w-full h-full object-cover" 
          />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-800 tracking-tight">Deputy Manager</h1>
          <p className="text-xs text-gray-500 font-medium">Bal Pharma Limited</p>
        </div>
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        <div className="relative" ref={notificationRef}>
          <button 
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className={`relative p-2 rounded-full transition-colors focus:outline-none cursor-pointer ${isNotificationOpen ? 'bg-blue-50 text-[#003D8C]' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <FiBell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            )}
          </button>
          {isNotificationOpen && (
            <div className="absolute right-[-60px] md:right-0 mt-3 w-[380px] bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-gray-100 flex flex-col z-[1000] origin-top-right transition-all">
              <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-[#F8FAFC] rounded-t-xl">
                <div>
                  <h3 className="text-base font-bold text-gray-900">Notifications</h3>
                  <p className="text-xs text-gray-500 mt-0.5">You have {unreadCount} unread</p>
                </div>
                <Reusable_Button
                children = "View All"
                variant="secondary"
                onClick={()=>{navigate('notification') ? setIsNotificationOpen(false) :""}}
                 className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-full text-xs font-medium transition-colors
                    ${unreadCount > 0 
                      ? 'border-gray-300 text-gray-700 hover:bg-white hover:text-[#003D8C]' 
                      : 'border-gray-200 text-gray-400 cursor-not-allowed'}`}
                />
              </div>

              <div className="flex flex-col gap-2 p-3 max-h-[400px] overflow-y-auto bg-[#F8FAFC] rounded-b-xl">
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => markAsRead(notif.id)}
                      className={`relative flex flex-col p-3 pl-4 rounded-xl transition-all cursor-pointer border border-transparent
                        ${!notif.isRead 
                          ? 'bg-[#F0F6FF] hover:bg-[#e4effc]' 
                          : 'bg-white hover:bg-gray-50 border-gray-100' 
                        }`}
                    >
                      {!notif.isRead && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#003D8C] rounded-l-xl"></div>
                      )}

                      <div className="flex items-center gap-2 mb-1">
                        {!notif.isRead && (
                          <div className="w-2 h-2 bg-[#003D8C] rounded-full mr-1 shrink-0"></div>
                        )}
                        <WarningIcon />
                        <h2 className={`font-bold text-sm ${notif.isRead ? 'text-gray-600' : 'text-black'}`}>
                          Ticket {notif.id} SLA breached!
                        </h2>
                      </div>

                      <p className="text-xs text-gray-500 ml-6">
                        Ticket has exceeded SLA target of {notif.target}.
                      </p>
                      <p className="text-[11px] text-gray-400 ml-6 mt-1">
                        {notif.date}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-sm text-gray-500">
                    No notifications right now.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="hidden md:block h-8 w-px bg-gray-200"></div>
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 p-1 pr-2 rounded-full hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all focus:outline-none cursor-pointer"
          >
            <div className="h-full w-full bg-[#003D8C]/10 rounded-full flex items-center justify-center text-[#003D8C] text-xl font-bold">
          {initials}
        </div>
            
            <div className="hidden md:flex flex-col items-start">
              <span className="text-sm font-bold text-gray-700 leading-none">Deputi-Manager</span>
              <span className="text-xs text-gray-500 mt-1">Deputy-Manager</span>
            </div>

            <FiChevronDown
              className={`text-gray-400 transition-transform duration-200 ${
                isProfileOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 flex flex-col z-50 transform opacity-100 scale-100 transition-all duration-200 origin-top-right">
              
              <div className="px-4 py-2 border-b border-gray-100 md:hidden flex flex-col cursor-pointer">
                <span className="text-sm font-bold text-gray-700">User User</span>
                <span className="text-xs text-gray-500">User</span>
              </div>

              <button
                onClick={() => {
                  navigate("deuputy-manager-profile");
                  setIsProfileOpen(false);
                }}
                className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:text-[#003D8C] transition-colors cursor-pointer"
              >
                <FiUser size={18} />
                View Profile
              </button>
              
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors mt-1 cursor-pointer"
              >
                <FiLogOut size={18} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Dep_Header;