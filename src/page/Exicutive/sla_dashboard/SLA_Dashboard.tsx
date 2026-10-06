import { useCallback, useEffect, useMemo, useState } from "react";
import { FaCheckCircle, FaCheckSquare } from "react-icons/fa";
import { FiActivity, FiTrash2 } from "react-icons/fi";
import { IoIosWarning, IoMdClose, IoMdCloseCircle } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Loader from "../../../component/loader/Loader";
import Reusable_Stat from "../../../component/stats/Reusable_Stat";
import Reusable_Table, {
  type TableColumn,
} from "../../../component/table/Reusable_Table";

import { fetchSlaDashboard } from "../../../store/exicutive/slice/slaSlice";
import type { AppDispatch, RootState } from "../../../store/store/Store";
import {
  fetchAssignedToExecutive,
  type Ticket,
} from "../../../store/user/slice/TicketsSlice";

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

interface SlaRow {
  id: number;
  TicketID: string;
  Subject: string;
  Category: string;
  Priority: string;
  Status: string;
  SLA: string;
  Date: string;
}

const SLA_Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const user = useSelector((s: any) => s.auth?.user ?? s.loginRoute?.user);
  const employeeId = user?.employeeId ?? "";

  const sla = useSelector((s: RootState) => s.sla.data);
  const slaLoading = useSelector((s: RootState) => s.sla.loading);
  const assigned = useSelector((s: RootState) => s.tickets.assignedTickets);
  const ticketsLoading = useSelector((s: RootState) => s.tickets.loading);

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTickets, setSelectedTickets] = useState<SlaRow[]>([]);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  useEffect(() => {
    if (!employeeId) return;
    dispatch(fetchSlaDashboard(employeeId));
    dispatch(fetchAssignedToExecutive(employeeId));
  }, [dispatch, employeeId]);

  const isLoading = slaLoading || ticketsLoading;

  useEffect(() => {
    if (!isLoading && employeeId) {
      setHasLoadedOnce(true);
    }
  }, [isLoading, employeeId]);

  const rows: SlaRow[] = useMemo(
    () =>
      (assigned ?? []).map((t: Ticket) => ({
        id: t.id,
        TicketID: t.ticketCode,
        Subject: t.subject,
        Category: t.categoryName ?? "—",
        Priority: humanize(t.priority),
        Status: humanize(t.status),
        SLA: humanize(t.slaStatus),
        Date: formatDate(t.createdAt),
      })),
    [assigned]
  );

  const columns: TableColumn<SlaRow>[] = useMemo(
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

  const handleSelectionChange = useCallback((sel: SlaRow[]) => {
    setSelectedTickets(sel);
  }, []);

  const handleViewTicket = (row: SlaRow) => navigate(`sla-detail/${row.id}`);

  const onTrack    = sla?.onTrack ?? 0;
  const atRisk     = sla?.atRisk ?? 0;
  const breached   = sla?.breached ?? 0;
  const compliance = sla?.overallCompliance ?? 0;

  if (!hasLoadedOnce && isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4 px-1">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
          SLA Dashboard
          {hasLoadedOnce && isLoading && (
            <span className="text-sm text-gray-400 font-normal ml-2">
              refreshing…
            </span>
          )}
        </h2>

        {selectedTickets.length > 0 && (
          <button
            className="flex items-center gap-2 bg-rose-50 text-rose-600 border border-rose-200 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-rose-600 hover:text-white transition-colors duration-200 shadow-sm cursor-pointer"
            onClick={() => alert(`Deleting ${selectedTickets.length} tickets!`)}
          >
            <FiTrash2 size={16} />
            Delete {selectedTickets.length} Selected
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <Reusable_Stat
          title="On Track"
          value={String(onTrack)}
          icon={FaCheckCircle}
          subText="Within SLA"
          subIcon={FaCheckSquare}
          subTextColor="green"
        />

        <Reusable_Stat
          title="At Risk"
          value={String(atRisk)}
          icon={IoIosWarning}
          subText="Approaching breach"
          subIcon={IoIosWarning}
          subTextColor="orange"
        />

        <Reusable_Stat
          title="Breached"
          value={String(breached)}
          icon={IoMdCloseCircle}
          subText="SLA Breached"
          subIcon={IoMdClose}
          subTextColor="red"
        />

        <Reusable_Stat
          title="Overall Compliance"
          value={`${compliance}%`}
          icon={FiActivity}
          subText="Last 30 days"
          subTextColor="gray"
        />
      </div>

      <div className="mt-10">
        <Reusable_Table
          columns={columns}
          data={rows}
          enableSelection={true}
          idKey="id"
          onSelectionChange={handleSelectionChange}
          actions={{
            showView: true,
            showEdit: false,
            showDelete: false,
            showReopen: true,
            onView: handleViewTicket,
            onReopen: () => navigate("reopen-ticket"),
            onRowClick: handleViewTicket,
          }}
          itemsPerPage={6}
          currentPage={currentPage}
          onPageChange={(page) => setCurrentPage(page)}
          showSearch
          showFilters
          showColumnControls
          showExport
          showPagination
          showActions
          tableName="SLA_Dashboard"
          filters={[
            { key: "Priority", label: "Priority", options: ["High", "Medium", "Low"] },
            { key: "Status",   label: "Status",   options: ["Open", "In Progress", "Resolved", "Closed"] },
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
            { key: "SLA", label: "SLA", options: ["On Track", "At Risk", "Breached"] },
          ]}
        />
      </div>
    </div>
  );
};

export default SLA_Dashboard;