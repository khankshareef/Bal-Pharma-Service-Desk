import React from "react";

import bal_pharma_limited_logo from "../../assets/bal_pharma_limited_logo.jpg";

import Reusable_Button from "../button/Reusable_Button";

import {
  IoCloseCircle,
  IoCloudDone,
  IoInformationCircle,
  IoWarning,
} from "react-icons/io5";

export type PopupType = "success" | "error" | "confirm" | "info";

export interface ReusablePopupProps {
  isOpen: boolean;
  onClose: () => void;

  type?: PopupType;

  title: string;
  message: string;

  onConfirm?: () => void;

  confirmText?: string;
  cancelText?: string;
}

const ReusablePopup: React.FC<ReusablePopupProps> = ({
  isOpen,
  onClose,
  type = "info",
  title,
  message,
  onConfirm,
  confirmText = "OK",
  cancelText = "Cancel",
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case "success":
        return <IoCloudDone size={38} />;

      case "error":
        return <IoCloseCircle size={38} />;

      case "confirm":
        return <IoWarning size={38} />;

      case "info":
      default:
        return <IoInformationCircle size={38} />;
    }
  };

  const titleColors: Record<PopupType, string> = {
    success: "text-green-600",
    error: "text-red-600",
    confirm: "text-blue-800",
    info: "text-gray-800",
  };


  const iconBackground: Record<PopupType, string> = {
    success: "bg-green-100 text-green-600",
    error: "bg-red-100 text-red-600",
    confirm: "bg-blue-100 text-blue-800",
    info: "bg-gray-100 text-gray-600",
  };


  const showCancelButton =
    type === "confirm" || type === "error";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center border-b border-gray-200 bg-gray-50 px-5 py-4">
          <img
            src={bal_pharma_limited_logo}
            alt="Bal Pharma Limited"
            className="
              mr-4
              h-12
              w-12
              rounded-full
              object-cover
              border
              border-gray-200
              shadow-sm
            "
          />

          <h2
            className={`text-xl font-bold ${titleColors[type]}`}
          >
            {title}
          </h2>
        </div>
        <div className="flex flex-col items-center gap-4 p-6 text-center text-gray-700">
          <span
            className={`
              flex
              h-16
              w-16
              items-center
              justify-center
              rounded-full
              ${iconBackground[type]}
            `}
          >
            {getIcon()}
          </span>
          <p className="text-base font-medium leading-relaxed">
            {message}
          </p>
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-200 bg-gray-50 px-5 py-4">
          {showCancelButton && (
            <Reusable_Button
              type="button"
              variant="secondary"
              onClick={onClose}
            >
              {cancelText}
            </Reusable_Button>
          )}


          <Reusable_Button
            type="button"
            variant="primary"
            onClick={onConfirm ?? onClose}
          >
            {confirmText}
          </Reusable_Button>
        </div>
      </div>
    </div>
  );
};

export default ReusablePopup;