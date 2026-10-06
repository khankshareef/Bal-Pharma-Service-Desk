import { useEffect, useMemo, useState } from "react";
import {
  FiArrowLeft,
  FiAward,
  FiCalendar,
  FiClock,
  FiFile,
  FiMessageCircle,
  FiPaperclip,
  FiSearch,
  FiSend,
  FiTag,
} from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import Reusable_Button from "../../../component/button/Reusable_Button";
import Reusable_Field from "../../../component/fields/Reusable_Field";
import Loader from "../../../component/loader/Loader";

import type { AppDispatch, RootState } from "../../../store/store/Store";
import {
  fetchTicketById,
  type Ticket,
} from "../../../store/user/slice/TicketsSlice";
import { fileUrl } from "../../../utils/fileUrl";

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

const Assigned_Details = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const cached = useSelector((s: RootState) =>
    s.tickets.tickets.find((t: Ticket) => t.id === Number(id))
  );

  const [ticket, setTicket] = useState<Ticket | null>(cached ?? null);
  const [loading, setLoading] = useState(!cached);
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (!id) {
      console.warn("Assigned_Details: no id in URL");
      return;
    }
    if (cached) {
      setTicket(cached);
      setLoading(false);
      return;
    }
    setLoading(true);
    dispatch(fetchTicketById(Number(id)))
      .unwrap()
      .then(setTicket)
      .catch((err) => alert(err?.error || "Failed to load ticket"))
      .finally(() => setLoading(false));
  }, [dispatch, id, cached]);

  const attachments: { url: string; name: string }[] = useMemo(() => {
    if (!ticket) return [];

    // Multi (CSV) — preferred
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

    // Legacy single
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

  if (loading) return <Loader />;

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
      <div className="mb-6">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4 cursor-pointer"
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
            {/* <Reusable_Button
              onClick={() => navigate(`../resolve/${ticket.id}`)}
              children="Resolve"
              leftIcon={<ImCheckboxChecked />}
              className="bg-[#166534] hover:bg-[#14532d]"
            /> */}
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
          color="blue"
          label="Category"
          value={ticket.categoryName ?? "—"}
        />
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
        <InfoCard
          icon={FiCalendar}
          color="green"
          label="Raised"
          value={formatDate(ticket.createdAt)}
        />
        <InfoCard
          icon={FiClock}
          color="orange"
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
          {/* Ticket Details */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
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
                    label="Category"
                    value={ticket.categoryName ?? "—"}
                  />
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
                  <DetailField label="Unit" value={ticket.unitName ?? "—"} />
                  <DetailField label="Address" value={ticket.address ?? "—"} />
                  <DetailField
                    label="Created By"
                    value={
                      ticket.createdByName
                        ? `${ticket.createdByName} (${ticket.createdByEmployeeId})`
                        : "—"
                    }
                  />
                  <DetailField
                    label="Priority"
                    value={
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${getPriorityColor(
                          ticket.priority
                        )}`}
                      >
                        {priorityLabel(ticket.priority)}
                      </span>
                    }
                  />
                  <DetailField
                    label="Raised On"
                    value={formatDate(ticket.createdAt)}
                  />
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <label className="text-xs text-gray-500 font-semibold uppercase tracking-wider block mb-2">
                  Description
                </label>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {ticket.description || "No description provided."}
                </p>
              </div>

              {(ticket as any).resolutionNotes && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <label className="text-xs text-gray-500 font-semibold uppercase tracking-wider block mb-2">
                    Resolution Notes
                  </label>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {(ticket as any).resolutionNotes}
                  </p>
                  {(ticket as any).resolutionType && (
                    <p className="text-xs text-gray-500 mt-2">
                      Type: <strong>{(ticket as any).resolutionType}</strong>
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-gray-800 text-[15px] flex items-center gap-2">
                <FiPaperclip className="text-blue-600" />
                Attachments from Employee
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
                  No files were attached to this ticket.
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

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="border-b border-gray-100 px-6 py-4">
              <h3 className="font-bold text-gray-800 text-[15px] flex items-center gap-2">
                <FiClock size={16} className="text-blue-600" />
                Activity Timeline
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <TimelineItem
                  time={formatDate(ticket.createdAt)}
                  user={ticket.createdByName ?? "Employee"}
                  action="Ticket created and submitted."
                  isLast={!ticket.updatedAt}
                />
                {ticket.updatedAt && ticket.updatedAt !== ticket.createdAt && (
                  <TimelineItem
                    time={formatDate(ticket.updatedAt)}
                    user="System"
                    action="Ticket last updated."
                    isLast
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden sticky top-6">
            <div className="border-b border-gray-100 px-6 py-4">
              <h3 className="font-bold text-gray-800 text-[15px] flex items-center gap-2">
                <FiMessageCircle size={16} className="text-blue-600" />
                Comments
              </h3>
            </div>

            <div className="p-4 max-h-[400px] overflow-y-auto">
              <div className="text-center py-8">
                <p className="text-gray-400 text-sm">
                  Comments not wired yet.
                </p>
              </div>
            </div>

            <div className="border-t border-gray-100 p-4">
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-green-600">ME</span>
                </div>
                <div className="flex-1">
                  <Reusable_Field
                    label="comment"
                    type="textarea"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add a comment..."
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <Reusable_Button
                      children=""
                      leftIcon={<FiPaperclip size={16} />}
                      variant="secondary"
                      disabled
                    />
                    <Reusable_Button
                      children="Send"
                      leftIcon={<FiSend size={14} />}
                      variant="primary"
                      disabled={!comment.trim()}
                      onClick={() => {
                        setComment("");
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AttachmentPreview = ({ url, name }: { url: string; name: string }) => {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  const isImage = ["png", "jpg", "jpeg", "gif", "webp", "bmp", "svg"].includes(ext);
  const isVideo = ["mp4", "webm", "mov", "avi", "mkv"].includes(ext);
  const isAudio = ["mp3", "wav", "ogg", "m4a", "aac"].includes(ext);
  const isPdf = ext === "pdf";

  return (
    <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-800 truncate">
          <FiPaperclip size={14} className="text-blue-600 shrink-0" />
          <span className="truncate">{name}</span>
        </div>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          download
          className="text-xs text-blue-600 hover:underline shrink-0 ml-3"
        >
          Download
        </a>
      </div>

      {isImage && (
        <img
          src={url}
          alt={name}
          className="max-h-72 rounded-lg border border-gray-200 object-contain bg-white"
        />
      )}

      {isVideo && (
        <video
          controls
          src={url}
          className="max-h-72 rounded-lg border border-gray-200 bg-black"
        >
          Your browser does not support video playback.
        </video>
      )}

      {isAudio && (
        <audio controls src={url} className="w-full">
          Your browser does not support audio playback.
        </audio>
      )}

      {isPdf && (
        <iframe
          src={url}
          title={name}
          className="w-full h-72 rounded-lg border border-gray-200 bg-white"
        />
      )}

      {!isImage && !isVideo && !isAudio && !isPdf && (
        <div className="flex items-center gap-2 text-sm text-gray-600 italic">
          <FiFile size={14} />
          Preview not available — use Download to view the file.
        </div>
      )}
    </div>
  );
};

const InfoCard = ({ icon: Icon, color, label, value }: any) => (
  <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
    <div className="flex items-center gap-3">
      <div className={`p-2 bg-${color}-50 rounded-lg`}>
        <Icon className={`text-${color}-600`} size={18} />
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

const DetailField = ({ label, value }: { label: string; value: any }) => (
  <div>
    <label className="text-xs text-gray-500 font-semibold uppercase tracking-wider block mb-1">
      {label}
    </label>
    <div className="text-gray-900">{value}</div>
  </div>
);

const TimelineItem = ({
  time,
  user,
  action,
  isLast,
}: {
  time: string;
  user: string;
  action: string;
  isLast?: boolean;
}) => (
  <div className="flex gap-4">
    <div className="flex flex-col items-center">
      <div className="w-3 h-3 rounded-full bg-blue-600 mt-1.5" />
      {!isLast && <div className="w-0.5 h-full bg-blue-200 mt-1" />}
    </div>
    <div className="flex-1 pb-4">
      <div className="flex items-center gap-3 mb-1">
        <span className="text-sm font-semibold text-gray-900">{time}</span>
        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
          {user}
        </span>
      </div>
      <p className="text-sm text-gray-700">{action}</p>
    </div>
  </div>
);

export default Assigned_Details;