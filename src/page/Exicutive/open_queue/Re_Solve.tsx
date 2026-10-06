import { useEffect, useState } from "react";
import { CiExport } from "react-icons/ci";
import { FiArrowLeft } from "react-icons/fi";
import { GrRefresh } from "react-icons/gr";
import { ImCheckboxChecked } from "react-icons/im";
import { LuCopy } from "react-icons/lu";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import Reusable_Button from "../../../component/button/Reusable_Button";
import Loader from "../../../component/loader/Loader";
import ReusablePopup from "../../../component/popups/Reusable_Popup";

import type { AppDispatch, RootState } from "../../../store/store/Store";
import {
  fetchTicketById,
  updateTicketStatus,
  type Ticket,
} from "../../../store/user/slice/TicketsSlice";

type ResolutionType = "FIXED" | "WORKAROUND" | "ESCALATED" | "DUPLICATE";

const Re_Solve = () => {
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
  const [resolutionType, setResolutionType] = useState<ResolutionType>("FIXED");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
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

  const handleResolve = async () => {
    if (!employeeId) {
      setPopup({
        isOpen: true,
        type: "error",
        title: "Session Missing",
        message: "Please log in again.",
      });
      return;
    }

    if (!notes.trim()) {
      setPopup({
        isOpen: true,
        type: "error",
        title: "Notes Required",
        message: "Please enter resolution notes.",
      });
      return;
    }

    try {
      setSubmitting(true);
      await dispatch(
        updateTicketStatus({
          id: Number(id),
          status: "RESOLVED",
          employeeId,                
          resolutionNotes: notes,     
          resolutionType,             
        } as any)
      ).unwrap();

      setPopup({
        isOpen: true,
        type: "success",
        title: "Ticket Resolved",
        message: "Resolution saved. Continue to close the ticket?",
      });
    } catch (err: any) {
      setPopup({
        isOpen: true,
        type: "error",
        title: "Failed",
        message: err?.error || err?.message || "Could not resolve ticket.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader />;
  if (!ticket)
    return (
      <div className="flex min-h-[400px] items-center justify-center text-gray-500">
        Ticket not found.
      </div>
    );

  return (
    <div className="max-w-full mx-auto font-sans">
      <div className="mb-6">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <FiArrowLeft size={18} />
          <span className="font-medium">Back</span>
        </button>
        <p className="text-2xl font-bold text-[#002D5B]">Resolve Ticket</p>
      </div>

      <div className="bg-[#F8FAFC] border border-gray-100 rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {ticket.ticketCode}
            </h2>
            <p className="text-gray-800 text-base">{ticket.subject}</p>
            <p className="text-gray-700 text-sm mt-1">
              Category: {ticket.categoryName} · Priority: {ticket.priority} ·
              Unit: {ticket.unitName}
            </p>
          </div>
          <span className="text-xs text-gray-700 font-medium">
            {ticket.status}
          </span>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6 grid grid-cols-3 gap-4">
          <Info label="Ticket ID" value={ticket.ticketCode} />
          <Info label="Subject" value={ticket.subject} />
          <Info label="Current Status" value={ticket.status} />
        </div>

        <div className="mb-6">
          <label className="block text-sm text-gray-500 mb-3">
            Resolution Notes *
          </label>

          <div className="flex gap-3 mb-4 flex-wrap">
            <ResolutionBtn
              active={resolutionType === "FIXED"}
              onClick={() => setResolutionType("FIXED")}
              className="bg-green-50 border-green-200 text-green-800"
              icon={
                <div className="w-4 h-4 bg-green-500 rounded flex items-center justify-center text-white">
                  <ImCheckboxChecked />
                </div>
              }
              label="Fixed"
            />
            <ResolutionBtn
              active={resolutionType === "WORKAROUND"}
              onClick={() => setResolutionType("WORKAROUND")}
              className="bg-blue-50 border-blue-200 text-blue-800"
              icon={<GrRefresh />}
              label="Workaround"
            />
            <ResolutionBtn
              active={resolutionType === "ESCALATED"}
              onClick={() => setResolutionType("ESCALATED")}
              className="bg-red-50 border-red-200 text-red-800"
              icon={<CiExport />}
              label="Escalated"
            />
            <ResolutionBtn
              active={resolutionType === "DUPLICATE"}
              onClick={() => setResolutionType("DUPLICATE")}
              className="bg-orange-50 border-orange-200 text-orange-800"
              icon={<LuCopy />}
              label="Duplicate"
            />
          </div>

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full border border-gray-200 rounded-xl p-4 text-sm min-h-[120px] resize-y"
            placeholder="Enter resolution details"
          />
        </div>

        <div className="flex gap-3">
          <Reusable_Button
            children="Cancel"
            variant="secondary"
            onClick={() => window.history.back()}
          />
          <Reusable_Button
            onClick={handleResolve}
            disabled={submitting}
            children={submitting ? "Resolving…" : "Confirm Resolve"}
            variant="primary"
            leftIcon={<ImCheckboxChecked />}
          />
        </div>
      </div>

      <ReusablePopup
        isOpen={popup.isOpen}
        onClose={() => setPopup((p) => ({ ...p, isOpen: false }))}
        onConfirm={() => {
          setPopup((p) => ({ ...p, isOpen: false }));
          if (popup.type === "success") navigate(-1);
        }}
        type={popup.type}
        title={popup.title}
        message={popup.message}
        confirmText={popup.type === "success" ? "Confirm Close" : "OK"}
      />
    </div>
  );
};

const Info = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-xs text-gray-400 mb-1">{label}</p>
    <p className="text-sm font-medium text-gray-900">{value}</p>
  </div>
);

const ResolutionBtn = ({ active, onClick, className, icon, label }: any) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
      active ? className : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
    }`}
  >
    {icon} {label}
  </button>
);

export default Re_Solve;