import { useEffect, useState } from "react";
import { FaCheckSquare } from "react-icons/fa";
import { FiArrowLeft, FiSearch } from "react-icons/fi";
import { GoX } from "react-icons/go";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import Reusable_Button from "../../../component/button/Reusable_Button";
import Loader from "../../../component/loader/Loader";
import ReusablePopup from "../../../component/popups/Reusable_Popup";

import type { AppDispatch, RootState } from "../../../store/store/Store";
import {
  fetchReopenById,
  reviewReopen,
} from "../../../store/user/slice/ReopenSlice";

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

const ReOpen_Details = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const user = useSelector((s: any) => s.auth?.user ?? s.loginRoute?.user);
  const reviewerId = user?.employeeId ?? "";

  const { current, loading, saving } = useSelector((s: RootState) => s.reopens);
  const [comments, setComments] = useState("");
  const [popup, setPopup] = useState({
    isOpen: false,
    type: "success" as "success" | "error",
    title: "",
    message: "",
  });

  useEffect(() => {
    if (id) dispatch(fetchReopenById(Number(id)));
  }, [dispatch, id]);

  const handleReview = async (action: "APPROVE" | "REJECT") => {
    if (!current) return;
    try {
      const res = await dispatch(
        reviewReopen({
          id: current.id,
          data: { action, reviewComments: comments },
          reviewerId,
        })
      ).unwrap();

      setPopup({
        isOpen: true,
        type: "success",
        title: action === "APPROVE" ? "Reopen Approved" : "Reopen Rejected",
        message: `Reopen request for ${res.ticketCode} has been ${
          action === "APPROVE"
            ? "approved and the ticket is now IN PROGRESS"
            : "rejected"
        }.`,
      });
    } catch (err: any) {
      setPopup({
        isOpen: true,
        type: "error",
        title: "Action Failed",
        message: err?.error || err?.message || "Failed to review request.",
      });
    }
  };

  if (loading) return <Loader />;

  if (!current) {
    return (
      <div className="flex min-h-[400px] items-center justify-center text-gray-500">
        <div className="text-center">
          <p>Reopen request not found.</p>
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

  const isPending = current.status === "PENDING";
  const isApproved = current.status === "APPROVED";

  return (
    <div className="max-w-full mx-auto font-sans">
      <button
        onClick={() => window.history.back()}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 cursor-pointer"
      >
        <FiArrowLeft size={18} />
        <span className="font-medium">Back</span>
      </button>

      <div className="flex justify-between items-end mb-6">
        <h1 className="text-2xl font-bold text-[#002D5B]">
          Review Reopen Request
        </h1>
      </div>

      <div className="bg-[#FFFCEB] border border-[#FDE047] rounded-2xl p-6 shadow-sm">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900">
            {current.ticketCode}
          </h2>
          <p className="text-gray-800 text-base">{current.ticketSubject}</p>
          <p className="text-gray-700 text-sm mt-1">
            Category: {current.ticketCategory ?? "—"} · Priority:{" "}
            {current.ticketPriority ?? "—"} · Dept:{" "}
            {current.ticketDepartment ?? "—"}
          </p>
        </div>

        {/* Info grid */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6 grid grid-cols-2 gap-y-6">
          <div>
            <p className="text-xs text-gray-400 mb-1">Current Status</p>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#DCFCE7] text-[#166534]">
              {current.ticketStatus}
            </span>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Requested By</p>
            <p className="text-sm font-medium text-gray-900">
              {current.requestedByName ?? "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Request Date</p>
            <p className="text-sm font-medium text-gray-900">
              {formatDate(current.createdAt)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Request Status</p>
            <p className="text-sm font-medium text-gray-900">{current.status}</p>
          </div>
        </div>

        {/* Reason */}
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-0.5">Employee Reopen Reason</p>
          <p className="text-sm text-[#92400E]">{current.reason}</p>
        </div>

        {/* Pending — approve/reject */}
        {isPending && (
          <>
            <div className="mb-6">
              <label className="block text-sm text-gray-500 mb-2">
                Executive Comments
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="w-full border border-gray-200 rounded-xl p-4 text-sm min-h-[100px] bg-white"
                placeholder="Enter review comments..."
              />
            </div>

            <div className="flex items-center gap-3 mb-6">
              <Reusable_Button
                children="Cancel"
                variant="secondary"
                onClick={() => window.history.back()}
                disabled={saving}
              />
              <Reusable_Button
                onClick={() => handleReview("APPROVE")}
                children="Approve"
                leftIcon={<FaCheckSquare />}
                disabled={saving}
                className="bg-[#166534] hover:bg-[#14532d] text-white"
              />
              <Reusable_Button
                onClick={() => handleReview("REJECT")}
                children="Reject"
                leftIcon={<GoX />}
                disabled={saving}
                className="bg-[#991B1B] hover:bg-[#7f1d1d] text-white"
              />
            </div>
          </>
        )}

        {/* Already reviewed */}
        {!isPending && (
          <div className="mb-6 space-y-3">
            <p className="text-sm text-gray-600">
              Reviewed: <strong>{current.status}</strong>
            </p>
            {current.reviewComments && (
              <p className="text-sm text-gray-700">
                <strong>Comments:</strong> {current.reviewComments}
              </p>
            )}

            {/* Approved → continue to investigation */}
            {isApproved && (
              <div className="pt-4">
                <Reusable_Button
                  onClick={() =>
                    navigate(`../investigation/${current.ticketId}`)
                  }
                  children="Continue to Investigation"
                  leftIcon={<FiSearch />}
                  variant="primary"
                  className="bg-[#1f3f5e] hover:bg-[#16304a] text-white"
                />
              </div>
            )}
          </div>
        )}
      </div>

      <ReusablePopup
        isOpen={popup.isOpen}
        onClose={() => setPopup((p) => ({ ...p, isOpen: false }))}
        onConfirm={() => {
          setPopup((p) => ({ ...p, isOpen: false }));
          if (popup.type === "success" && current?.status === "APPROVED") {
            navigate(`../investigation/${current.ticketId}`);
          }
        }}
        type={popup.type}
        title={popup.title}
        message={popup.message}
        confirmText={popup.type === "success" ? "Investigate" : "OK"}
      />
    </div>
  );
};

export default ReOpen_Details;