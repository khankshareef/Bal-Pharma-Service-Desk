import React, { useEffect, useMemo, useState } from "react";
import { type IconType } from "react-icons";
import { BsTicketPerforated } from "react-icons/bs";
import {
  FiArrowDown,
  FiArrowUp,
  FiCalendar,
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiDownload,
  FiFilter,
  FiGlobe,
  FiGrid,
  FiList,
  FiPieChart,
  FiRefreshCcw,
  FiStar,
  FiTrendingUp,
} from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";

import Loader from "../../../component/loader/Loader";
import type { AppDispatch, RootState } from "../../../store/store/Store";
import {
  fetchAnalytics,
  type Analytics as AnalyticsData,
  type HeatCell,
} from "../../../store/super_admin/slice/analyticsSlice";

interface ReusableStatProps {
  title: string;
  value: string | number;
  icon?: IconType;
  subText?: string;
  subIcon?: IconType;
  subTextColor?: "green" | "red" | "orange" | "gray" | "blue";
  className?: string;
}

const Reusable_Stat: React.FC<ReusableStatProps> = ({
  title, value, icon: Icon, subText, subIcon: SubIcon,
  subTextColor = "green", className = "",
}) => {
  const badgeStyles: Record<string, string> = {
    green: "bg-emerald-50 text-emerald-700 border-emerald-100",
    red: "bg-rose-50 text-rose-700 border-rose-100",
    orange: "bg-amber-50 text-amber-700 border-amber-100",
    gray: "bg-slate-50 text-slate-600 border-slate-200",
    blue: "bg-[#003D8C]/10 text-[#003D8C] border-[#003D8C]/20",
  };
  return (
    <div className={`relative bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-[#003D8C]/30 hover:-translate-y-1 transition-all duration-300 ease-out flex flex-col overflow-hidden group cursor-pointer ${className}`}>
      <div className="flex justify-between items-start relative z-10">
        <div className="flex flex-col">
          <h3 className="text-gray-500 text-xs font-semibold tracking-wide uppercase mt-1">{title}</h3>
          <p className="text-gray-900 font-bold text-3xl mt-2 tracking-tight group-hover:text-[#0f2d4a] transition-colors duration-300">{value}</p>
        </div>
        {Icon && (
          <div className="p-2.5 bg-gray-50 border border-gray-100 rounded-xl text-gray-400 group-hover:text-[#003D8C] group-hover:bg-blue-50 transition-all duration-300">
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
      {subText && (
        <div className="mt-4 flex items-center relative z-10">
          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border ${badgeStyles[subTextColor]}`}>
            {SubIcon && <SubIcon className="w-3.5 h-3.5" />}
            {subText}
          </div>
        </div>
      )}
    </div>
  );
};

interface ChartCardProps {
  title?: string;
  icon?: IconType;
  children: React.ReactNode;
  className?: string;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, icon: Icon, children, className = "" }) => (
  <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-6 ${className}`}>
    {title && (
      <div className="flex items-center gap-2 mb-4">
        {Icon && <Icon className="text-gray-500" size={18} />}
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
      </div>
    )}
    {children}
  </div>
);

const heatmapColor = (count: number, max: number) => {
  if (max === 0) return { bg: "bg-[#e2e8f0]", fg: "text-gray-600" };
  const ratio = count / max;
  if (ratio > 0.8) return { bg: "bg-[#1e3a8a]", fg: "text-white" };
  if (ratio > 0.6) return { bg: "bg-[#1d4ed8]", fg: "text-white" };
  if (ratio > 0.4) return { bg: "bg-[#3b82f6]", fg: "text-white" };
  if (ratio > 0.2) return { bg: "bg-[#93c5fd]", fg: "text-gray-700" };
  return { bg: "bg-[#e2e8f0]", fg: "text-gray-600" };
};

const Analytics: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data, loading } = useSelector((s: RootState) => s.analytics);

  const today = new Date();
  const [startDate, setStartDate] = useState<Date>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 29);
    return d;
  });
  const [endDate, setEndDate] = useState<Date>(today);

  useEffect(() => {
    dispatch(fetchAnalytics({
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
    }));
  }, [dispatch, startDate, endDate]);

  const d: AnalyticsData | null = data;

  const heatmapCells: HeatCell[] = d?.heatmap ?? [];
  const maxHeat = useMemo(
    () => heatmapCells.reduce((m, c) => Math.max(m, c.count), 0),
    [heatmapCells]
  );
  const heatWeeks = Math.ceil(heatmapCells.length / 7) || 1;

  const formatDate = (date: Date) =>
    date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const dateRangeText = `${formatDate(startDate)} - ${formatDate(endDate)}`;
  const daysDiff = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const handlePreviousMonth = () => {
    const s = new Date(startDate); s.setMonth(s.getMonth() - 1);
    const e = new Date(endDate);   e.setMonth(e.getMonth() - 1);
    setStartDate(s); setEndDate(e);
  };
  const handleNextMonth = () => {
    const s = new Date(startDate); s.setMonth(s.getMonth() + 1);
    const e = new Date(endDate);   e.setMonth(e.getMonth() + 1);
    setStartDate(s); setEndDate(e);
  };
  const handleDateChange = (type: "start" | "end", value: string) => {
    const date = new Date(value);
    if (type === "start" && date <= endDate) setStartDate(date);
    if (type === "end"   && date >= startDate) setEndDate(date);
  };

  if (loading && !d) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader />
      </div>
    );
  }

  const priorityMax = Math.max(1, ...(d?.byPriority.map(b => b.value) ?? [1]));
  const categoryMax = Math.max(1, ...(d?.byCategory.map(b => b.value) ?? [1]));
  const unitMax     = Math.max(1, ...(d?.byUnit.map(u => u.hours) ?? [1]));
  const trendMax    = Math.max(1, ...(d?.monthlyTrend.map(t => t.value) ?? [1]));

  const ticketsDelta = d?.ticketsDeltaPercent ?? 0;
  const resolutionDelta = d?.resolutionDeltaHours ?? 0;
  const slaDelta = d?.slaDeltaPercent ?? 0;
  const satDelta = d?.satisfactionDelta ?? 0;

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-[#0f2d4a]">Analytics Dashboard</h1>
        <div className="flex items-center gap-4 text-sm">
          <button className="flex items-center gap-2 px-3 py-1.5 bg-[#e5ebf0] text-[#0f2d4a] rounded-full font-semibold text-xs border border-transparent hover:border-gray-300 transition-all">
            <FiGlobe size={14} /> All Units
          </button>
        </div>
      </div>

      <div className="bg-[#f8fafc] border border-gray-200 rounded-2xl p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-2 text-sm text-[#0f2d4a] font-semibold mr-2">
            <FiCalendar size={16} className="text-gray-500" /> Date Range:
          </span>
          <input type="date"
            value={startDate.toISOString().split("T")[0]}
            onChange={(e) => handleDateChange("start", e.target.value)}
            className="bg-white border border-gray-300 rounded-full px-4 py-1.5 text-sm text-gray-700 shadow-sm"
          />
          <span className="text-gray-500 text-sm">to</span>
          <input type="date"
            value={endDate.toISOString().split("T")[0]}
            onChange={(e) => handleDateChange("end", e.target.value)}
            className="bg-white border border-gray-300 rounded-full px-4 py-1.5 text-sm text-gray-700 shadow-sm"
          />
          <button
            onClick={() => {
              const now = new Date();
              const s = new Date(); s.setDate(s.getDate() - 7);
              setStartDate(s); setEndDate(now);
            }}
            className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-1.5 rounded-full text-sm font-medium shadow-sm"
          >7d</button>
          <button
            onClick={() => {
              const now = new Date();
              const s = new Date(); s.setDate(s.getDate() - 30);
              setStartDate(s); setEndDate(now);
            }}
            className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-1.5 rounded-full text-sm font-medium shadow-sm"
          >30d</button>
          <button
            onClick={() => {
              const now = new Date();
              const s = new Date(); s.setMonth(s.getMonth() - 3);
              setStartDate(s); setEndDate(now);
            }}
            className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-1.5 rounded-full text-sm font-medium shadow-sm"
          >90d</button>
          <button
            onClick={() => dispatch(fetchAnalytics({
              startDate: startDate.toISOString().split("T")[0],
              endDate: endDate.toISOString().split("T")[0],
            }))}
            className="bg-[#1f4e79] hover:bg-[#163a5a] text-white px-6 py-1.5 rounded-full text-sm font-semibold flex items-center gap-2 shadow-sm"
          >
            <FiFilter size={14} /> Apply
          </button>
          <button
            onClick={() => {
              const now = new Date();
              const s = new Date(); s.setDate(s.getDate() - 29);
              setStartDate(s); setEndDate(now);
            }}
            className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-5 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 shadow-sm"
          >
            <FiRefreshCcw size={14} /> Reset
          </button>
          <button className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-5 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 shadow-sm">
            <FiDownload size={14} /> Export Report
          </button>
        </div>
        <div className="text-xs text-gray-500 flex items-center gap-1.5 font-medium">
          <FiClock size={14} /> Last updated: Just now
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Reusable_Stat
          title="TOTAL TICKETS"
          value={(d?.totalTickets ?? 0).toLocaleString()}
          icon={BsTicketPerforated}
          subText={`${ticketsDelta >= 0 ? "+" : ""}${ticketsDelta}% from last period`}
          subIcon={ticketsDelta >= 0 ? FiArrowUp : FiArrowDown}
          subTextColor={ticketsDelta >= 0 ? "green" : "red"}
        />
        <Reusable_Stat
          title="AVG RESOLUTION TIME"
          value={`${(d?.avgResolutionHours ?? 0).toFixed(1)}h`}
          icon={FiClock}
          subText={`${resolutionDelta >= 0 ? "+" : ""}${resolutionDelta.toFixed(1)}h vs last period`}
          subIcon={resolutionDelta <= 0 ? FiArrowDown : FiArrowUp}
          subTextColor={resolutionDelta <= 0 ? "green" : "red"}
        />
        <Reusable_Stat
          title="SLA COMPLIANCE"
          value={`${d?.slaCompliancePercent ?? 0}%`}
          icon={FiCheckCircle}
          subText={`${slaDelta >= 0 ? "+" : ""}${slaDelta}% vs last period`}
          subIcon={slaDelta >= 0 ? FiArrowUp : FiArrowDown}
          subTextColor={slaDelta >= 0 ? "green" : "red"}
        />
        <Reusable_Stat
          title="USER SATISFACTION"
          value={(d?.userSatisfaction ?? 0).toFixed(1)}
          icon={FiStar}
          subText={`${satDelta >= 0 ? "+" : ""}${satDelta.toFixed(1)} vs last period`}
          subIcon={satDelta >= 0 ? FiArrowUp : FiArrowDown}
          subTextColor={satDelta >= 0 ? "green" : "red"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartCard title="Tickets by Priority" icon={FiList}>
          <div className="space-y-5 mb-6">
            {(d?.byPriority ?? []).map((item, i) => (
              <div key={i} className="flex items-center text-sm">
                <span className="w-20 text-gray-500">{item.label}</span>
                <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden mx-4">
                  <div className="h-full rounded-full"
                    style={{
                      width: `${(item.value / priorityMax) * 100}%`,
                      backgroundColor: item.color,
                    }} />
                </div>
                <span className="w-8 text-right font-bold text-gray-800">{item.value}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-4 text-xs mt-8">
            {(d?.byPriority ?? []).map((item, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-gray-500">
                  {item.label}: <span className="font-bold text-gray-800">{item.value}</span>
                </span>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Ticket Status Distribution" icon={FiPieChart}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-10 h-full pb-4">
            <div
              className="relative w-48 h-48 rounded-full shadow-inner"
              style={{
                background: (() => {
                  const buckets = d?.byStatus ?? [];
                  const total = buckets.reduce((a, b) => a + b.value, 0) || 1;
                  let acc = 0;
                  const stops: string[] = [];
                  buckets.forEach(b => {
                    const start = (acc / total) * 100;
                    acc += b.value;
                    const end = (acc / total) * 100;
                    stops.push(`${b.color} ${start}% ${end}%`);
                  });
                  return `conic-gradient(${stops.join(", ")})`;
                })(),
              }}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center pointer-events-none drop-shadow-md">
                <span className="text-3xl font-bold leading-tight">{d?.totalForStatus ?? 0}</span>
                <span className="text-xs font-medium opacity-80">Total</span>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              {(d?.byStatus ?? []).map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-gray-600 w-20">{item.label}</span>
                  <span className="text-gray-400 text-xs">({item.value})</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>
      </div>

      <ChartCard title="Monthly Ticket Trends" icon={FiTrendingUp} className="mb-6">
        <div className="h-64 flex items-end justify-between gap-2 md:gap-4 mt-8 pb-6 border-b border-gray-100">
          {(d?.monthlyTrend ?? []).map((item, i) => {
            const h = Math.max(6, (item.value / trendMax) * 100);
            return (
              <div key={i} className="relative flex flex-col items-center flex-1 h-full justify-end group">
                <span className="absolute -top-6 text-xs font-bold text-gray-700">{item.value}</span>
                <div className="w-8 md:w-12 bg-gradient-to-t from-[#205e94] to-[#4085c4] rounded-t-sm shadow-sm"
                  style={{ height: `${h}%` }} />
                <span className="absolute -bottom-6 text-xs text-gray-500">{item.month}</span>
              </div>
            );
          })}
        </div>
      </ChartCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartCard title="Tickets by Category" icon={FiList}>
          <div className="space-y-6 mt-4">
            {(d?.byCategory ?? []).map((item, i) => (
              <div key={i} className="flex items-center text-sm">
                <span className="w-24 text-gray-500">{item.label}</span>
                <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden mx-4">
                  <div className="h-full rounded-full"
                    style={{
                      width: `${(item.value / categoryMax) * 100}%`,
                      backgroundColor: item.color,
                    }} />
                </div>
                <span className="w-6 text-right font-bold text-gray-800">{item.value}</span>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Activity Heatmap" icon={FiCalendar}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs text-gray-500">
              Ticket creation volume by day ({heatmapCells.length} days)
            </p>
            <div className="flex items-center gap-2">
              <button onClick={handlePreviousMonth} className="p-1 hover:bg-gray-100 rounded">
                <FiChevronLeft size={16} />
              </button>
              <span className="text-xs font-medium text-gray-700">
                {formatDate(startDate)} - {formatDate(endDate)}
              </span>
              <button onClick={handleNextMonth} className="p-1 hover:bg-gray-100 rounded">
                <FiChevronRight size={16} />
              </button>
            </div>
          </div>

          <div
            className="grid gap-1.5 mb-4"
            style={{
              gridTemplateColumns: `repeat(${Math.min(heatWeeks * 7, 28)}, 1fr)`,
            }}
          >
            {heatmapCells.map((cell, i) => {
              const c = heatmapColor(cell.count, maxHeat);
              return (
                <div
                  key={i}
                  className={`${c.bg} rounded-sm flex items-center justify-center text-xs font-medium ${c.fg} aspect-square`}
                  title={`${cell.date}: ${cell.count} ticket(s)`}
                >
                  {i + 1}
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center text-[11px] text-gray-500">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 bg-[#e2e8f0] rounded-sm" />
              <div className="w-3 h-3 bg-[#93c5fd] rounded-sm" />
              <div className="w-3 h-3 bg-[#3b82f6] rounded-sm" />
              <div className="w-3 h-3 bg-[#1d4ed8] rounded-sm" />
              <div className="w-3 h-3 bg-[#1e3a8a] rounded-sm" />
            </div>
            <span>More</span>
          </div>
        </ChartCard>
      </div>

      <ChartCard title="Average Resolution Time by Unit" icon={FiClock} className="mb-6">
        <div className="space-y-5 mt-2">
          {(d?.byUnit ?? []).map((item, i) => (
            <div key={i} className="flex items-center text-sm">
              <span className="w-24 text-gray-500">{item.unitName}</span>
              <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden mx-4">
                <div className="h-full rounded-full bg-[#1f4e79]"
                  style={{ width: `${(item.hours / unitMax) * 100}%` }} />
              </div>
              <span className="w-12 text-right font-bold text-gray-800">
                {item.hours}h
              </span>
            </div>
          ))}
        </div>
      </ChartCard>

      <div className="flex flex-col md:flex-row justify-between items-center px-4 py-4 text-xs md:text-sm text-gray-600">
        <div className="flex items-center gap-2 mb-2 md:mb-0">
          <FiGrid className="text-gray-800" />
          <span className="font-bold text-gray-900">Data Freshness:</span> Real-time
        </div>
        <div>
          <span className="font-bold text-gray-900">Analytics Period:</span>{" "}
          {dateRangeText} ({daysDiff + 1} days)
        </div>
        <div className="flex items-center gap-2 mt-2 md:mt-0">
          <FiDownload className="text-gray-800" />
          <span className="font-bold text-gray-900">Export Options:</span> CSV, PDF, Excel
        </div>
      </div>
    </div>
  );
};

export default Analytics;