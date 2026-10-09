import { useEffect, useMemo, useRef, useState } from "react";
import { FiBell, FiChevronDown, FiLogOut, FiUser } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import bal_pharma_limited_logo from "../../../assets/bal_pharma_limited_logo.jpg";
import type { AppDispatch, RootState } from "../../../store/store/Store";
import { logout } from "../../../store/user/slice/Login_Slice";
import {
  markAllNotificationsRead,
  markLiveNotificationRead,
  markNotificationRead,
  type Notification,
} from "../../../store/user/slice/NotificationSlice";
import Reusable_Button from "../../button/Reusable_Button";

const WarningIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="#F59E0B"
    stroke="#F59E0B"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <line x1="12" x2="12" y1="9" y2="13" stroke="white" />
    <line x1="12" x2="12.01" y1="17" y2="17" stroke="white" />
  </svg>
);

const InfoIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="#003D8C"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" x2="12" y1="16" y2="12" stroke="white" strokeWidth="2" />
    <line x1="12" x2="12.01" y1="8" y2="8" stroke="white" strokeWidth="2" />
  </svg>
);

const SuccessIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="#166534"
  >
    <circle cx="12" cy="12" r="10" />
    <path
      d="m8 12 3 3 5-6"
      stroke="white"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ErrorIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="#991B1B"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="9" y1="9" x2="15" y2="15" stroke="white" strokeWidth="2" />
    <line x1="15" y1="9" x2="9" y2="15" stroke="white" strokeWidth="2" />
  </svg>
);

const iconFor = (type: Notification["type"]) => {
  switch (type) {
    case "WARNING": return <WarningIcon />;
    case "SUCCESS": return <SuccessIcon />;
    case "ERROR":   return <ErrorIcon />;
    default:        return <InfoIcon />;
  }
};

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  const user = useSelector((s: any) => s.auth?.user ?? s.loginRoute?.user);
  const employeeId = user?.employeeId ?? "";

  console.log("User Role Find",user)

const { items: dbNotifications } = useSelector(
  (s: RootState) => s.notifications
);

const liveNotifications = useSelector(
  (s: RootState) => s.socket?.notifications ?? []
);

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}

const notifications = useMemo(() => {
  const seen = new Set<string>();
  const merged: Notification[] = [];

  for (const n of liveNotifications) {
    const key = String(n.id);
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push({
      id: typeof n.id === "number" ? n.id : -Math.abs(hashCode(String(n.id))),
      title: n.title,
      message: n.message,
      type: "INFO",
      ticketId: n.ticketId ?? null,
      isRead: n.read ?? false,
      createdAt: n.createdAt,
    } as Notification);
  }

  for (const d of dbNotifications) {
    const key = String(d.id);
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(d);
  }

  return merged;
}, [dbNotifications, liveNotifications]);

const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setIsNotificationOpen(false);
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

  const handleMarkAsRead = (id: number) => {
    if (id < 0) {
      dispatch(markLiveNotificationRead(id));
      return;
    }
    if (employeeId) dispatch(markNotificationRead({ id, employeeId }));
  };

  const handleMarkAllRead = () => {
    if (employeeId) dispatch(markAllNotificationsRead(employeeId));
  };

  const goToTicket = (notif: Notification) => {
    if (notif.ticketId) {
      const role = user?.activeRole ?? "";
      if (role === "EMPLOYEE") {
        navigate(`/employee/my-tickets/tkt-details/${notif.ticketId}`);
      } else if (role === "EXECUTIVE" || role === "DEPUTY_MANAGER") {
        navigate(`/executive/assigned/assigned-details/${notif.ticketId}`);
      } else {
        navigate(`/super-manager/all-tickets/${notif.ticketId}`);
      }
    }
    setIsNotificationOpen(false);
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
          onClick={() => navigate("/employee/dashboard")}
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
            Employee
          </h1>
          <p className="text-xs text-gray-500 font-medium">
            Bal Pharma Limited
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className={`relative p-2 rounded-full transition-colors focus:outline-none cursor-pointer ${
              isNotificationOpen
                ? "bg-blue-50 text-[#003D8C]"
                : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            <FiBell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {isNotificationOpen && (
            <div className="absolute right-[-60px] md:right-0 mt-3 w-[380px] bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-gray-100 flex flex-col z-[1000]">
              <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-[#F8FAFC] rounded-t-xl">
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    Notifications
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    You have {unreadCount} unread
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs text-blue-600 hover:underline font-medium"
                    >
                      Mark all read
                    </button>
                  )}
                  <Reusable_Button
                    children="View All"
                    variant="secondary"
                    onClick={() => {
                      setIsNotificationOpen(false);
                      navigate("/employee/notification");
                    }}
                    className="!px-3 !py-1.5 !text-xs"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2 p-3 max-h-[400px] overflow-y-auto bg-[#F8FAFC] rounded-b-xl">
                {notifications.length > 0 ? (
                  notifications.slice(0, 6).map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        handleMarkAsRead(notif.id);
                        goToTicket(notif);
                      }}
                      className={`relative flex flex-col p-3 pl-4 rounded-xl transition-all cursor-pointer border border-transparent ${
                        !notif.isRead
                          ? "bg-[#F0F6FF] hover:bg-[#e4effc]"
                          : "bg-white hover:bg-gray-50 border-gray-100"
                      }`}
                    >
                      {!notif.isRead && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#003D8C] rounded-l-xl" />
                      )}

                      <div className="flex items-center gap-2 mb-1">
                        {!notif.isRead && (
                          <div className="w-2 h-2 bg-[#003D8C] rounded-full mr-1 shrink-0" />
                        )}
                        {iconFor(notif.type)}
                        <h2
                          className={`font-bold text-sm ${
                            notif.isRead ? "text-gray-600" : "text-black"
                          }`}
                        >
                          {notif.title}
                        </h2>
                      </div>

                      <p className="text-xs text-gray-500 ml-6">
                        {notif.message}
                      </p>
                      <p className="text-[11px] text-gray-400 ml-6 mt-1">
                        {new Date(notif.createdAt).toLocaleString()}
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
              <span className="text-sm font-bold text-gray-700 leading-none">
                {user?.role
                  ? user.role
                      .split("_")
                      .map((w: string) => w.charAt(0) + w.slice(1).toLowerCase())
                      .join(" ")
                  : "User"}
              </span>
              <h2
                className="text-xs text-gray-900 truncate w-full"
                title={user?.name || "N/A"}
              >
                {user?.name || "N/A"}
              </h2>
            </div>

            <FiChevronDown
              className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${
                isProfileOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-3 w-max min-w-56 max-w-[300px] bg-white rounded-xl shadow-lg border border-gray-100 py-2 flex flex-col z-50">
              <button
                onClick={() => {
                  navigate("employee-profile");
                  setIsProfileOpen(false);
                }}
                className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:text-[#003D8C] transition-colors cursor-pointer whitespace-nowrap"
              >
                <FiUser size={18} />
                View Profile
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors mt-1 cursor-pointer whitespace-nowrap"
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

export default Header;