import { Outlet } from "react-router-dom";

import Dep_Header from "./Dep_Header";
import Dep_Sidebar from "./Dep_Sidebar";

const DepAdminLayout = () => {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50">
      <Dep_Header />
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <Dep_Sidebar />
        <main className="flex-1 min-w-0 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
export default DepAdminLayout;