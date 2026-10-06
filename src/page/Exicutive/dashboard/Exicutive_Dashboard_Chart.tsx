import { useEffect, useMemo } from "react";
import { GiElectric } from "react-icons/gi";
import { useDispatch, useSelector } from "react-redux";
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

import { fetchExecStats } from "../../../store/exicutive/slice/execStatsSlice";
import type { AppDispatch, RootState } from "../../../store/store/Store";
import {
    fetchAssignedToExecutive,
    type Ticket,
} from "../../../store/user/slice/TicketsSlice";

interface RecentRow {
  id: number;
  TicketID: string;
  Subject: string;
  Status: string;
  Category: string;
  Date: string;
}

const humanize = (s?: string) =>
  s
    ? s
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" ")
    : "";

const formatDate = (iso?: string | null) =>
  iso
    ? new Date(iso).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const Exicutive_Dashboard_Chart = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const user = useSelector((s: any) => s.auth?.user ?? s.loginRoute?.user);
  const employeeId = user?.employeeId ?? "";

  const stats = useSelector((s: RootState) => s.execStats.data);
  const assigned = useSelector((s: RootState) => s.tickets.assignedTickets);

  useEffect(() => {
    if (!employeeId) return;
    dispatch(fetchExecStats(employeeId));
    dispatch(fetchAssignedToExecutive(employeeId));
  }, [dispatch, employeeId]);

  /* Priority split from the assigned list */
  const pieData = useMemo(() => {
    const counts = { High: 0, Medium: 0, Low: 0 };
    (assigned ?? []).forEach((t: Ticket) => {
      const p = (t.priority ?? "").toUpperCase();
      if (p === "HIGH") counts.High++;
      else if (p === "MEDIUM") counts.Medium++;
      else if (p === "LOW") counts.Low++;
    });
    return [
      { name: "High",   value: counts.High,   color: "#003D8C" },
      { name: "Medium", value: counts.Medium, color: "#D97706" },
      { name: "Low",    value: counts.Low,    color: "#059669" },
    ];
  }, [assigned]);

  const totalTickets = pieData.reduce((s, p) => s + p.value, 0);

  const responseRate = stats?.responseRate ?? 0;
  const breached     = stats?.breached ?? 0;
  const openCount    = stats?.openTickets ?? 0;
  const totalAssigned = stats?.totalAssigned ?? 0;

  const recentData: RecentRow[] = useMemo(() => {
    const sorted = [...(assigned ?? [])].sort((a, b) => {
      const da = new Date(a.createdAt ?? 0).getTime();
      const db = new Date(b.createdAt ?? 0).getTime();
      return db - da;
    });
    return sorted.slice(0, 7).map((t: Ticket) => ({
      id: t.id,
      TicketID: t.ticketCode,
      Subject: t.subject,
      Status: humanize(t.status),
      Category: t.categoryName ?? "—",
      Date: formatDate(t.createdAt),
    }));
  }, [assigned]);

  const recentColumns: TableColumn<RecentRow>[] = [
    { key: "TicketID", label: "Ticket ID", type: "text" },
    { key: "Subject",  label: "Subject",   type: "text" },
    { key: "Status",   label: "Status",    type: "badge" },
    { key: "Date",     label: "Date",      type: "text" },
  ];

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
                itemStyle={{ color: "#333", fontSize: "13px", fontWeight: 600 }}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-bold text-gray-800">
              {totalTickets}
            </span>
            <span className="text-[11px] text-gray-500 uppercase font-semibold tracking-wider">
              Total
            </span>
          </div>
        </div>

        <div className="space-y-3 flex-grow">
          <div className="flex flex-wrap items-center gap-4 text-[13px] font-medium text-gray-600">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#003D8C]"></span>
              High: <strong className="text-gray-900">{pieData[0].value}</strong>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D97706]"></span>
              Medium: <strong className="text-gray-900">{pieData[1].value}</strong>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#059669]"></span>
              Low: <strong className="text-gray-900">{pieData[2].value}</strong>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[13px] font-medium text-gray-600 border-b border-gray-100 pb-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
              📌 Unassigned: <strong className="text-gray-900">{openCount}</strong>
            </div>
            <div className="flex items-center gap-1.5">
              ⚠️ Breached SLA:{" "}
              <strong className="text-gray-900">{breached}</strong>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 flex justify-between items-center text-[13px] font-semibold mt-4">
          <span className="text-gray-600">
            Total Tickets: <span className="text-gray-900">{totalAssigned}</span>
          </span>
          <span className="text-gray-600">
            Response Rate: <span className="text-gray-900">{responseRate}%</span>
          </span>
        </div>
      </div>

      {/* Right side — recent activity */}
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
          <Reusable_Table
            columns={recentColumns}
            data={recentData}
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
              onRowClick: (row) => navigate(`assigned-details/${row.id}`),
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Exicutive_Dashboard_Chart;