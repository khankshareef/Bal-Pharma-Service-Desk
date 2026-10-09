import { useEffect, useMemo, useState, type ReactNode } from "react";
import { FaRegStar } from "react-icons/fa";
import {
  FiArrowLeft,
  FiAward,
  FiCalendar,
  FiClock,
  FiPaperclip,
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
import Rating_Model from "../../../component/Rating_Model/Rating_Model";
import { getSocket } from "../../../service/socket";
import type { AppDispatch, RootState } from "../../../store/store/Store";
import {
  addComment,
  fetchComments,
  receiveComment,
  type Comment,
} from "../../../store/user/slice/commentSlice";
import {
  createRating,
  fetchRatingsByTicket,
  type Rating,
} from "../../../store/user/slice/ratingSlice";
import {
  fetchTicketById,
  updateTicketStatus,
  type Ticket,
} from "../../../store/user/slice/TicketsSlice";
import { fileUrl } from "../../../utils/fileUrl";

const EMPTY_COMMENTS: never[] = [];

const REOPEN_WINDOW_HOURS = 24;

const hoursSince = (iso?: string | null): number => {
  if (!iso) return Infinity;
  return (Date.now() - new Date(iso).getTime()) / 3_600_000;
};

const isReopenAllowed = (t: Ticket): boolean => {
  const s = (t.status ?? "").toUpperCase();
  if (s === "RESOLVED") return hoursSince(t.resolvedAt) < REOPEN_WINDOW_HOURS;
  if (s === "CLOSED") return hoursSince(t.closedAt) < REOPEN_WINDOW_HOURS;
  return false;
};

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

const Ticket_Details = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const ticketId = Number(id);

  const user = useSelector((s: any) => s.auth?.user ?? s.loginRoute?.user);
  const employeeId = user?.employeeId ?? "";
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

  const ratings = useSelector((s: RootState) => s.rating.list);

  const [ticket, setTicket] = useState<Ticket | null>(cached ?? null);
  const [loading, setLoading] = useState(!cached);
  const [comment, setComment] = useState("");
  const [isRating, setRating] = useState(false);
  const [busy, setBusy] = useState(false);

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
  }, [dispatch, id, ticketId, cached]);

  useEffect(() => {
    if (!ticketId || Number.isNaN(ticketId)) return;
    dispatch(fetchComments(ticketId));
  }, [ticketId, dispatch]);

  useEffect(() => {
    if (!ticketId || Number.isNaN(ticketId)) return;

    const sock = getSocket();
    if (!sock) return;

    const onComment = (payload: any) => {
      const raw = payload?.comment ?? payload;
      const incomingTicketId = Number(
        payload?.ticketId ??
          payload?.ticket_id ??
          raw?.ticketId ??
          raw?.ticket_id
      );

      if (incomingTicketId !== ticketId) return;

      if (!raw?.id) return;

      const c: Comment = {
        id: raw.id,
        ticketId: incomingTicketId,
        authorId: raw.authorId,
        authorName: raw.authorName,
        authorInitials: raw.authorInitials ?? "?",
        body: raw.body,
        createdAt: raw.createdAt,
      };

      dispatch(receiveComment(c));
    };

    sock.on("ticket:comment", onComment);

    return () => {
      sock.off("ticket:comment", onComment);
    };
  }, [ticketId, dispatch]);

  useEffect(() => {
    if (ticketId) dispatch(fetchRatingsByTicket(ticketId));
  }, [dispatch, ticketId]);

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

  const getPriorityColor = (priority: string) => {
    const map: Record<string, string> = {
      HIGH: "bg-red-100 text-red-700 border-red-200",
      MEDIUM: "bg-yellow-100 text-yellow-700 border-yellow-200",
      LOW: "bg-green-100 text-green-700 border-green-200",
    };
    return map[priority] || "bg-gray-100 text-gray-700";
  };

  const getSLAColor = (sla: string) => {
    const map: Record<string, string> = {
      ON_TRACK: "bg-green-100 text-green-700",
      AT_RISK: "bg-yellow-100 text-yellow-700",
      BREACHED: "bg-red-100 text-red-700",
    };
    return map[sla] || "bg-gray-100 text-gray-700";
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

  const handleClose = () => {
    if (!ticket) return;

    showPopup({
      type: "confirm",
      title: "Close Ticket",
      message: "Close this ticket? You can reopen within 24 hours.",
      confirmText: "Confirm & Close",
      cancelText: "Cancel",
      onConfirm: async () => {
        closePopup();
        try {
          setBusy(true);
          await dispatch(
            updateTicketStatus({
              id: ticket.id,
              status: "CLOSED",
              employeeId,
            })
          ).unwrap();
          const fresh = await dispatch(fetchTicketById(ticket.id)).unwrap();
          setTicket(fresh);
          showPopup({
            type: "success",
            title: "Ticket Closed",
            message: `Ticket ${fresh.ticketCode} has been closed.`,
          });
        } catch (err: any) {
          showPopup({
            type: "error",
            title: "Close Failed",
            message: err?.error || err?.message || "Failed to close ticket.",
          });
        } finally {
          setBusy(false);
        }
      },
    });
  };

  const handleEdit = () => {
    if (!ticket) return;
    showPopup({
      type: "confirm",
      title: "Edit Ticket",
      message: "Continue to edit this ticket?",
      confirmText: "Edit",
      onConfirm: () => {
        closePopup();
        navigate(`../../edit-ticket/${ticket.id}`);
      },
    });
  };

  const handleReopen = () => {
    if (!ticket) return;

    if (!isReopenAllowed(ticket)) {
      showPopup({
        type: "error",
        title: "Reopen Window Expired",
        message:
          "You can only reopen a ticket within 24 hours of resolution or closure.",
      });
      return;
    }

    showPopup({
      type: "confirm",
      title: "Reopen Request",
      message: "Send a request to reopen this ticket?",
      confirmText: "Request Reopen",
      onConfirm: () => {
        closePopup();
        navigate(`../reopen-ticket/${ticket.id}`);
      },
    });
  };

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

  const handleRatingSubmit = async (data: {
    rating: number;
    comments: string;
  }) => {
    if (!ticket) return;
    try {
      await dispatch(
        createRating({
          ticketId: ticket.id,
          rating: data.rating,
          comments: data.comments,
          ratedBy: employeeId,
        })
      ).unwrap();
      setRating(false);
      dispatch(fetchRatingsByTicket(ticket.id));
      showPopup({
        type: "success",
        title: "Rating Submitted",
        message: "Thanks for your feedback!",
      });
    } catch (err: any) {
      setRating(false);
      showPopup({
        type: "error",
        title: "Rating Failed",
        message: err?.error || err?.message || "Failed to submit rating.",
      });
    }
  };

  const rating: Rating | undefined = useMemo(
    () => ratings.find((r) => r.ticketId === ticketId),
    [ratings, ticketId]
  );

  const renderStars = (value: number) => (
    <div className="flex items-center gap-1 mt-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-4 h-4 ${
            star <= value ? "text-yellow-400" : "text-gray-200"
          }`}
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
        Ticket not found.
      </div>
    );
  }

  const statusUpper = (ticket.status ?? "").toUpperCase();
  const canClose = statusUpper === "RESOLVED";
  const canEdit = statusUpper !== "RESOLVED" && statusUpper !== "CLOSED";
  const showReopen = statusUpper === "RESOLVED" || statusUpper === "CLOSED";
  const canReopen = isReopenAllowed(ticket);
  const showRateButton =
    (statusUpper === "RESOLVED" || statusUpper === "CLOSED") && !rating;

  const activity: { time: string; role: string; text: string }[] = [];
  activity.push({
    time: formatDate(ticket.createdAt),
    role: ticket.createdByName ?? "Employee",
    text: "Ticket created and submitted.",
  });
  if (ticket.assignedAt && ticket.assignedToName) {
    activity.push({
      time: formatDate(ticket.assignedAt),
      role: "Executive",
      text: `Ticket assigned to ${ticket.assignedToEmployeeId}.`,
    });
  }
  if (ticket.resolvedAt) {
    activity.push({
      time: formatDate(ticket.resolvedAt),
      role: "Executive",
      text: "Ticket resolved.",
    });
  }
  if (rating) {
    activity.push({
      time: formatDate(rating.createdAt),
      role: "User",
      text: `Rating: ${rating.rating}/5${
        rating.comments ? ` — "${rating.comments}"` : ""
      }`,
    });
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

          <div className="flex items-center gap-3 flex-wrap">
            {canEdit && (
              <Reusable_Button onClick={handleEdit} variant="primary">
                Edit Ticket
              </Reusable_Button>
            )}

            {canClose && (
              <Reusable_Button
                onClick={handleClose}
                variant="primary"
                disabled={busy}
                className="bg-[#166534] hover:bg-[#14532d]"
              >
                {busy ? "Closing…" : "Confirm & Close"}
              </Reusable_Button>
            )}

            {showReopen && (
              <Reusable_Button
                onClick={handleReopen}
                variant="secondary"
                disabled={!canReopen}
                title={!canReopen ? "Reopen window (24h) has expired." : ""}
                className={!canReopen ? "!cursor-not-allowed !opacity-50" : ""}
              >
                Reopen Request
              </Reusable_Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <InfoTile
          icon={FiTag}
          bg="bg-blue-50"
          color="text-blue-600"
          label="Category"
          value={ticket.categoryName ?? "—"}
        />
        <InfoTile
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
        <InfoTile
          icon={FiCalendar}
          bg="bg-green-50"
          color="text-green-600"
          label="Raised"
          value={formatDate(ticket.createdAt)}
        />
        <InfoTile
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
                  <Field label="Ticket ID" value={ticket.ticketCode} />
                  <Field label="Subject" value={ticket.subject} />
                  <Field
                    label="Department"
                    value={ticket.departmentName ?? "—"}
                  />
                  <Field
                    label="Sub Category"
                    value={ticket.subCategoryName ?? "—"}
                  />
                </div>
                <div className="space-y-4">
                  <Field
                    label="Raised By"
                    value={`${ticket.createdByName ?? "—"} (${
                      ticket.createdByEmployeeId ?? "—"
                    })`}
                  />
                  <Field label="Unit" value={`${ticket.unitName ?? "—"}`} />
                  <Field
                    label="Assigned To"
                    value={ticket.assignedToEmployeeId ?? "Unassigned"}
                  />
                  <Field
                    label="Last Updated"
                    value={formatDate(ticket.updatedAt)}
                  />
                  {ticket.resolvedAt && (
                    <Field
                      label="Resolved"
                      value={formatDate(ticket.resolvedAt)}
                    />
                  )}
                  {ticket.closedAt && (
                    <Field
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

              <div className="mt-6 pt-6 border-t border-gray-100">
                <label className="text-xs text-gray-500 uppercase block mb-1">
                  Rating
                </label>
                {rating ? (
                  renderStars(rating.rating)
                ) : (
                  <p className="text-sm text-gray-400 italic">
                    Not rated yet
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200">
            <div className="border-b border-gray-100 px-6 py-4">
              <h3 className="font-bold text-gray-800 text-[15px]">
                Activity Timeline
              </h3>
            </div>
            <div className="p-6 space-y-3">
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
              <h3 className="font-bold text-gray-800 text-[15px]">
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
                {showRateButton && (
                  <Reusable_Button
                    onClick={() => setRating(true)}
                    children="Rate Resolution"
                    leftIcon={<FaRegStar />}
                    variant="secondary"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {isRating && (
        <Rating_Model
          isOpen={isRating}
          onClose={() => setRating(false)}
          onSubmit={handleRatingSubmit}
        />
      )}

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

const Field = ({ label, value }: { label: string; value: ReactNode }) => (
  <div>
    <label className="text-xs text-gray-500 uppercase block mb-1">
      {label}
    </label>
    <p className="text-gray-900">{value}</p>
  </div>
);

const InfoTile = ({ icon: Icon, bg, color, label, value }: any) => (
  <div className="bg-white rounded-lg border border-gray-200 p-4">
    <div className="flex items-center gap-3">
      <div className={`p-2 ${bg} rounded-lg`}>
        <Icon className={color} size={18} />
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium uppercase">{label}</p>
        <div className="text-sm font-semibold text-gray-900">{value}</div>
      </div>
    </div>
  </div>
);

export default Ticket_Details;