import { useMemo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import Reusable_Table, { type TableColumn } from "../../../component/table/Reusable_Table";

const DepAdmin_DashboardChart = () => {
  
  const unitsData = useMemo(() => [
    { name: "Unit 1: BommaSandra", value: 8, label: "Unit 1: 8 users · BommaSandra" },
    { name: "Unit 2: BommaSandra", value: 12, label: "Unit 2: 12 users · BommaSandra" },
    { name: "BHO: Bengaluru", value: 10, label: "BHO: 10 users · Bengaluru" },
    { name: "Unit 4: Rudrapur", value: 9, label: "Unit 4: 9 users · Rudrapur" },
    { name: "Unit 5: Sangli", value: 7, label: "Unit 5: 7 users · Sangli" },
    { name: "Unit 6: Udaipur", value: 6, label: "Unit 6: 6 users · Udaipur" },
    { name: "CWH: BommaSandra", value: 5, label: "CWH: 5 users · BommaSandra" },
    { name: "GGM: Gurugram", value: 4, label: "GGM: 4 users · Gurugram" },
  ], []);

  const COLORS = ["#003D8C", "#1D4ED8", "#2563EB", "#3B82F6", "#60A5FA", "#D97706", "#F59E0B", "#FBBF24"];

  const recentAdminData = useMemo(() => [
    { id: 1, Time: "Today 09:15 AM", Activity: "🔑 Employee EMP021 password reset (unit 2 BommaSandra)" },
    { id: 2, Time: "Today 10:05 AM", Activity: "➕ Department 'Production' added (Unit 3)" },
    { id: 3, Time: "Today 11:30 AM", Activity: "📝 Category 'Hardware' updated (All Units)" },
    { id: 4, Time: "Today 12:45 PM", Activity: "❌ User EMP034 deactivated (Unit 4)" },
  ], []);

  const adminColumns: TableColumn<typeof recentAdminData[0]>[] = useMemo(() => [
    { key: "Time", label: "Time", type: "text" },
    { key: "Activity", label: "Activity Details", type: "text" },
  ], []);

  return (
    <div className="w-full flex flex-col gap-8 font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#F8FAFC] border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col justify-center">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Units Overview</h2>
          <div className="flex flex-wrap gap-3">
            {unitsData.map((unit, index) => (
              <span 
                key={index} 
                className="px-3.5 py-1.5 bg-[#FFFBEB] text-[#92400E] border border-[#FEF3C7] text-[13px] font-bold rounded-lg shadow-sm whitespace-nowrap"
              >
                {unit.label}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-[0_2px_12px_rgb(0,0,0,0.06)] flex flex-col">
          <h2 className="text-lg font-bold text-gray-900 mb-2">User Distribution by Unit</h2>
          <div className="h-[200px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={unitsData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {unitsData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value} Users`, 'Total']}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  itemStyle={{ color: '#333', fontSize: '13px', fontWeight: 600 }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-gray-800">52</span>
              <span className="text-[11px] text-gray-500 uppercase font-semibold tracking-wider">Total</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-[0_2px_12px_rgb(0,0,0,0.06)] p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">Recent Administrative Activity</h2>
          <button className="px-4 py-1.5 border border-gray-300 text-gray-600 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors">
            View all
          </button>
        </div>

        <Reusable_Table 
          columns={adminColumns} 
          data={recentAdminData} 
          idKey="id" 
          itemsPerPage={5}
          showPagination={false}
          showActions={false}
          showSearch={false}
          showFilters={false}
          showColumnControls={false}
          showExport={false}
          enableSelection={false}
        />
      </div>

    </div>
  );
};

export default DepAdmin_DashboardChart;