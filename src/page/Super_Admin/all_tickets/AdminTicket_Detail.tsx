import { useEffect, useMemo, useState } from "react";
import {
    FiArrowLeft,
    FiAward,
    FiCalendar,
    FiClock,
    FiTag
} from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import AttachmentsCard from "../../../component/attachments/AttachmentsCard";
import Loader from "../../../component/loader/Loader";

import type { AppDispatch, RootState } from "../../../store/store/Store";
import {
    fetchTicketById,
    type Ticket,
} from "../../../store/user/slice/TicketsSlice";
import {
    fetchRatingsByTicket,
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

const priorityLabel = (p?: string) =>
  p ? p.charAt(0) + p.slice(1).toLowerCase() : "—";

const statusLabel = (s?: string) =>
  s
    ? s
        .split("_")
        .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
        .join(" ")
    : "—";

const slaLabel = (s?: string) =>
  s
    ? s
        .split("_")
        .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
        .join(" ")
    : "—";

const AdminTicket_Detail = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { id } = useParams<{ id: string }>();
  const ticketId = Number(id);

  const cached = useSelector((s: RootState) =>
    s.tickets.tickets.find((t: Ticket) => t.id === ticketId)
  );

  const ratings = useSelector((s: RootState) => s.rating.list);

  const [ticket, setTicket] = useState<Ticket | null>(cached ?? null);
  const [loading, setLoading] = useState(!cached);

  useEffect(() => {
    if (!id) return;
    if (cached) {
      setTicket(cached);
      setLoading(false);
      return;
    }
    setLoading(true);
    dispatch(fetchTicketById(ticketId))
      .unwrap()
      .then(setTicket)
      .catch((err) => alert(err?.error || "Failed to load ticket"))
      .finally(() => setLoading(false));
  }, [dispatch, id, cached, ticketId]);

  useEffect(() => {
    if (ticketId) dispatch(fetchRatingsByTicket(ticketId));
  }, [dispatch, ticketId]);

  const rating: Rating | undefined = useMemo(
    () => ratings.find((r) => r.ticketId === ticketId),
    [ratings, ticketId]
  );

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      HIGH: "bg-red-100 text-red-700 border-red-200",
      MEDIUM: "bg-yellow-100 text-yellow-700 border-yellow-200",
      LOW: "bg-green-100 text-green-700 border-green-200",
    };
    return colors[priority] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const getSLAColor = (sla: string) => {
    const colors: Record<string, string> = {
      ON_TRACK: "bg-green-100 text-green-700 border-green-200",
      AT_RISK: "bg-yellow-100 text-yellow-700 border-yellow-200",
      BREACHED: "bg-red-100 text-red-700 border-red-200",
    };
    return colors[sla] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      OPEN: "bg-blue-100 text-blue-700 border-blue-200",
      IN_PROGRESS: "bg-yellow-100 text-yellow-700 border-yellow-200",
      RESOLVED: "bg-green-100 text-green-700 border-green-200",
      CLOSED: "bg-gray-100 text-gray-700 border-gray-200",
    };
    return colors[status] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const renderStars = (value: number) => (
    <div className="flex items-center gap-1 mt-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-4 h-4 ${star <= value ? "text-yellow-400" : "text-gray-200"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-sm text-gray-700 ml-1 font-medium">
        ({value}/5)
      </span>
    </div>
  );

  if (loading) return <Loader />;
  if (!ticket)
    return (
      <div className="flex min-h-[400px] items-center justify-center text-gray-500">
        Ticket not found.
      </div>
    );

  const activity: { time: string; role: string; text: string }[] = [];
  activity.push({
    time: fmtDate(ticket.createdAt),
    role: ticket.createdByName ?? "Employee",
    text: "Ticket created and submitted.",
  });
  if (ticket.assignedAt && ticket.assignedToName) {
    activity.push({
      time: fmtDate(ticket.assignedAt),
      role: "Executive",
      text: `Ticket assigned to ${ticket.assignedToEmployeeId}.`,
    });
  }
  if (ticket.resolvedAt) {
    activity.push({
      time: fmtDate(ticket.resolvedAt),
      role: "Executive",
      text: "Ticket resolved.",
    });
  }
  if (rating) {
    activity.push({
      time: fmtDate(rating.createdAt),
      role: "User",
      text: `Rating: ${rating.rating}/5${rating.comments ? ` — "${rating.comments}"` : ""}`,
    });
  }

  return (
    <div className="max-w-full mx-auto font-sans">
      <div className="flex items-center justify-between">
        <div className="mb-6">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4 cursor-pointer"
          >
            <FiArrowLeft size={18} />
            <span className="font-medium">Back to Tickets</span>
          </button>

          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  {ticket.ticketCode}
                </h1>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                    ticket.status
                  )}`}
                >
                  {statusLabel(ticket.status)}
                </span>
              </div>
              <h2 className="text-xl text-gray-700 font-medium">
                {ticket.subject}
              </h2>
            </div>
          </div>
        </div>


      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <InfoCard
          icon={FiTag}
          bg="bg-blue-50"
          color="text-blue-600"
          label="Category"
          value={ticket.categoryName ?? "—"}
        />
        <InfoCard
          icon={FiAward}
          bg="bg-purple-50"
          color="text-purple-600"
          label="Priority"
          value={
            <span
              className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getPriorityColor(
                ticket.priority
              )}`}
            >
              {priorityLabel(ticket.priority)}
            </span>
          }
        />
        <InfoCard
          icon={FiCalendar}
          bg="bg-green-50"
          color="text-green-600"
          label="Raised"
          value={fmtDate(ticket.createdAt)}
        />
        <InfoCard
          icon={FiClock}
          bg="bg-orange-50"
          color="text-orange-600"
          label="SLA"
          value={
            <span
              className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getSLAColor(
                ticket.slaStatus
              )}`}
            >
              {slaLabel(ticket.slaStatus)}
            </span>
          }
        />
      </div>

      {/* ticket details */}
      <div className="mb-8">
        <h3 className="text-[16px] font-bold text-gray-900 mb-3">
          Ticket Details
        </h3>
        <div className="bg-[#fcfdfd] rounded-xl border border-gray-100 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-4">
            <div className="space-y-6">
              <Field label="Ticket ID" value={ticket.ticketCode} />
              <Field label="Category" value={ticket.categoryName ?? "—"} />
              <Field
                label="Department"
                value={ticket.departmentName ?? "—"}
              />
              <Field label="Unit" value={ticket.unitName ?? "—"} />
              <Field
                label="Created By"
                value={
                  ticket.createdByName
                    ? `${ticket.createdByName} (${ticket.createdByEmployeeId})`
                    : "—"
                }
              />
              <div>
                <p className="text-[12px] text-slate-500 font-medium mb-1">
                  Rating
                </p>
                {rating ? (
                  renderStars(rating.rating)
                ) : (
                  <p className="text-[14px] text-gray-400 italic">
                    Not rated yet
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <Field label="Subject" value={ticket.subject} />
              <Field label="Priority" value={priorityLabel(ticket.priority)} />
              <Field
                label="Assigned To"
                value={ticket.assignedToEmployeeId ?? "Unassigned"}
              />
              <Field label="SLA" value={slaLabel(ticket.slaStatus)} />
              {ticket.resolvedAt && (
                <Field
                  label="Resolved At"
                  value={fmtDate(ticket.resolvedAt)}
                />
              )}
            </div>
          </div>

          <div className="mt-8">
            <p className="text-[12px] text-slate-500 font-medium mb-1">
              Description
            </p>
            <p className="text-[14px] text-gray-800">
              {ticket.description || "No description provided."}
            </p>
          </div>

          {ticket.resolutionNotes && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-[12px] text-slate-500 font-medium mb-1">
                Resolution Notes
              </p>
              <p className="text-[14px] text-gray-800">
                {ticket.resolutionNotes}
              </p>
              {ticket.resolutionType && (
                <p className="text-xs text-gray-500 mt-2">
                  Type: <strong>{ticket.resolutionType}</strong>
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* activity timeline */}
      <div className="mb-8">
        <h3 className="text-[16px] font-bold text-gray-900 mb-4">
          Activity Timeline
        </h3>
        <div className="space-y-3">
          {activity.map((a, i) => (
            <div key={i} className="flex items-center text-[14px]">
              <div className="w-44 text-gray-600 shrink-0">{a.time}</div>
              <div className="w-28 shrink-0">
                <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                  {a.role}
                </span>
              </div>
              <div className="text-gray-800">{a.text}</div>
            </div>
          ))}
        </div>
      </div>

      <AttachmentsCard ticket={ticket} title="Attachments" />
    </div>
  );
};

const InfoCard = ({
  icon: Icon,
  bg,
  color,
  label,
  value,
}: {
  icon: any;
  bg: string;
  color: string;
  label: string;
  value: React.ReactNode;
}) => (
  <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
    <div className="flex items-center gap-3">
      <div className={`p-2 ${bg} rounded-lg`}>
        <Icon className={color} size={18} />
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
          {label}
        </p>
        <div className="text-sm font-semibold text-gray-900">{value}</div>
      </div>
    </div>
  </div>
);

const Field = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div>
    <p className="text-[12px] text-slate-500 font-medium mb-1">{label}</p>
    <p className="text-[14px] text-gray-800">{value ?? "—"}</p>
  </div>
);

export default AdminTicket_Detail;