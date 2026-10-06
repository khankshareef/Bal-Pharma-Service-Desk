import { Outlet } from "react-router-dom";

import Exicutive_Header from "./Exicutive_Header";
import Exicutive_Sidebar from "./Exicutive_Sidebar";

const ExecutiveLayout = () => {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50">
      <Exicutive_Header />
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <Exicutive_Sidebar />
        <main className="flex-1 min-w-0 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ExecutiveLayout;