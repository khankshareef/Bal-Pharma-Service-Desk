import { useEffect, useState } from "react";
import {
  FiArrowLeft, FiAward, FiCalendar, FiCheck, FiClock, FiInfo,
  FiPlusSquare,
  FiRepeat, FiTag
} from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import AttachmentsCard from "../../../component/attachments/AttachmentsCard";
import Reusable_Button from "../../../component/button/Reusable_Button";
import Loader from "../../../component/loader/Loader";

import {
  closeRequest,
  fetchRequestsByTicket,
  type TicketInfoRequest,
} from "../../../store/exicutive/slice/requestInfoSlice";
import type { AppDispatch, RootState } from "../../../store/store/Store";
import {
  fetchTicketById,
  type Ticket,
} from "../../../store/user/slice/TicketsSlice";

const formatDate = (iso?: string | null) =>
  iso
    ? new Date(iso).toLocaleString("en-GB", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      })
    : "—";

const priorityLabel = (p?: string) => (p ? p.charAt(0) + p.slice(1).toLowerCase() : "");
const statusLabel = (s?: string) =>
  s ? s.split("_").map((w) => w.charAt(0) + w.slice(1).toLowerCase()).join(" ") : "";

const Investigation = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const user = useSelector((s: any) => s.auth?.user ?? s.loginRoute?.user);
  const employeeId = user?.employeeId ?? "";

  const cached = useSelector((s: RootState) =>
    s.tickets.tickets.find((t: Ticket) => t.id === Number(id))
  );

  const requests = useSelector((s: RootState) => s.requestInfo.list);

  const [ticket, setTicket] = useState<Ticket | null>(cached ?? null);
  const [loading, setLoading] = useState(!cached);
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (!id) return;
    if (cached) { setTicket(cached); setLoading(false); return; }
    setLoading(true);
    dispatch(fetchTicketById(Number(id)))
      .unwrap()
      .then(setTicket)
      .catch((err) => alert(err?.error || "Failed to load ticket"))
      .finally(() => setLoading(false));
  }, [dispatch, id, cached]);

  useEffect(() => {
    if (id) dispatch(fetchRequestsByTicket(Number(id)));
  }, [dispatch, id]);

  if (loading) return <Loader />;
  if (!ticket)
    return (
      <div className="flex min-h-[400px] items-center justify-center text-gray-500">
        Ticket not found.
      </div>
    );

  const getPriorityColor = (priority: string) => {
    const map: Record<string, string> = {
      HIGH: "bg-red-100 text-red-700 border-red-200",
      MEDIUM: "bg-yellow-100 text-yellow-700 border-yellow-200",
      LOW: "bg-green-100 text-green-700 border-green-200",
    };
    return map[priority] || "bg-gray-100 text-gray-700";
  };

  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      OPEN: "bg-blue-100 text-blue-700",
      IN_PROGRESS: "bg-yellow-100 text-yellow-700",
      RESOLVED: "bg-green-100 text-green-700",
      CLOSED: "bg-gray-100 text-gray-700",
    };
    return map[status] || "bg-gray-100 text-gray-700";
  };

  const handleCloseRequest = async (requestId: number) => {
    if (!window.confirm("Close this request?")) return;
    try {
      await dispatch(closeRequest({ id: requestId, employeeId })).unwrap();
      dispatch(fetchRequestsByTicket(Number(id)));
    } catch (e: any) {
      alert(e?.message || "Failed to close request");
    }
  };

  const isResolved = ticket.status?.toUpperCase() === "RESOLVED";

  return (
    <div className="max-w-full mx-auto font-sans">
      <div className="mb-6">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 cursor-pointer"
        >
          <FiArrowLeft size={18} />
          <span className="font-medium">Back</span>
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

          <div className="flex gap-3">
            {!isResolved && (
              <Reusable_Button
              onClick={() => navigate(`../request-info/${ticket.id}`)}
              leftIcon={<FiInfo size={16} />}
              className="bg-[#d97706] hover:bg-[#b45309]"
            >
              Request Info
            </Reusable_Button>
            ) }
            
            {!isResolved && (
            <Reusable_Button leftIcon={<FiRepeat size={16} />} variant="secondary">
              Transfer
            </Reusable_Button>
            )}

            {!isResolved && (
            <Reusable_Button
              onClick={() => navigate(`../resolve/${ticket.id}`)}
              leftIcon={<FiCheck size={16} />}
              className="bg-[#166534] hover:bg-[#14532d]"
            >
              Resolve
            </Reusable_Button>
            )}
          </div>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <InfoCard icon={FiTag} color="blue" label="Category" value={ticket.categoryName ?? "—"} />
        <InfoCard
          icon={FiAward}
          color="purple"
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
        <InfoCard icon={FiCalendar} color="green" label="Raised" value={formatDate(ticket.createdAt)} />
        <InfoCard icon={FiClock} color="orange" label="SLA" value={ticket.slaStatus} />
      </div>

      {/* Ticket Details */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 text-[16px]">Ticket Details</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
            <div className="space-y-6">
              <Field label="Ticket ID" value={ticket.ticketCode} />
              <Field label="Category" value={ticket.categoryName ?? "—"} />
              <Field label="Department" value={ticket.departmentName ?? "—"} />
              <Field label="Unit" value={ticket.unitName ?? "—"} />
              <Field label="Description" value={ticket.description || "No description"} />
            </div>
            <div className="space-y-6">
              <Field label="Subject" value={ticket.subject} />
              <Field label="Priority" value={priorityLabel(ticket.priority)} />
              <Field label="Created By" value={ticket.createdByName ?? "—"} />
              {ticket.resolvedAt && (
                <Field label="Resolved At" value={formatDate(ticket.resolvedAt)} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Attachments */}
      <AttachmentsCard ticket={ticket} title="Attachments from Employee" />

      {/* Info Requests */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-900 text-[15px] flex items-center gap-2">
            <FiInfo className="text-amber-600" />
            Information Requests
            {requests.length > 0 && (
              <span className="text-xs font-normal text-gray-400">({requests.length})</span>
            )}
          </h3>
          <Reusable_Button
            variant="secondary"
            onClick={() => navigate(`../request-info/${ticket.id}`)}
            leftIcon={<FiPlusSquare size={14} />}
          >
            New Request
          </Reusable_Button>
        </div>

        <div className="p-6 space-y-3">
          {requests.length === 0 ? (
            <p className="text-sm text-gray-500">No information requests sent yet.</p>
          ) : (
            requests.map((r: TicketInfoRequest) => (
              <div key={r.id} className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-gray-500 uppercase">
                    {r.requestedByName ?? "—"} ·{" "}
                    {new Date(r.createdAt).toLocaleString("en-GB")}
                  </span>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                      r.status === "PENDING"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : r.status === "RESPONDED"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-gray-100 text-gray-600 border-gray-200"
                    }`}
                  >
                    {r.status}
                  </span>
                </div>

                <p className="text-sm text-gray-800">{r.message}</p>

                {r.attachmentNames && (
                  <div className="text-xs text-blue-600 mt-2">
                    📎 {r.attachmentNames}
                  </div>
                )}

                {r.response && (
                  <div className="mt-3 pl-3 border-l-2 border-emerald-300 bg-emerald-50/40 rounded py-2 px-3">
                    <div className="text-xs text-emerald-700 font-semibold mb-0.5">
                      Reply from {r.respondedByName ?? "user"} ·{" "}
                      {r.respondedAt
                        ? new Date(r.respondedAt).toLocaleString("en-GB")
                        : ""}
                    </div>
                    <p className="text-sm text-gray-800">{r.response}</p>
                  </div>
                )}

                {r.status !== "CLOSED" && (
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={() => handleCloseRequest(r.id)}
                      className="text-[12px] text-red-600 hover:underline cursor-pointer"
                    >
                      Close request
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>


      {/* Comments */}
      <div className="mb-6">
        <h3 className="font-bold text-gray-900 text-lg mb-3">Comments</h3>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add comment..."
            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#1f3f5e] min-h-[80px] resize-none"
          />
          <div className="mt-3 flex justify-end">
            <Reusable_Button
              variant="primary"
              className="bg-[#1f3f5e] hover:bg-[#16304a] text-white"
              onClick={() => {
                // TODO: dispatch addTicketComment when the endpoint is ready
                setComment("");
              }}
            >
              Add Comment
            </Reusable_Button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ---------- small helpers ---------- */
const InfoCard = ({ icon: Icon, color, label, value }: any) => (
  <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
    <div className="flex items-center gap-3">
      <div className={`p-2 bg-${color}-50 rounded-lg`}>
        <Icon className={`text-${color}-600`} size={18} />
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium uppercase">{label}</p>
        <div className="text-sm font-semibold text-gray-900">{value}</div>
      </div>
    </div>
  </div>
);

const Field = ({ label, value }: { label: string; value: string }) => (
  <div>
    <label className="text-xs text-gray-500 font-medium block mb-1">{label}</label>
    <p className="text-gray-900 text-sm">{value}</p>
  </div>
);

export default Investigation;