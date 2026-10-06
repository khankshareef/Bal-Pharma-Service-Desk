import { useEffect, useState } from "react";
import { FiArrowLeft, FiPaperclip, FiSend } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import Reusable_Button from "../../../component/button/Reusable_Button";
import Reusable_Field from "../../../component/fields/Reusable_Field";
import ReusablePopup, {
  type PopupType,
} from "../../../component/popups/Reusable_Popup";

import type { AppDispatch, RootState } from "../../../store/store/Store";
import { fetchTicketById, type Ticket } from "../../../store/user/slice/TicketsSlice";

import {
  closeRequest,
  createTicketInfoRequest,
  fetchRequestsByTicket,
  type TicketInfoRequest,
} from "../../../store/exicutive/slice/requestInfoSlice";

interface PopupState {
  isOpen: boolean;
  type: PopupType;
  title: string;
  message: string;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
}

const emptyPopup: PopupState = {
  isOpen: false,
  type: "info",
  title: "",
  message: "",
};

const Request_Info = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const ticketId = Number(id);

  const user = useSelector((s: any) => s.auth?.user ?? s.loginRoute?.user);
  const employeeId = user?.employeeId ?? "";

  const ticket = useSelector((s: RootState) =>
    s.tickets.tickets.find((t: Ticket) => t.id === ticketId)
  );

  const requests = useSelector((s: RootState) => s.requestInfo.list);
  const loading = useSelector((s: RootState) => s.requestInfo.loading);

  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [popup, setPopup] = useState<PopupState>(emptyPopup);

  useEffect(() => {
    if (!ticket && ticketId) dispatch(fetchTicketById(ticketId));
    if (ticketId) dispatch(fetchRequestsByTicket(ticketId));
  }, [dispatch, ticketId, ticket]);

  const handleSubmit = async () => {
    if (!message.trim()) {
      setPopup({
        isOpen: true,
        type: "error",
        title: "Message required",
        message: "Please describe what information you need before sending.",
      });
      return;
    }

    try {
      await dispatch(
        createTicketInfoRequest({
          ticketId,
          message: message.trim(),
          attachmentNames: file?.name,
          requestedBy: employeeId,
        })
      ).unwrap();

      setPopup({
        isOpen: true,
        type: "success",
        title: "Request Sent",
        message:
          "The ticket creator has been notified. Status: PENDING.",
      });

      setMessage("");
      setFile(null);
      dispatch(fetchRequestsByTicket(ticketId));
    } catch (err: any) {
      setPopup({
        isOpen: true,
        type: "error",
        title: "Failed",
        message: err?.message || "Could not send the request.",
      });
    }
  };

  const askCloseRequest = (requestId: number) => {
    setPopup({
      isOpen: true,
      type: "confirm",
      title: "Close this request?",
      message:
        "Once closed, the creator can no longer respond to this information request.",
      confirmText: "Yes, close",
      cancelText: "Cancel",
      onConfirm: async () => {
        setPopup(emptyPopup);
        try {
          await dispatch(closeRequest({ id: requestId, employeeId })).unwrap();
          setPopup({
            isOpen: true,
            type: "success",
            title: "Request Closed",
            message: "The request has been marked as CLOSED.",
          });
          dispatch(fetchRequestsByTicket(ticketId));
        } catch (err: any) {
          setPopup({
            isOpen: true,
            type: "error",
            title: "Failed to close",
            message: err?.message || "Please try again.",
          });
        }
      },
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => window.history.back()}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 cursor-pointer"
      >
        <FiArrowLeft size={18} />
        <span className="font-medium">Back</span>
      </button>

      <h1 className="text-2xl font-bold text-slate-800 mb-1">
        Request More Information
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        Ticket <span className="font-semibold">{ticket?.ticketCode ?? "—"}</span>
        {" — "}
        {ticket?.subject ?? "Loading..."}
      </p>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
        <Reusable_Field
          label="What information do you need?"
          id="message"
          type="textarea"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="e.g. Please share the screenshot of the error and the exact time it occurred."
        />

        <div className="mt-4">
          <Reusable_Field
            label="Attachment (optional)"
            id="file"
            type="file"
            onChange={(e) => {
              const target = e.target as HTMLInputElement;
              setFile(target.files?.[0] ?? null);
            }}
          />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Reusable_Button variant="secondary" onClick={() => navigate(-1)}>
            Cancel
          </Reusable_Button>
          <Reusable_Button
            variant="primary"
            onClick={handleSubmit}
            loading={loading}
            leftIcon={<FiSend size={16} />}
          >
            Send Request
          </Reusable_Button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl">
        <div className="border-b border-gray-100 px-6 py-4">
          <h3 className="font-bold text-gray-800 text-[15px]">
            Previous Requests
          </h3>
        </div>

        <div className="p-6 space-y-4">
          {requests.length === 0 ? (
            <p className="text-sm text-gray-500">No requests yet.</p>
          ) : (
            requests.map((r: TicketInfoRequest) => (
              <div
                key={r.id}
                className="border border-gray-100 rounded-xl p-4 bg-gray-50/50"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-500 uppercase">
                    {r.requestedByName} ·{" "}
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

                <p className="text-sm text-gray-800 mb-2">{r.message}</p>

                {r.attachmentNames && (
                  <div className="flex items-center gap-2 text-xs text-blue-600 mb-2">
                    <FiPaperclip size={12} />
                    {r.attachmentNames}
                  </div>
                )}

                {r.response && (
                  <div className="mt-3 border-t border-gray-200 pt-3">
                    <div className="text-xs font-semibold text-gray-500 mb-1">
                      Reply from {r.respondedByName ?? "user"}
                    </div>
                    <p className="text-sm text-gray-700">{r.response}</p>
                  </div>
                )}

                {r.status !== "CLOSED" && (
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={() => askCloseRequest(r.id)}
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

      <ReusablePopup
        isOpen={popup.isOpen}
        onClose={() => setPopup(emptyPopup)}
        onConfirm={() => {
          const cb = popup.onConfirm;
          setPopup(emptyPopup);
          cb?.();
        }}
        type={popup.type}
        title={popup.title}
        message={popup.message}
        confirmText={popup.confirmText}
        cancelText={popup.cancelText}
      />
    </div>
  );
};

export default Request_Info;