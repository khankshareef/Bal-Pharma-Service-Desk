import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import Loader from "../../../component/loader/Loader";
import Reusable_Stat from "../../../component/stats/Reusable_Stat";
import Reusable_Table, { type TableColumn } from "../../../component/table/Reusable_Table";

import type { AppDispatch, RootState } from "../../../store/store/Store";
import {
  fetchReports,
  type ReportRow,
} from "../../../store/super_admin/slice/reportsSlice";

interface Row {
  id: number;
  Department: string;
  Unit: React.ReactNode;
  Open: number;
  Closed: number;
  AvgRes: string;
}

const UnitPill = ({ value }: { value: string }) => {
  const v = value.toLowerCase();

  let cls = "bg-slate-100 text-slate-700";
  if (v === "all")          cls = "bg-[#F3E8FF] text-[#6B21A8]";
  else if (v.startsWith("unit")) cls = "bg-[#FEF3C7] text-[#92400E]";
  else if (v.startsWith("bho") || v.startsWith("cwh") || v.startsWith("ggm"))
                              cls = "bg-[#FFEDD5] text-[#C2410C]";

  return (
    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${cls}`}>
      {value}
    </span>
  );
};

const Reports = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [currentPage, setCurrentPage] = useState(1);

  const { data, loading } = useSelector((s: RootState) => s.reports);

  useEffect(() => {
    dispatch(fetchReports());
  }, [dispatch]);

  const reportData: Row[] = useMemo(() => {
    const rows: ReportRow[] = data?.rows ?? [];
    return rows.map((r, idx) => ({
      id: idx + 1,
      Department: r.department,
      Unit: <UnitPill value={r.unit} />,
      Open: r.open,
      Closed: r.closed,
      AvgRes: `${Math.round(r.avgResolutionHours)} hrs`,
    }));
  }, [data]);

  const reportColumns: TableColumn<Row>[] = useMemo(
    () => [
      { key: "Department", label: "Department", type: "text" },
      { key: "Unit",       label: "Unit",       type: "text" },
      { key: "Open",       label: "Open",       type: "text" },
      { key: "Closed",     label: "Closed",     type: "text" },
      { key: "AvgRes",     label: "Avg Resolution", type: "text" },
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
    <div className="max-w-full mx-auto font-sans">
      <div className="flex justify-between items-end mb-6">
        <h1 className="text-2xl font-bold text-[#002D5B]">Reports Dashboard</h1>
        <div className="text-sm text-gray-500">
          Home / <span className="text-gray-800">Reports</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
        <Reusable_Stat
          title="Total Tickets"
          value={(data?.totalTickets ?? 0).toLocaleString()}
        />
        <Reusable_Stat
          title="Open"
          value={String(data?.openTickets ?? 0)}
        />
        <Reusable_Stat
          title="Resolved"
          value={String(data?.resolvedTickets ?? 0)}
        />
        <Reusable_Stat
          title="Avg Resolution"
          value={`${Math.round(data?.avgResolutionHours ?? 0)}h`}
        />
      </div>

      <div>
        {reportData.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-500 font-medium">No report data available.</p>
          </div>
        ) : (
          <Reusable_Table
            columns={reportColumns}
            data={reportData}
            idKey="id"
            onPageChange={(page) => setCurrentPage(page)}
            enableSelection={false}
            itemsPerPage={6}
            currentPage={currentPage}
            showSearch={true}
            showFilters={true}
            showColumnControls={true}
            showExport={true}
            showPagination={true}
            showActions={false}
            filters={[
              {
                key: "Priority",
                label: "Priority",
                options: ["High", "Medium", "Low"],
              },
              {
                key: "Status",
                label: "Status",
                options: ["Open", "In Progress", "Resolved", "Closed"],
              },
              {
                key: "Category",
                label: "Category",
                options: [
                  "Network",
                  "Hardware",
                  "Software",
                  "Application",
                  "Security",
                  "Database",
                  "Infrastructure",
                  "Access & Permissions",
                ],
              },
            ]}
          />
        )}
      </div>
    </div>
  );
};

export default Reports;