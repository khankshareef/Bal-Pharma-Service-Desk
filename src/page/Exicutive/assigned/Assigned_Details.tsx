import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  FiArrowLeft,
  FiAward,
  FiCalendar,
  FiClock,
  FiMessageCircle,
  FiPaperclip,
  FiSearch,
  FiSend,
  FiTag,
} from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import AttachmentPreview from "../../../component/attachments/AttachmentPreview";
import Reusable_Button from "../../../component/button/Reusable_Button";
import Reusable_Field from "../../../component/fields/Reusable_Field";
import Loader from "../../../component/loader/Loader";
import ReusablePopup from "../../../component/popups/Reusable_Popup";
import type { AppDispatch, RootState } from "../../../store/store/Store";
import {
  addComment,
  fetchComments,
} from "../../../store/user/slice/commentSlice";
import {
  fetchTicketById,
  type Ticket,
} from "../../../store/user/slice/TicketsSlice";
import { fileUrl } from "../../../utils/fileUrl";

const EMPTY_COMMENTS: never[] = [];

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

const priorityLabel = (p?: string) =>
  p ? p.charAt(0) + p.slice(1).toLowerCase() : "";

const statusLabel = (s?: string) =>
  s ? s.charAt(0) + s.slice(1).toLowerCase().replace("_", " ") : "";

const slaLabel = (s?: string) =>
  s
    ? s
        .split("_")
        .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
        .join(" ")
    : "";

type PopupKind = "success" | "error" | "confirm" | "info";

interface PopupState {
  isOpen: boolean;
  type: PopupKind;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void | Promise<void>;
}

const Assigned_Details = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const ticketId = Number(id);

  const user = useSelector((s: any) => s.auth?.user ?? s.loginRoute?.user);
  const currentUserId = user?.userId ?? null;

  const cached = useSelector((s: RootState) =>
    s.tickets.tickets.find((t: Ticket) => t.id === ticketId)
  );

  const comments = useSelector(
    (s: RootState) => s.comments.byTicket[ticketId] ?? EMPTY_COMMENTS
  );
  const savingComment = useSelector(
    (s: RootState) => s.comments.savingByTicket[ticketId] ?? false
  );

  const [ticket, setTicket] = useState<Ticket | null>(cached ?? null);
  const [loading, setLoading] = useState(!cached);
  const [comment, setComment] = useState("");

  const [popup, setPopup] = useState<PopupState>({
    isOpen: false,
    type: "info",
    title: "",
    message: "",
  });

  const closePopup = () =>
    setPopup((p) => ({ ...p, isOpen: false, onConfirm: undefined }));

  const showPopup = (
    opts: Omit<PopupState, "isOpen"> & { isOpen?: boolean }
  ) => {
    setPopup({ ...opts, isOpen: true });
  };

  useEffect(() => {
    if (!id) return;

    if (cached) {
      setTicket(cached);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    dispatch(fetchTicketById(ticketId))
      .unwrap()
      .then((data) => {
        if (!cancelled) setTicket(data);
      })
      .catch((err) => {
        if (cancelled) return;
        showPopup({
          type: "error",
          title: "Load Failed",
          message: err?.error || err?.message || "Failed to load ticket.",
        });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [dispatch, id, cached, ticketId]);

  useEffect(() => {
    if (!ticketId || Number.isNaN(ticketId)) return;
    dispatch(fetchComments(ticketId));
  }, [ticketId, dispatch]);

  const attachments: { url: string; name: string }[] = useMemo(() => {
    if (!ticket) return [];

    if (ticket.attachmentUrls && ticket.attachmentUrls.trim().length > 0) {
      const urls = ticket.attachmentUrls
        .split(",")
        .map((u) => u.trim())
        .filter(Boolean);
      const names = (ticket.attachmentNames ?? "")
        .split(",")
        .map((n) => n.trim());
      return urls.map((u, i) => ({
        url: u,
        name: names[i] || `File ${i + 1}`,
      }));
    }

    if (ticket.attachmentUrl) {
      return [
        {
          url: ticket.attachmentUrl,
          name: ticket.attachmentName ?? "Attachment",
        },
      ];
    }

    return [];
  }, [ticket]);

  const handleSendComment = async () => {
    const body = comment.trim();
    if (!body) {
      showPopup({
        type: "info",
        title: "Empty Comment",
        message: "Please type a comment before sending.",
      });
      return;
    }
    if (!ticketId || Number.isNaN(ticketId)) {
      showPopup({
        type: "error",
        title: "Send Failed",
        message: "Invalid ticket ID.",
      });
      return;
    }

    try {
      await dispatch(addComment({ ticketId, body })).unwrap();
      setComment("");
    } catch (err: any) {
      showPopup({
        type: "error",
        title: "Send Failed",
        message: err?.error || err?.message || "Failed to send comment.",
      });
    }
  };

  const getPriorityColor = (priority?: string) => {
    const map: Record<string, string> = {
      HIGH: "bg-red-100 text-red-700 border-red-200",
      MEDIUM: "bg-yellow-100 text-yellow-700 border-yellow-200",
      LOW: "bg-green-100 text-green-700 border-green-200",
    };
    return map[priority ?? ""] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const getSLAColor = (sla?: string) => {
    const map: Record<string, string> = {
      ON_TRACK: "bg-green-100 text-green-700 border-green-200",
      AT_RISK: "bg-yellow-100 text-yellow-700 border-yellow-200",
      BREACHED: "bg-red-100 text-red-700 border-red-200",
    };
    return map[sla ?? ""] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const getStatusColor = (status?: string) => {
    const map: Record<string, string> = {
      OPEN: "bg-blue-100 text-blue-700 border-blue-200",
      IN_PROGRESS: "bg-yellow-100 text-yellow-700 border-yellow-200",
      RESOLVED: "bg-green-100 text-green-700 border-green-200",
      CLOSED: "bg-gray-100 text-gray-700 border-gray-200",
    };
    return map[status ?? ""] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  if (loading && !ticket) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex min-h-[400px] items-center justify-center text-gray-500">
        <div className="text-center">
          <p>
            {id
              ? "Ticket not found."
              : "Missing ID in URL — route is misconfigured."}
          </p>
          <button
            onClick={() => window.history.back()}
            className="mt-3 text-blue-600 hover:underline text-sm"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto font-sans">
      {loading && ticket && (
        <div className="flex items-center gap-2 mb-4 px-2 text-sm text-gray-500">
          <Loader text="Refreshing ticket" />
          <span>Refreshing ticket…</span>
        </div>
      )}

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
            <div className="flex items-center gap-3 mb-2 flex-wrap">
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

          <div className="flex gap-2">
            <Reusable_Button
              onClick={() => navigate(`../investigation/${ticket.id}`)}
              children="Investigate"
              leftIcon={<FiSearch />}
              className="bg-[#d97706] hover:bg-[#b45309]"
            />
            <Reusable_Button
              onClick={() => navigate(-1)}
              children="Back"
              variant="secondary"
            />
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
          value={formatDate(ticket.createdAt)}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="border-b border-gray-100 px-6 py-4">
              <h3 className="font-bold text-gray-800 text-[15px]">
                Ticket Details
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <DetailField label="Ticket ID" value={ticket.ticketCode} />
                  <DetailField label="Subject" value={ticket.subject} />
                  <DetailField
                    label="Department"
                    value={ticket.departmentName ?? "—"}
                  />
                  <DetailField
                    label="Sub Category"
                    value={ticket.subCategoryName ?? "—"}
                  />
                </div>
                <div className="space-y-4">
                  <DetailField
                    label="Raised By"
                    value={`${ticket.createdByName ?? "—"} (${
                      ticket.createdByEmployeeId ?? "—"
                    })`}
                  />
                  <DetailField label="Unit" value={ticket.unitName ?? "—"} />
                  <DetailField
                    label="Assigned To"
                    value={ticket.assignedToEmployeeId ?? "Unassigned"}
                  />
                  <DetailField
                    label="Last Updated"
                    value={formatDate(ticket.updatedAt)}
                  />
                  {ticket.resolvedAt && (
                    <DetailField
                      label="Resolved"
                      value={formatDate(ticket.resolvedAt)}
                    />
                  )}
                  {ticket.closedAt && (
                    <DetailField
                      label="Closed"
                      value={formatDate(ticket.closedAt)}
                    />
                  )}
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <label className="text-xs text-gray-500 uppercase block mb-2">
                  Description
                </label>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {ticket.description || "No description provided."}
                </p>
              </div>

              {ticket.resolutionNotes && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <label className="text-xs text-gray-500 uppercase block mb-2">
                    Resolution Notes
                  </label>
                  <p className="text-gray-700 text-sm leading-relaxed">
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

          <div className="bg-white rounded-xl border border-gray-200">
            <div className="border-b border-gray-100 px-6 py-4">
              <h3 className="font-bold text-gray-800 text-[15px]">
                Activity Timeline
              </h3>
            </div>
            <div className="p-6 space-y-3">
              <TimelineRow
                time={formatDate(ticket.createdAt)}
                role={ticket.createdByName ?? "Employee"}
                text="Ticket created and submitted."
              />
              {ticket.assignedAt && ticket.assignedToName && (
                <TimelineRow
                  time={formatDate(ticket.assignedAt)}
                  role="Executive"
                  text={`Ticket assigned to ${ticket.assignedToEmployeeId}.`}
                />
              )}
              {ticket.resolvedAt && (
                <TimelineRow
                  time={formatDate(ticket.resolvedAt)}
                  role="Executive"
                  text="Ticket resolved."
                />
              )}
              {ticket.updatedAt && ticket.updatedAt !== ticket.createdAt && (
                <TimelineRow
                  time={formatDate(ticket.updatedAt)}
                  role="System"
                  text="Ticket last updated."
                />
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200">
            <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-gray-800 text-[15px] flex items-center gap-2">
                <FiPaperclip className="text-blue-600" />
                Attachments
                {attachments.length > 0 && (
                  <span className="text-xs font-normal text-gray-400">
                    ({attachments.length})
                  </span>
                )}
              </h3>
            </div>
            <div className="p-6 space-y-4">
              {attachments.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No files attached to this ticket.
                </p>
              ) : (
                attachments.map((a, i) => (
                  <AttachmentPreview
                    key={i}
                    url={fileUrl(a.url)}
                    name={a.name}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 sticky top-6 flex flex-col max-h-[calc(100vh-3rem)]">
            <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-gray-800 text-[15px] flex items-center gap-2">
                <FiMessageCircle size={16} className="text-blue-600" />
                Comments
              </h3>
              <span className="text-xs text-gray-400">
                {comments.length}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {comments.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">
                  No comments yet.
                </p>
              ) : (
                comments.map((c) => {
                  const isMine =
                    currentUserId !== null && c.authorId === currentUserId;

                  return (
                    <div
                      key={c.id}
                      className={`flex gap-2 ${
                        isMine ? "flex-row-reverse" : "flex-row"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          isMine
                            ? "bg-blue-600 text-white"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        <span className="text-xs font-bold">
                          {c.authorInitials || "?"}
                        </span>
                      </div>

                      <div
                        className={`flex-1 rounded-lg px-3 py-2 min-w-0 ${
                          isMine
                            ? "bg-blue-600 text-white"
                            : "bg-gray-50 text-gray-800"
                        }`}
                      >
                        <div
                          className={`flex items-center gap-2 mb-0.5 ${
                            isMine ? "flex-row-reverse justify-end" : ""
                          }`}
                        >
                          <span
                            className={`text-sm font-semibold truncate ${
                              isMine ? "text-white" : "text-gray-800"
                            }`}
                          >
                            {isMine ? "You" : c.authorName}
                          </span>
                          <span
                            className={`text-[11px] shrink-0 ${
                              isMine ? "text-blue-100" : "text-gray-400"
                            }`}
                          >
                            {formatDate(c.createdAt)}
                          </span>
                        </div>
                        <p
                          className={`text-sm whitespace-pre-wrap break-words ${
                            isMine ? "text-white" : "text-gray-700"
                          }`}
                        >
                          {c.body}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="border-t border-gray-100 p-4">
              <Reusable_Field
                label="Add a comment"
                type="textarea"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment..."
              />
              <div className="flex justify-end gap-2 mt-2">
                <Reusable_Button
                  children={savingComment ? "Sending…" : "Send"}
                  leftIcon={<FiSend size={14} />}
                  variant="primary"
                  onClick={handleSendComment}
                  disabled={!comment.trim() || savingComment}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <ReusablePopup
        isOpen={popup.isOpen}
        onClose={closePopup}
        type={popup.type}
        title={popup.title}
        message={popup.message}
        confirmText={popup.confirmText ?? "OK"}
        cancelText={popup.cancelText ?? "Cancel"}
        onConfirm={popup.onConfirm ?? closePopup}
      />
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
  value: ReactNode;
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

const DetailField = ({ label, value }: { label: string; value: ReactNode }) => (
  <div>
    <label className="text-xs text-gray-500 uppercase block mb-1">
      {label}
    </label>
    <p className="text-gray-900">{value}</p>
  </div>
);

const TimelineRow = ({
  time,
  role,
  text,
}: {
  time: string;
  role: string;
  text: string;
}) => (
  <div className="flex items-center text-[14px]">
    <div className="w-44 text-gray-600 shrink-0">{time}</div>
    <div className="w-28 shrink-0">
      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
        {role}
      </span>
    </div>
    <div className="text-gray-800">{text}</div>
  </div>
);

export default Assigned_Details;