import { GiElectric } from "react-icons/gi";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import Reusable_Table, {
  type TableColumn,
} from "../../../component/table/Reusable_Table";
import type { RootState } from "../../../store/store/Store";

interface ActivityRow {
  id: string;
  TicketID: string;
  Subject: string;
  Status: string;
  Date: string;
}

const Dashboard_Chart = () => {
  const navigate = useNavigate();
  const { data } = useSelector((s: RootState) => s.dashboard);

  const overview = data?.statusOverview;
  const recentActivity = data?.recentActivity ?? [];

  const pieData = [
    { name: "In Progress", value: overview?.inProgress ?? 0, color: "#003D8C" },
    { name: "Open",        value: overview?.open        ?? 0, color: "#D97706" },
    { name: "Resolved",    value: overview?.resolved    ?? 0, color: "#059669" },
    { name: "Closed",      value: overview?.closed      ?? 0, color: "#374151" },
  ];

  const rows: ActivityRow[] = recentActivity.map((a, i) => ({
    id: `${a.ticketId}-${i}`,
    TicketID: a.ticketId,
    Subject: a.subject,
    Status: a.status,
    Date: a.date,
  }));

  const recentColumns: TableColumn<ActivityRow>[] = [
    { key: "TicketID", label: "Ticket ID", type: "text" },
    { key: "Subject",  label: "Subject",   type: "text" },
    { key: "Status",   label: "Status",    type: "badge" },
    { key: "Date",     label: "Date",      type: "text" },
  ];

  if (!overview) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 w-full">
        <div className="bg-white rounded-xl border border-gray-200 p-6 flex items-center justify-center text-gray-500">
          Loading status overview…
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 flex items-center justify-center text-gray-500">
          Loading recent activity…
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 w-full font-sans">
      <div className="bg-white rounded-xl shadow-[0_2px_12px_rgb(0,0,0,0.06)] border border-gray-200 p-6 flex flex-col h-full">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-gray-800 text-[15px]">
            Ticket Status Overview
          </h3>
          <p
            onClick={() => navigate("../my-tickets")}
            className="text-[13px] text-blue-600 hover:underline font-medium cursor-pointer"
          >
            View all →
          </p>
        </div>

        <div className="h-48 w-full relative mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
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
            <span className="text-2xl font-bold text-gray-800">
              {overview.total}
            </span>
            <span className="text-[11px] text-gray-500 uppercase font-semibold tracking-wider">
              Total
            </span>
          </div>
        </div>

        <div className="space-y-3 flex-grow">
          {/* Row 1 — status counts */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] font-medium text-gray-600">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#003D8C]" />
              In Progress:
              <strong className="text-gray-900">{overview.inProgress}</strong>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D97706]" />
              Open:
              <strong className="text-gray-900">{overview.open}</strong>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#059669]" />
              Resolved:
              <strong className="text-gray-900">{overview.resolved}</strong>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#374151]" />
              Closed:
              <strong className="text-gray-900">{overview.closed}</strong>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] font-medium text-gray-600 border-b border-gray-100 pb-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              Overdue:
              <strong className="text-gray-900">{overview.overdue}</strong>
            </div>
            <div className="flex items-center gap-1.5">
              ⏳ SLA On Track:
              <strong className="text-gray-900">{overview.slaOnTrack}</strong>
            </div>
            <div className="flex items-center gap-1.5">
              📊 Total:
              <strong className="text-gray-900">{overview.total}</strong>
            </div>
          </div>
        </div>

        {/* Footer summary */}
        <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 flex justify-between items-center text-[13px] font-semibold mt-4">
          <span className="text-gray-600">
            Total Tickets:{" "}
            <span className="text-gray-900">{overview.total}</span>
          </span>
          <span className="text-gray-600">
            Response Rate:{" "}
            <span className="text-gray-900">
              {overview.responseRatePercent ?? 0}%
            </span>
          </span>
        </div>
      </div>

      <div className="flex flex-col h-full bg-white rounded-xl shadow-[0_2px_12px_rgb(0,0,0,0.06)] border border-gray-200">
        <div className="flex justify-between items-center p-5 border-b border-gray-100">
          <h3 className="font-bold text-gray-800 text-[15px] flex items-center gap-2">
            <span className="text-blue-600">
              <GiElectric className="w-6 h-6" />
            </span>
            Recent Activity
          </h3>
          <span className="text-[12px] font-semibold text-gray-400">Live</span>
        </div>

        <div className="p-2 overflow-hidden flex-grow">
          {rows.length === 0 ? (
            <p className="p-6 text-sm text-gray-500">No recent activity.</p>
          ) : (
            <Reusable_Table
              columns={recentColumns}
              data={rows}
              enableSelection={false}
              showSearch={false}
              showFilters={false}
              showColumnControls={false}
              showExport={false}
              showPagination={false}
              showActions={false}
              maxHeight="400px"
              hideScrollbar={false}
              actions={{
                onRowClick: (row: ActivityRow) => {
                  navigate(`../my-tickets/tkt-details/${row.TicketID}`);
                },
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard_Chart;