import { useEffect, useMemo, useState } from "react";
import {
  FiActivity,
  FiMessageSquare,
  FiStar,
  FiThumbsUp,
} from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import Loader from "../../../component/loader/Loader";
import Reusable_Stat from "../../../component/stats/Reusable_Stat";
import Reusable_Table, {
  type TableColumn,
} from "../../../component/table/Reusable_Table";

import type { AppDispatch, RootState } from "../../../store/store/Store";
import {
  fetchRatings,
  type Rating,
} from "../../../store/user/slice/ratingSlice";

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

const starsLabel = (n: number) => "★".repeat(n) + "☆".repeat(5 - n);

const ratingText = (n: number) =>
  ({ 1: "Terrible", 2: "Poor", 3: "Average", 4: "Good", 5: "Excellent" }[n] ??
  "—");

interface FeedbackRow {
  id: number;         // rating id
  ticketId: number;   // ⬅️ ADD: needed for navigation
  TicketID: string;
  RatedBy: string;
  Rating: number;
  Stars: string;
  RatingText: string;
  Comments: string;
  Date: string;
}

const All_Feedbacks = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { list, loading, error } = useSelector((s: RootState) => s.rating);

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(fetchRatings());
  }, [dispatch]);

  const rows: FeedbackRow[] = useMemo(
    () =>
      list.map((r: Rating) => ({
        id: r.id,
        ticketId: r.ticketId,               // ⬅️ carry it through
        TicketID: r.ticketCode ?? `#${r.ticketId}`,
        RatedBy: r.ratedByName ?? "—",
        Rating: r.rating,
        Stars: starsLabel(r.rating),
        RatingText: ratingText(r.rating),
        Comments: r.comments ?? "—",
        Date: fmtDate(r.createdAt),
      })),
    [list]
  );

  const columns: TableColumn<FeedbackRow>[] = useMemo(
    () => [
      { key: "TicketID",   label: "Ticket ID", type: "text" },
      { key: "RatedBy",    label: "Rated By",  type: "text" },
      { key: "Rating",     label: "Rating",    type: "text" },
      { key: "Stars",      label: "Stars",     type: "text" },
      { key: "RatingText", label: "Verdict",   type: "badge" },
      { key: "Comments",   label: "Comments",  type: "text" },
      { key: "Date",       label: "Date",      type: "text" },
    ],
    []
  );

  const goToDetails = (row: FeedbackRow) => {
    navigate(`tkt-details/${row.ticketId}`);
  };

  const total = list.length;
  const avgRating = useMemo(() => {
    if (total === 0) return 0;
    const sum = list.reduce((s, r) => s + (r.rating ?? 0), 0);
    return Math.round((sum / total) * 10) / 10;
  }, [list, total]);

  const positive = useMemo(
    () => list.filter((r) => r.rating >= 4).length,
    [list]
  );
  const positivePct = total === 0 ? 0 : Math.round((positive / total) * 100);

  const withComments = useMemo(
    () => list.filter((r) => !!r.comments?.trim()).length,
    [list]
  );

  if (loading && list.length === 0) return <Loader />;

  return (
    <div className="max-w-full mx-auto font-sans">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
          All Feedbacks
          <span className="text-sm font-normal text-gray-400 ml-2">
            ({total} rating{total === 1 ? "" : "s"})
          </span>
        </h1>
        {loading && (
          <span className="text-sm text-gray-400 font-normal">
            refreshing…
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        <Reusable_Stat
          title="Total Feedbacks"
          value={String(total)}
          icon={FiMessageSquare}
          subText="All ratings received"
          subIcon={FiActivity}
          subTextColor="blue"
        />
        <Reusable_Stat
          title="Average Rating"
          value={`${avgRating}`}
          icon={FiStar}
          subText="out of 5.0"
          subIcon={FiStar}
          subTextColor="orange"
        />
        <Reusable_Stat
          title="Positive (4–5★)"
          value={`${positivePct}%`}
          icon={FiThumbsUp}
          subText={`${positive} of ${total}`}
          subIcon={FiThumbsUp}
          subTextColor="green"
        />
        <Reusable_Stat
          title="With Comments"
          value={String(withComments)}
          icon={FiMessageSquare}
          subText="Text responses"
          subIcon={FiActivity}
          subTextColor="gray"
        />
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">
          {typeof error === "string"
            ? error
            : error?.message ?? "Failed to load feedbacks."}
        </div>
      )}

      {list.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
          <p className="text-gray-500 font-medium">
            No feedback has been submitted yet.
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Ratings submitted by employees will appear here.
          </p>
        </div>
      ) : (
        <Reusable_Table
          columns={columns}
          data={rows}
          enableSelection={false}
          idKey="id"
          itemsPerPage={10}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          showSearch
          showFilters
          showColumnControls
          showExport
          showPagination
          showActions
          tableName="All_Feedbacks"
          actions={{
            showView: true,
            onView: goToDetails,
            onRowClick: goToDetails,
          }}
          filters={[
            {
              key: "Rating",
              label: "Rating",
              options: ["5", "4", "3", "2", "1"],
            },
            {
              key: "RatingText",
              label: "Verdict",
              options: ["Excellent", "Good", "Average", "Poor", "Terrible"],
            },
          ]}
        />
      )}
    </div>
  );
};

export default All_Feedbacks;