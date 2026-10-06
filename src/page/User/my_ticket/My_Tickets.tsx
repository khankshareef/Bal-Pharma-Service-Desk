import { useCallback, useEffect, useMemo, useState } from "react";
import { FiTrash2 } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Loader from "../../../component/loader/Loader";
import Reusable_Table, {
  type TableColumn,
} from "../../../component/table/Reusable_Table";
import type { AppDispatch, RootState } from "../../../store/store/Store";
import {
  deleteTicket,
  fetchMyTickets,
  type Ticket,
} from "../../../store/user/slice/TicketsSlice";
import { isHiddenAfterClose } from "../../../utils/ticketFilters";

interface TicketRow {
  id: number;
  TicketID: string;
  Subject: string;
  Category: string;
  Priority: string;
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
  s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase().replace("_", " ") : "";

const My_Tickets = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const user = useSelector((s: any) => s.auth?.user ?? s.loginRoute?.user);
  const employeeId = user?.employeeId ?? "";
  const { myTickets, loading } = useSelector((s: RootState) => s.tickets);
  const [currentPage, setCurrentPage] = useState(1);
  const [selected, setSelected] = useState<TicketRow[]>([]);

  useEffect(() => {
    if (employeeId) dispatch(fetchMyTickets(employeeId));
  }, [dispatch, employeeId]);

  const rows: TicketRow[] = useMemo(
  () =>
    myTickets
      .filter((t) => !isHiddenAfterClose(t)) 
      .map((t: Ticket) => ({
        id: t.id,
        TicketID: t.ticketCode,
        Subject: t.subject,
        Department: t.departmentName,
        Category: t.categoryName ?? "",
        Priority: humanize(t.priority),
        Status: humanize(t.status),
        SLA: humanize(t.slaStatus),
        Date: formatDate(t.createdAt),
      })),
  [myTickets]
);

  const columns: TableColumn<TicketRow>[] = useMemo(
    () => [
      { key: "TicketID", label: "Ticket ID", type: "text" },
      { key: "Unit", label: "Unit", type: "text" },
      { key: "Subject",  label: "Subject",   type: "text" },
      {key: "Department", label: "Department", type: "text"},
      { key: "Category", label: "Category",  type: "text" },
      { key: "Priority", label: "Priority",  type: "badge" },
      { key: "Status",   label: "Status",    type: "badge" },
      { key: "SLA",      label: "SLA",       type: "sla" },
      { key: "Date",     label: "Date",      type: "text" },
    ],
    []
  );

  const handleDelete = async (row: TicketRow) => {
    if (!confirm(`Delete ticket "${row.TicketID}"?`)) return;
    try {
      await dispatch(deleteTicket(row.id)).unwrap();
    } catch (err: any) {
      alert(err?.error || err?.message || "Failed to delete ticket");
    }
  };

  const handleBulkDelete = async () => {
    if (selected.length === 0) return;
    if (!confirm(`Delete ${selected.length} ticket(s)?`)) return;
    await Promise.all(selected.map((s) => dispatch(deleteTicket(s.id)).unwrap()));
    setSelected([]);
  };

  const handleSelectionChange = useCallback((sel: TicketRow[]) => {
    setSelected(sel);
  }, []);

  if (loading && myTickets.length === 0) return <Loader />;

  return (
    <div>
      <div className="flex justify-between items-center mb-4 px-1">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
          My Tickets
        </h2>

        {selected.length > 0 && (
          <button
            onClick={handleBulkDelete}
            className="flex items-center gap-2 bg-rose-50 text-rose-600 border border-rose-200 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-rose-600 hover:text-white transition-colors"
          >
            <FiTrash2 size={16} />
            Delete {selected.length} Selected
          </button>
        )}
      </div>

      <Reusable_Table
        columns={columns}
        data={rows}
        enableSelection={true}
        idKey="id"
        onSelectionChange={handleSelectionChange}
        actions={{
  showView: true,
  showEdit: true,
  showDelete: false,
  showReopen: true,                                   
  onView: (row) => navigate(`tkt-details/${row.id}`),
  onEdit: (row) => navigate(`../edit-ticket/${row.id}`),
  onDelete: handleDelete,
 onReopen: (row) => {
  if (row.Status !== "Resolved" && row.Status !== "Closed") {
    return;
  }

  navigate(`reopen-ticket/${row.id}`);
},
  onRowClick: (row) => navigate(`tkt-details/${row.id}`),
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
          {
            key: "Status",
            label: "Status",
            options: ["Open", "In progress", "Resolved", "Closed"],
          },
        ]}
      />
    </div>
  );
};

export default My_Tickets;