import { useEffect } from "react";
import {
  FiActivity,
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiInbox
} from "react-icons/fi";
import { HiOutlineTicket } from "react-icons/hi";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import Loader from "../../../component/loader/Loader";
import Reusable_Stat from "../../../component/stats/Reusable_Stat";
import Reusable_Table, {
  type TableColumn,
} from "../../../component/table/Reusable_Table";
import type { AppDispatch, RootState } from "../../../store/store/Store";
import {
  fetchEmployeeDashboard,
  type RecentTicketItem,
} from "../../../store/user/slice/dashboardSlice";
import Dashboard_Chart from "./Dashboard_Chart";

interface RowShape {
  id: string;
  TicketID: string;
  Subject: string;
  Department: string;
  Category: string;
  Priority: string;
  Status: string;
  SLA: string;
  Date: string;
}

const Dashboard = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const user = useSelector(
    (s: any) => s.auth?.user ?? s.loginRoute?.user
  );
  const employeeId = user?.employeeId ?? "";

  const { data, loading, error } = useSelector(
    (s: RootState) => s.dashboard
  );

  useEffect(() => {
    if (employeeId) dispatch(fetchEmployeeDashboard(employeeId));
  }, [dispatch, employeeId]);

  const rows: RowShape[] = (data?.recentTickets ?? []).map(
    (t: RecentTicketItem, i) => ({
      id: `${t.ticketId}-${i}`,
      TicketID: t.ticketId,
      Subject: t.subject,
      Department: t.department ?? "—",
      Category: t.category ?? "—",
      Priority: t.priority,
      Status: t.status,
      SLA: t.sla,
      Date: t.date,
    })
  );
  const columns: TableColumn<RowShape>[] = [
    { key: "TicketID", label: "Ticket ID", type: "text" },
    { key: "Subject",  label: "Subject",   type: "text" },
    { key: "Department", label: "Department", type: "text"},
    { key: "Category", label: "Category",  type: "text" },
    { key: "Priority", label: "Priority",  type: "badge" },
    { key: "Status",   label: "Status",    type: "badge" },
    { key: "SLA",      label: "SLA",       type: "sla" },
    { key: "Date",     label: "Date",      type: "text" },
  ];

  if (loading && !data) return <Loader />;
  if (error)
    return (
      <div className="p-8 text-red-600">
        Failed to load dashboard:{" "}
        {String(error?.error || error?.message || error)}
      </div>
    );
  if (!data) return null;

  const { kpis } = data;

  return (
    <div className="w-full">
      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <Reusable_Stat
          title="Total Tickets"
          value={String(kpis.totalTickets)}
          icon={HiOutlineTicket}
          subText={kpis.totalSlaText}
          subIcon={FiClock}
          subTextColor="blue"
        />
        <Reusable_Stat
          title="Open Tickets"
          value={String(kpis.openTickets)}
          icon={FiInbox}
          subText={kpis.openSlaText}
          subIcon={FiClock}
          subTextColor="orange"
        />
        <Reusable_Stat
          title="Resolved"
          value={String(kpis.resolvedTickets)}
          icon={FiCheckCircle}
          subText={kpis.resolvedAvgText}
          subIcon={FiClock}
          subTextColor="green"
        />
        <Reusable_Stat
          title="In Progress"
          value={String(kpis.inProgressTickets)}
          icon={FiActivity}
          subText={kpis.inProgressOverdueText}
          subIcon={FiAlertCircle}
          subTextColor="red"
        />
      </div>

      <Dashboard_Chart />

      <div className="mt-8">
        <div className="flex justify-between items-center mb-4 px-1">
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">
            Recent Tickets
          </h2>
          <button
            onClick={() => navigate("../my-tickets")}
            className="text-sm text-blue-600 hover:underline font-medium cursor-pointer"
          >
            View all →
          </button>
        </div>

        <Reusable_Table
          columns={columns}
          data={rows}
          idKey="id"
          actions={{
            showView: true,
            showEdit: false,
            showDelete: false,
            onView: (row) => navigate(`../my-tickets/tkt-details/${row.id.split("-")[0]}`),
          }}
          itemsPerPage={6}
          currentPage={1}
          onPageChange={() => {}}
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

export default Dashboard;