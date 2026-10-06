import { useEffect, useState } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { ImCheckboxChecked } from "react-icons/im";
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

const Closure = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const cached = useSelector((s: RootState) =>
    s.tickets.tickets.find((t: Ticket) => t.id === Number(id))
  );

  const [ticket, setTicket] = useState<Ticket | null>(cached ?? null);
  const [loading, setLoading] = useState(!cached);
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

  const handleClose = async () => {
    try {
      await dispatch(
        updateTicketStatus({ id: Number(id), status: "CLOSED" } as any)
      ).unwrap();

      setPopup({
        isOpen: true,
        type: "success",
        title: "Ticket Closed",
        message: `Ticket ${ticket?.ticketCode} has been closed successfully.`,
      });
    } catch (err: any) {
      setPopup({
        isOpen: true,
        type: "error",
        title: "Closure Failed",
        message: err?.error || err?.message || "Could not close ticket.",
      });
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
        <p className="text-2xl font-bold text-[#002D5B]">Closure Confirmation</p>
      </div>

      <div className="bg-[#F8FAFC] border border-gray-100 rounded-2xl p-6 shadow-sm">
        <div className="bg-[#F0F9F6] border-l-4 border-[#166534] rounded-r-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-1">
            <div className="bg-[#166534] text-white rounded-full w-4 h-4 flex items-center justify-center">
              <ImCheckboxChecked />
            </div>
            <h3 className="text-[#166534] font-medium text-base">
              Confirm Close
            </h3>
          </div>
          <p className="text-sm text-gray-800 ml-6">
            Review the resolution details below and confirm that this ticket
            should be closed.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <div className="grid grid-cols-2 gap-y-6 gap-x-4">
            <Info label="Ticket ID" value={ticket.ticketCode} />
            <Info label="Subject" value={ticket.subject} />
            <Info label="Current Status" value={ticket.status} />
            <Info
              label="Resolution Notes"
              value={ticket.description ?? "No resolution notes."}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Reusable_Button
            children="Cancel"
            variant="secondary"
            onClick={() => window.history.back()}
          />
          <Reusable_Button
            onClick={handleClose}
            children="Confirm Close"
            leftIcon={<ImCheckboxChecked />}
            variant="primary"
          />
        </div>
      </div>

      <ReusablePopup
        isOpen={popup.isOpen}
        onClose={() => setPopup((p) => ({ ...p, isOpen: false }))}
        onConfirm={() => {
          setPopup((p) => ({ ...p, isOpen: false }));
          if (popup.type === "success") navigate("../../review-reopen");
        }}
        type={popup.type}
        title={popup.title}
        message={popup.message}
        confirmText={popup.type === "success" ? "Back to List" : "OK"}
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

export default Closure;