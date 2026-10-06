import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import Loader from "../../../component/loader/Loader";
import Reusable_Table, {
  type TableColumn,
} from "../../../component/table/Reusable_Table";

import type { AppDispatch, RootState } from "../../../store/store/Store";
import {
  fetchAssignedToExecutive,
  type Ticket,
} from "../../../store/user/slice/TicketsSlice";
import { isHiddenAfterClose } from "../../../utils/ticketFilters";

interface TicketRow {
  id: number;
  TicketID: string;
  Subject: string;
  Category: string;
  Priority: string;
  Unit: string;
  Status: string;
  SLA: string;
  Date: string;
}

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

const humanize = (s?: string) =>
  s
    ? s
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" ")
    : "";

const Assigned = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const user = useSelector((s: any) => s.auth?.user ?? s.loginRoute?.user);
  const employeeId = user?.employeeId ?? "";

  const { assignedTickets, loading } = useSelector(
    (s: RootState) => s.tickets
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  useEffect(() => {
    if (employeeId) dispatch(fetchAssignedToExecutive(employeeId));
  }, [dispatch, employeeId]);

  useEffect(() => {
    if (!loading && employeeId) setHasLoadedOnce(true);
  }, [loading, employeeId]);

  const rows: TicketRow[] = useMemo(
    () =>
      assignedTickets
        .filter((t) => !isHiddenAfterClose(t))
        .map((t: Ticket) => ({
          id: t.id,
          TicketID: t.ticketCode,
          Subject: t.subject,
          Category: t.categoryName ?? "—",
          Priority: humanize(t.priority),
          Unit: t.unitName ?? "—",
          Status: humanize(t.status),
          SLA: humanize(t.slaStatus),
          Date: formatDate(t.createdAt),
        })),
    [assignedTickets]
  );

  const columns: TableColumn<TicketRow>[] = useMemo(
    () => [
      { key: "TicketID", label: "Ticket ID", type: "text" },
      { key: "Subject",  label: "Subject",   type: "text" },
      { key: "Category", label: "Category",  type: "text" },
      { key: "Priority", label: "Priority",  type: "badge" },
      { key: "Unit",     label: "Unit",      type: "text" },
      { key: "Status",   label: "Status",    type: "badge" },
      { key: "SLA",      label: "SLA",       type: "sla" },
      { key: "Date",     label: "Date",      type: "text" },
    ],
    []
  );

  const goToDetails = (row: TicketRow) =>
    navigate(`assigned-details/${row.id}`);

  if (!hasLoadedOnce && loading) {
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
          My Assigned Tickets{" "}
          <span className="text-sm font-normal text-gray-400 ml-2">
            ({assignedTickets.length})
          </span>
          {hasLoadedOnce && loading && (
            <span className="text-sm font-normal text-gray-400 ml-3">
              refreshing…
            </span>
          )}
        </h2>
      </div>

      {rows.length === 0 && !loading ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
          <p className="text-gray-500 font-medium">
            No tickets assigned to you yet.
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Assigned tickets appear here.
          </p>
        </div>
      ) : (
        <Reusable_Table
          columns={columns}
          data={rows}
          enableSelection={false}
          idKey="id"
          actions={{
            showView: true,
            showEdit: false,
            showDelete: false,
            showInvestigation: true,
            onView: goToDetails,
            onRowClick: goToDetails,
            onInvestigation: (row) => navigate(`investigation/${row.id}`),
          }}
          itemsPerPage={6}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          showSearch={true}
          showFilters={true}
          showColumnControls={true}
          showExport={true}
          showPagination={true}
          showActions={true}
          filters={[
            { key: "Priority", label: "Priority", options: ["High", "Medium", "Low"] },
            { key: "Status",   label: "Status",   options: ["In Progress", "Resolved", "Closed"] },
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
  );
};

export default Assigned;