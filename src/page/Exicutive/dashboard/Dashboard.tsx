import { useEffect, useMemo, useState } from "react";
import {
    FiActivity,
    FiAlertCircle,
    FiCheckCircle,
    FiClock,
    FiInbox,
} from "react-icons/fi";
import { HiOutlineTicket } from "react-icons/hi";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import ReusablePopup from "../../../component/popups/Reusable_Popup";
import Reusable_Stat from "../../../component/stats/Reusable_Stat";
import Reusable_Table, {
    type TableColumn,
} from "../../../component/table/Reusable_Table";

import {
    fetchExecDashboard,
    type RecentTicketItem,
} from "../../../store/exicutive/slice/execDashboardSlice";
import type { AppDispatch, RootState } from "../../../store/store/Store";
import Exicutive_Dashboard_Chart from "./Exicutive_Dashboard_Chart";

interface Row {
  id: number;
  TicketID: string;
  Subject: string;
  Category: string;
  Priority: string;
  Status: string;
  SLA: string;
  Date: string;
}

const Dashboard = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [errorPopup, setErrorPopup] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const user = useSelector((s: any) => s.auth?.user ?? s.loginRoute?.user);
  const employeeId = user?.employeeId ?? "";

  const { meApiError } = useSelector((state: any) => state.auth);
  const { data: dashboard } = useSelector((s: RootState) => s.execDashboard);

  useEffect(() => {
    if (meApiError?.code === "PASSWORD_CHANGE_REQUIRED") {
      setErrorPopup(true);
    }
  }, [meApiError]);

  useEffect(() => {
    if (!employeeId) return;
    dispatch(fetchExecDashboard(employeeId));
  }, [dispatch, employeeId]);

  const rows: Row[] = useMemo(() => {
    const list: RecentTicketItem[] = dashboard?.recentTickets ?? [];
    return list.map((t) => ({
      id: t.id,
      TicketID: t.ticketId,
      Subject: t.subject,
      Category: t.category ?? "—",
      Priority: t.priority,
      Status: t.status,
      SLA: t.sla,
      Date: t.date,
    }));
  }, [dashboard]);

  const columns: TableColumn<Row>[] = useMemo(
    () => [
      { key: "TicketID", label: "Ticket ID", type: "text" },
      { key: "Subject",  label: "Subject",   type: "text" },
      { key: "Category", label: "Category",  type: "text" },
      { key: "Priority", label: "Priority",  type: "badge" },
      { key: "Status",   label: "Status",    type: "badge" },
      { key: "SLA",      label: "SLA",       type: "sla" },
      { key: "Date",     label: "Date",      type: "text" },
    ],
    []
  );

  /* -------- KPI values (from kpis, not from stats) -------- */
  const kpis = dashboard?.kpis;
  const overview = dashboard?.statusOverview;

  const openCount     = kpis?.openTickets        ?? 0;
  const assignedCount = kpis?.inProgressTickets  ?? 0;   // assigned & being worked
  const investigation = kpis?.inProgressTickets  ?? 0;
  const resolvedCount = kpis?.resolvedTickets    ?? 0;
  const breached      = overview?.overdue        ?? 0;
  const slaPct        = overview?.responseRatePercent ?? 0;

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <Reusable_Stat
          title="Open Tickets"
          value={String(openCount)}
          icon={HiOutlineTicket}
          subText={`SLA: ${slaPct}% on track`}
          subIcon={FiClock}
          subTextColor="blue"
        />
        <Reusable_Stat
          title="Assigned to Me"
          value={String(assignedCount)}
          icon={FiInbox}
          subText="Active now"
          subIcon={FiClock}
          subTextColor="blue"
        />
        <Reusable_Stat
          title="In Investigation"
          value={String(investigation)}
          icon={FiCheckCircle}
          subText={`Escalated: ${breached}`}
          subIcon={FiClock}
          subTextColor="red"
        />
        <Reusable_Stat
          title="Resolved"
          value={String(resolvedCount)}
          icon={FiActivity}
          subText="Total resolved"
          subIcon={FiAlertCircle}
          subTextColor="green"
        />
      </div>

      <div>
        <Exicutive_Dashboard_Chart />
      </div>

      <div className="mt-8">
        <div className="flex justify-between items-center mb-4 px-1">
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">
            Recent Tickets
          </h2>
        </div>

        <Reusable_Table
          columns={columns}
          data={rows}
          idKey="id"
          actions={{
            showView: true,
            onView: (row) => navigate(`assigned-details/${row.id}`),
            onRowClick: (row) => navigate(`assigned-details/${row.id}`),
          }}
          itemsPerPage={6}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          showPagination={false}
          showActions={false}
          showSearch={false}
          showFilters={false}
          showColumnControls={false}
          showExport={false}
          enableSelection={false}
        />
      </div>

      {errorPopup && (
        <ReusablePopup
          isOpen={errorPopup}
          onClose={() => setErrorPopup(false)}
          type="error"
          title="Password Change Required"
          message={
            meApiError?.error ||
            "You must change your password before accessing the system."
          }
          confirmText="Change Password"
          onConfirm={() => {
            setErrorPopup(false);
            navigate("/change-password");
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;