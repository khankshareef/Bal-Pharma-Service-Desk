import { type IconType } from "react-icons";
import { BiSolidDashboard } from "react-icons/bi";
import { BsTicketFill } from "react-icons/bs";
import { FaUsers } from "react-icons/fa";
import { FaBuilding, FaStar, FaTags } from "react-icons/fa6";
import { FcDepartment } from "react-icons/fc";
import { IoIosTimer, IoMdSettings } from "react-icons/io";
import { MdAssignmentAdd, MdLogout } from "react-icons/md";
import { Link, useLocation, useNavigate } from "react-router-dom";



interface MenuItem {
  label: string;
  path: string;
  icon: IconType;
}

const Dep_Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems: MenuItem[] = [
    {
      label: "Dashboard",
      path: "/deputy-manager/dashboard",
      icon: BiSolidDashboard,
    },
        {
      label: "All Tickets",
      path: "/deputy-manager/all-tickets",
      icon: BsTicketFill,
    },
    {
      label: "All Feedbacks",
      path: "/deputy-manager/all-feedback",
      icon: FaStar,
    },
    {
      label: "User Management",
      path: "/deputy-manager/user-management",
      icon: FaUsers,
    },
    
    {
      label: "Unit Management",
      path: "/deputy-manager/unit-management",
      icon: FaBuilding,
    },
   
    {
      label: "Departments",
      path: "/deputy-manager/department",
      icon: FcDepartment,
    },
    {
      label: "Categories",
      path: "/deputy-manager/categories",
      icon: FaTags,
    },
     {
          label: "Template Management",
          path: "/deputy-manager/template-management",
          icon: MdAssignmentAdd,
        },
    {
      label: "Audit Log",
      path: "/deputy-manager/audit-log",
      icon: IoIosTimer,
    },
    {
      label: "Settings",
      path: "/deputy-manager/settings",
      icon: IoMdSettings,
    },
  ];

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <aside
      className="
        group
        w-20
        hover:w-64
        bg-white
        border-r border-gray-100
        transition-all duration-300 ease-in-out
        flex flex-col
        h-full
        overflow-hidden
        shadow-[4px_0_24px_rgba(0,0,0,0.02)]
        z-20
      "
    >
      <div className="py-8 px-3 flex flex-col gap-2">
        {menuItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={index}
              to={item.path}
              className={`flex items-center px-1 py-1.5 rounded-xl transition-all duration-300 relative overflow-hidden ${
                isActive
                  ? "bg-[#003D8C] text-white shadow-md shadow-indigo-200"
                  : "text-gray-500 hover:bg-indigo-50 hover:text-[#003D8C]"
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-md" />
              )}

              <div className="min-w-[40px] flex items-center justify-center z-10">
                <item.icon
                  size={20}
                  className={isActive ? "text-white" : ""}
                />
              </div>
              <span
                className="
                  ml-2
                  font-medium
                  whitespace-nowrap
                  opacity-0
                  group-hover:opacity-100
                  transition-opacity duration-300
                  z-10
                "
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>

      <div className="mt-auto px-3 py-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="
            w-full
            flex items-center
            px-2 py-2
            rounded-xl
            transition-all duration-300
            relative overflow-hidden
            text-gray-500
            hover:bg-red-50
            hover:text-red-600
            cursor-pointer
          "
        >
          <div className="min-w-[40px] flex items-center justify-center z-10">
            <MdLogout
              size={22}
              className="transition-colors"
            />
          </div>
          <span
            className="
              ml-2
              font-medium
              whitespace-nowrap
              opacity-0
              group-hover:opacity-100
              transition-opacity duration-300
              z-10 cursor-pointer
            "
          >
            Logout
          </span>
        </button>
      </div>
    </aside>
  );
};

export default Dep_Sidebar;