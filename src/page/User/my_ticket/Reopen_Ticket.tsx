import { useEffect, useState } from "react";
import { FiArrowLeft, FiAward, FiCalendar, FiClock, FiTag } from "react-icons/fi";
import { GrSend } from "react-icons/gr";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import Reusable_Button from "../../../component/button/Reusable_Button";
import Reusable_Field from "../../../component/fields/Reusable_Field";
import Loader from "../../../component/loader/Loader";
import ReusablePopup from "../../../component/popups/Reusable_Popup";

import type { AppDispatch, RootState } from "../../../store/store/Store";
import { requestReopen } from "../../../store/user/slice/ReopenSlice";
import { fetchTicketById, type Ticket } from "../../../store/user/slice/TicketsSlice";

const formatDate = (iso?: string | null) =>
  iso
    ? new Date(iso).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

const Reopen_Ticket = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const user = useSelector((s: any) => s.auth?.user ?? s.loginRoute?.user);
  const employeeId = user?.employeeId ?? "";

  const cached = useSelector((s: RootState) =>
    s.tickets.tickets.find((t: Ticket) => t.id === Number(id))
  );

  const [ticket, setTicket] = useState<Ticket | null>(cached ?? null);
  const [loading, setLoading] = useState(!cached);
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [popup, setPopup] = useState({
    isOpen: false,
    type: "success" as "success" | "error",
    title: "",
    message: "",
  });

  useEffect(() => {
    if (!id) return;
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

  const handleSubmit = async () => {
    if (!reason.trim()) {
      setPopup({
        isOpen: true,
        type: "error",
        title: "Reason Required",
        message: "Please provide a reason for reopening this ticket.",
      });
      return;
    }

    if (!ticket || !employeeId) return;

    try {
      setSaving(true);
      const res = await dispatch(
        requestReopen({
          data: { ticketId: ticket.id, reason: reason.trim() },
          employeeId,
        })
      ).unwrap();

      setPopup({
        isOpen: true,
        type: "success",
        title: "Reopen Request Submitted",
        message: `Your reopen request for ${res.ticketCode ?? ticket.ticketCode} has been submitted. An executive will review it soon.`,
      });
    } catch (err: any) {
      setPopup({
        isOpen: true,
        type: "error",
        title: "Request Failed",
        message: err?.error || err?.message || "Failed to submit reopen request.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePopupConfirm = () => {
    setPopup((p) => ({ ...p, isOpen: false }));
    if (popup.type === "success") {
      navigate("../../my-tickets");
    }
  };

  if (loading) return <Loader />;
  if (!ticket) return <div className="p-8">Ticket not found.</div>;

  return (
    <div className="max-w-full mx-auto font-sans">
      <div className="mb-6">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <FiArrowLeft size={18} />
          <span className="font-medium">Back to Tickets</span>
        </button>

        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{ticket.ticketCode}</h1>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                {ticket.status}
              </span>
            </div>
            <h2 className="text-xl text-gray-700 font-medium">{ticket.subject}</h2>
          </div>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <InfoCard icon={FiTag} label="Category" value={ticket.categoryName ?? "—"} color="blue" />
        <InfoCard icon={FiAward} label="Priority" value={ticket.priority} color="purple" />
        <InfoCard icon={FiCalendar} label="Raised" value={formatDate(ticket.createdAt)} color="green" />
        <InfoCard icon={FiClock} label="SLA" value={ticket.slaStatus} color="orange" />
      </div>

      {/* Reopen panel */}
      <div className="bg-[#FEF7DE] p-6 rounded-xl">
        <div className="bg-white rounded-xl p-4 mb-6 flex items-center gap-3 border border-white shadow-sm">
          <span className="text-[#8D4A21]">⚠️</span>
          <p className="text-[#8D4A21] text-[15px] font-medium">
            Submit a reason for requesting that this ticket be reopened.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 mb-6 border border-white shadow-sm">
          <div className="grid grid-cols-2 gap-y-6 gap-x-8">
            <Field label="Ticket ID" value={ticket.ticketCode} />
            <Field label="Subject" value={ticket.subject} />
            <Field label="Current Status" value={ticket.status} />
            <Field label="Unit" value={ticket.unitName ?? "—"} />
          </div>
        </div>

        <div className="mb-6">
          <Reusable_Field
            label="Reason for Reopen *"
            placeholder="Enter the reason for requesting ticket reopening."
            type="textarea"
            name="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>

        <div className="flex gap-4 items-center justify-end">
          <Reusable_Button
            variant="secondary"
            children="Cancel"
            onClick={() => window.history.back()}
            disabled={saving}
          />
          <Reusable_Button
            children={saving ? "Submitting…" : "Submit Reopen Request"}
            leftIcon={<GrSend />}
            variant="primary"
            onClick={handleSubmit}
            disabled={saving}
          />
        </div>
      </div>

      <ReusablePopup
        isOpen={popup.isOpen}
        onClose={() => setPopup((p) => ({ ...p, isOpen: false }))}
        onConfirm={handlePopupConfirm}
        type={popup.type}
        title={popup.title}
        message={popup.message}
        confirmText={popup.type === "success" ? "View My Tickets" : "OK"}
      />
    </div>
  );
};

const InfoCard = ({ icon: Icon, label, value, color }: any) => (
  <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
    <div className="flex items-center gap-3">
      <div className={`p-2 bg-${color}-50 rounded-lg`}>
        <Icon className={`text-${color}-600`} size={18} />
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium uppercase">{label}</p>
        <p className="text-sm font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);

const Field = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-[13px] text-gray-500 mb-1 font-medium">{label}</p>
    <p className="text-[15px] font-medium text-black">{value}</p>
  </div>
);

export default Reopen_Ticket;