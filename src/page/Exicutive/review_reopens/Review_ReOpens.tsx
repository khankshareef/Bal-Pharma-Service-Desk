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
  fetchReopens,
  type Reopen,
} from "../../../store/user/slice/ReopenSlice";

interface ReopenRow {
  id: number;             
  TicketID: string;        
  Subject: string;
  RequestedBy: string;     
  Reason: string;
  Status: string;          
  RequestDate: string;
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
  s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";

const Review_ReOpens = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { reopens, loading } = useSelector((s: RootState) => s.reopens);

  const [currentPage, setCurrentPage] = useState(1);
  const [selected, setSelected] = useState<ReopenRow[]>([]);

  useEffect(() => {
    dispatch(fetchReopens());
  }, [dispatch]);

  const rows: ReopenRow[] = useMemo(
    () =>
      reopens.map((r: Reopen) => ({
        id: r.id,                                             
        TicketID: r.ticketCode,
        Subject: r.ticketSubject,
        RequestedBy: r.requestedByName ?? r.requestedByEmployeeId ?? "—",
        Reason: r.reason,
        Status: humanize(r.status),                            
        RequestDate: formatDate(r.createdAt),
      })),
    [reopens]
  );

  const columns: TableColumn<ReopenRow>[] = useMemo(
    () => [
      { key: "TicketID",    label: "Ticket ID",     type: "text" },
      { key: "Subject",     label: "Subject",       type: "text" },
      { key: "RequestedBy", label: "Requested By",  type: "text" },
      { key: "Reason",      label: "Reason",        type: "text" },
      { key: "Status",      label: "Status",        type: "badge" },
      { key: "RequestDate", label: "Requested On",  type: "text" },
    ],
    []
  );

  const handleSelectionChange = useCallback((sel: ReopenRow[]) => {
    setSelected(sel);
  }, []);

  const goToDetails = (row: ReopenRow) =>
    navigate(`reopen-details/${row.id}`);

  if (loading && reopens.length === 0) return <Loader />;

  return (
    <div>
      <div className="flex justify-between items-center mb-4 px-1">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
          All Re-Opens{" "}
          {loading && reopens.length > 0 && (
            <span className="text-sm text-gray-400 font-normal ml-2">
              refreshing…
            </span>
          )}
        </h2>

        {selected.length > 0 && (
          <button
            className="flex items-center gap-2 bg-rose-50 text-rose-600 border border-rose-200 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-rose-600 hover:text-white transition-colors"
            onClick={() =>
              alert(`Bulk delete not implemented yet (${selected.length})`)
            }
          >
            <FiTrash2 size={16} />
            Delete {selected.length} Selected
          </button>
        )}
      </div>

      {reopens.length === 0 && !loading ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
          <p className="text-gray-500 font-medium">No reopen requests yet.</p>
          <p className="text-xs text-gray-400 mt-2">
            Employees can request a reopen from their resolved tickets.
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

            onView:     goToDetails,
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
              key: "Status",
              label: "Status",
              options: ["Pending", "Approved", "Rejected"],
            },
          ]}
        />
      )}
    </div>
  );
};

export default Review_ReOpens;