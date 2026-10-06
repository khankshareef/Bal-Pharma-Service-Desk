import { useEffect, useMemo, useState } from "react";
import { FiGlobe } from "react-icons/fi";
import { HiOutlineOfficeBuilding } from "react-icons/hi";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import Loader from "../../../component/loader/Loader";
import Reusable_Table, {
  type TableColumn,
} from "../../../component/table/Reusable_Table";

import type { AppDispatch, RootState } from "../../../store/store/Store";
import { fetchUnits } from "../../../store/super_admin/slice/Add_User";
import {
  fetchTickets,
  type Ticket,
} from "../../../store/user/slice/TicketsSlice";

const fmtDate = (iso?: string | null) =>
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
    : "—";

interface TicketRow {
  id: number;
  TicketID: string;
  Subject: string;
  Category: string;
  Priority: string;
  Unit: string;
  Status: string;
  CreatedBy: string;
  AssignedTo: string;
  Date: string;
}

const All_Tickets = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { tickets, loading, error } = useSelector(
    (s: RootState) => s.tickets
  );

  const units = useSelector((s: RootState) => s.addUser.units);

  const [currentPage, setCurrentPage] = useState(1);
  const [unitFilter, setUnitFilter] = useState<string>("");

  useEffect(() => {
    dispatch(fetchTickets());
    dispatch(fetchUnits());
  }, [dispatch]);

const unitOptions = useMemo(() => {
  const seen = new Map<string, string>();
  (units ?? []).forEach((u) => {
    if (u.unitName && !seen.has(u.unitName)) {
      seen.set(u.unitName, u.address ? `${u.unitName} — ${u.address}` : u.unitName);
    }
  });
  return Array.from(seen.entries())
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label));
}, [units]);

  const rows: TicketRow[] = useMemo(() => {
    const source = unitFilter
      ? (tickets ?? []).filter((t) => t.unitName === unitFilter)
      : (tickets ?? []);

    return source.map((t: Ticket) => ({
      id: t.id,
      TicketID: t.ticketCode,
      Subject: t.subject,
      Category: t.categoryName ?? "—",
      Priority: humanize(t.priority),
      Unit: t.unitName ?? "—",
      Status: humanize(t.status),
      CreatedBy: t.createdByEmployeeId ?? "—",
      AssignedTo: t.assignedToEmployeeId ?? "Unassigned",
      Date: fmtDate(t.createdAt),
    }));
  }, [tickets, unitFilter]);

  const columns: TableColumn<TicketRow>[] = useMemo(
    () => [
      { key: "TicketID",   label: "Ticket ID",   type: "text" },
      { key: "Subject",    label: "Subject",     type: "text" },
      { key: "Category",   label: "Category",    type: "text" },
      { key: "Priority",   label: "Priority",    type: "badge" },
      { key: "Unit",       label: "Unit",        type: "text" },
      { key: "Status",     label: "Status",      type: "badge" },
      { key: "CreatedBy",  label: "Created By",  type: "text" },
      { key: "AssignedTo", label: "Assigned To", type: "text" },
      { key: "Date",       label: "Date",        type: "text" },
    ],
    []
  );

  const goToDetails = (row: TicketRow) => {
    navigate(`tkt-details/${row.id}`);
  };

  const isLoading = loading && (tickets?.length ?? 0) === 0;

  return (
    <div className="max-w-full mx-auto font-sans">
      <div className="flex justify-between items-end mb-6">
        <h1 className="text-2xl font-bold text-[#002D5B]">
          All Tickets Overview
          <span className="text-sm font-normal text-gray-400 ml-2">
            ({tickets?.length ?? 0} total)
          </span>
        </h1>
        {loading && (tickets?.length ?? 0) > 0 && (
          <span className="text-sm text-gray-400">refreshing…</span>
        )}
      </div>

      <div className="bg-[#F4F8FB] border border-[#E1EAF4] rounded-xl p-4 flex items-center gap-4 flex-wrap mb-6">
        <div className="flex items-center gap-2 text-[#003D8C] font-semibold text-sm pl-2">
          <HiOutlineOfficeBuilding size={18} /> Filter by Unit:
        </div>
        <select
  value={unitFilter}
  onChange={(e) => {
    setUnitFilter(e.target.value);
    setCurrentPage(1);
  }}
  className="px-4 py-2 w-56 border border-gray-200 rounded-full text-sm text-gray-700 bg-white focus:outline-none focus:border-[#002D5B] cursor-pointer"
>
  <option value="">All Units</option>
  {unitOptions.map((u) => (
    <option key={u.value} value={u.value}>
      {u.label}
    </option>
  ))}
</select>
        <div className="flex items-center gap-2 text-gray-500 text-sm ml-2">
          <FiGlobe size={16} /> Super Manager has visibility across all units
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">
          {typeof error === "string"
            ? error
            : error?.message ?? "Failed to load tickets."}
        </div>
      )}

      {isLoading ? (
        <Loader />
      ) : rows.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
          <p className="text-gray-500 font-medium">
            No tickets found{unitFilter ? ` in "${unitFilter}"` : ""}.
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Tickets created by employees will appear here.
          </p>
        </div>
      ) : (
        <Reusable_Table
          columns={columns}
          data={rows}
          idKey="id"
          enableSelection={false}
          itemsPerPage={6}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          showSearch
          showFilters
          showColumnControls
          showExport
          showPagination
          showActions
          tableName="All_Tickets"
          actions={{
            showView: true,
            showEdit: false,
            showDelete: false,
            showReopen: false,
            onView: goToDetails,
            onRowClick: goToDetails,
          }}
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
                "Network", "Hardware", "Software", "Application",
                "Security", "Database", "Infrastructure", "Access & Permissions",
              ],
            },
          ]}
        />
      )}
    </div>
  );
};

export default All_Tickets;