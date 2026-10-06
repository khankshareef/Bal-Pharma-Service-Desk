import { Outlet } from "react-router-dom";

import Admin_Header from "./Admin_Header";
import Admin_Sidebar from "./Admin_Sidebar";

const SuperAdminLayout = () => {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50">
      <Admin_Header />
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <Admin_Sidebar />
        <main className="flex-1 min-w-0 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SuperAdminLayout;