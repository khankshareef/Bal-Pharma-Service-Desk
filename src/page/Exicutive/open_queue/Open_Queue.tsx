import { useCallback, useEffect, useMemo, useState } from "react";
import { FiTrash2 } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import Loader from "../../../component/loader/Loader";
import ReusablePopup from "../../../component/popups/Reusable_Popup";
import Reusable_Table, {
    type TableColumn,
} from "../../../component/table/Reusable_Table";

import type { AppDispatch, RootState } from "../../../store/store/Store";
import {
    assignTicket,
    fetchUnassignedTickets,
    type Ticket,
} from "../../../store/user/slice/TicketsSlice";

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

const Open_Queue = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const user = useSelector((s: any) => s.auth?.user ?? s.loginRoute?.user);
  const employeeId = user?.employeeId ?? "";

  const { unassignedTickets, loading } = useSelector(
    (s: RootState) => s.tickets
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [selected, setSelected] = useState<TicketRow[]>([]);

  const [popup, setPopup] = useState({
    isOpen: false,
    type: "success" as "success" | "error" | "info",
    title: "",
    message: "",
  });

  useEffect(() => {
    dispatch(fetchUnassignedTickets());
  }, [dispatch]);

  const rows: TicketRow[] = useMemo(
    () =>
      unassignedTickets.map((t: Ticket) => ({
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
    [unassignedTickets]
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
    navigate(`open-queue-detail/${row.id}`);

  const handleAssign = async (row: TicketRow) => {
    if (!employeeId) {
      setPopup({
        isOpen: true,
        type: "error",
        title: "Session Missing",
        message: "Please log in again.",
      });
      return;
    }

    try {
      const res = await dispatch(
        assignTicket({
          id: row.id,
          data: {},                                  
          assignedBy: employeeId,
        })
      ).unwrap();

      setPopup({
        isOpen: true,
        type: "success",
        title: "Ticket Assigned",
        message:
          `Ticket ${res.ticketCode} is now IN PROGRESS and assigned to you.`,
      });

      dispatch(fetchUnassignedTickets());
    } catch (err: any) {
      setPopup({
        isOpen: true,
        type: "error",
        title: "Assignment Failed",
        message: err?.error || err?.message || "Could not assign the ticket.",
      });
    }
  };

  const handleSelectionChange = useCallback((sel: TicketRow[]) => {
    setSelected(sel);
  }, []);

  if (loading && unassignedTickets.length === 0) return <Loader />;

  return (
    <div>
      <div className="flex justify-between items-center mb-4 px-1">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
          Open Ticket Queue{" "}
          <span className="text-sm font-normal text-gray-400 ml-2">
            ({unassignedTickets.length} pending)
          </span>
          {loading && unassignedTickets.length > 0 && (
            <span className="text-sm text-gray-400 font-normal ml-2">
              refreshing…
            </span>
          )}
        </h2>

        {selected.length > 0 && (
          <button
            className="flex items-center gap-2 bg-rose-50 text-rose-600 border border-rose-200 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-rose-600 hover:text-white transition-colors"
            onClick={() =>
              alert(`Bulk delete not implemented (${selected.length})`)
            }
          >
            <FiTrash2 size={16} />
            Delete {selected.length} Selected
          </button>
        )}
      </div>

      {unassignedTickets.length === 0 && !loading ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
          <p className="text-gray-500 font-medium">
            No pending tickets in the queue. 🎉
          </p>
          <p className="text-xs text-gray-400 mt-2">
            All tickets have been assigned to executives.
          </p>
        </div>
      ) : (
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
  showReopen: false,
  showInvestigation: false,
  showOpenQueue: false,
  showAssign: true,      

  onView: goToDetails,
  onAssign: handleAssign,   
  onRowClick: goToDetails,
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
            {
              key: "Priority",
              label: "Priority",
              options: ["High", "Medium", "Low"],
            },
            {
              key: "Status",
              label: "Status",
              options: ["Open"],
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

      <ReusablePopup
        isOpen={popup.isOpen}
        onClose={() => setPopup((p) => ({ ...p, isOpen: false }))}
        onConfirm={() => setPopup((p) => ({ ...p, isOpen: false }))}
        type={popup.type}
        title={popup.title}
        message={popup.message}
      />
    </div>
  );
};

export default Open_Queue;