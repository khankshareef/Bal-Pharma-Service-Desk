import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import Loader from "../../../component/loader/Loader";
import Reusable_Table, { type TableColumn } from "../../../component/table/Reusable_Table";
import type { AppDispatch, RootState } from "../../../store/store/Store";
import {
  fetchSuperManagerDashboard,
  type ActivityItem,
} from "../../../store/super_admin/slice/superManagerDashboardSlice";

const COLORS = [
  "#003D8C", "#1D4ED8", "#2563EB", "#3B82F6",
  "#60A5FA", "#D97706", "#F59E0B", "#FBBF24",
];

const SuperAdmin_DashboardChart = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data, loading } = useSelector(
    (s: RootState) => s.superManagerDashboard
  );

  useEffect(() => {
    dispatch(fetchSuperManagerDashboard());
  }, [dispatch]);

  const unitsData = useMemo(() => {
    const units = data?.units ?? [];
    return units.map((u) => ({
      name: `${u.unitName}: ${u.address}`,
      value: u.userCount,
      label: `${u.unitName}: ${u.userCount} users · ${u.address}`,
    }));
  }, [data]);

  const totalUsers = useMemo(
    () => unitsData.reduce((sum, u) => sum + u.value, 0),
    [unitsData]
  );

  const recentAdminData: ActivityItem[] = useMemo(
    () => data?.recentActivity ?? [],
    [data]
  );

  const adminColumns: TableColumn<ActivityItem>[] = useMemo(
    () => [
      { key: "time", label: "Time", type: "text" },
      { key: "activity", label: "Activity Details", type: "text" },
    ],
    []
  );

  if (loading && !data) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-8 font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#F8FAFC] border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col justify-center">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Units Overview</h2>

          {unitsData.length === 0 ? (
            <p className="text-sm text-gray-500">No units available.</p>
          ) : (
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
          )}
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-[0_2px_12px_rgb(0,0,0,0.06)] flex flex-col">
          <h2 className="text-lg font-bold text-gray-900 mb-2">
            User Distribution by Unit
          </h2>

          <div className="h-[200px] w-full relative">
            {unitsData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-gray-400 text-sm">
                No data available
              </div>
            ) : (
              <>
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
                      formatter={(value) => [`${value} Users`, "Total"]}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                      itemStyle={{
                        color: "#333",
                        fontSize: "13px",
                        fontWeight: 600,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-bold text-gray-800">{totalUsers}</span>
                  <span className="text-[11px] text-gray-500 uppercase font-semibold tracking-wider">
                    Total
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-[0_2px_12px_rgb(0,0,0,0.06)] p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">
            Recent Administrative Activity
          </h2>
          <button className="px-4 py-1.5 border border-gray-300 text-gray-600 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors">
            View all
          </button>
        </div>

        {recentAdminData.length === 0 ? (
          <p className="text-sm text-gray-500">No recent activity.</p>
        ) : (
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
        )}
      </div>
    </div>
  );
};

export default SuperAdmin_DashboardChart;