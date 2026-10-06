import { AnimatePresence, motion } from "framer-motion";
import { FiSend } from "react-icons/fi";
import { IoMdStar } from "react-icons/io";


import { useState } from "react";
import Reusable_Button from "../button/Reusable_Button";
import Reusable_Field from "../fields/Reusable_Field";

interface RatingModelProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { rating: number; comments: string }) => void;
}

const Rating_Model = ({ isOpen, onClose, onSubmit }: RatingModelProps) => {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comments, setComments] = useState<string>("");

  const handleSubmit = () => {
    onSubmit({ rating, comments });
    // Reset state after submitting
    setRating(0);
    setComments("");
  };

  const handleClose = () => {
    // Reset state on skip/close
    setRating(0);
    setComments("");
    onClose();
  };

  const getRatingText = () => {
    const currentRating = hoverRating || rating;
    switch (currentRating) {
      case 1: return "Terrible";
      case 2: return "Poor";
      case 3: return "Average";
      case 4: return "Good";
      case 5: return "Excellent";
      default: return "Select a rating";
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 sm:p-8"
          >
            {/* Header */}
            <div className="text-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
                How would you rate the resolution?
              </h2>
              <p className="text-slate-500 mt-2 font-medium">
                Your feedback helps us improve our service
              </p>
            </div>

            {/* Star Rating */}
            <div className="flex flex-col items-center mb-6">
              <div 
                className="flex gap-2 sm:gap-4 mb-3"
                onMouseLeave={() => setHoverRating(0)}
              >
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <IoMdStar
                      size={40}
                      strokeWidth={1.5}
                      className={`transition-colors duration-200 ${
                        star <= (hoverRating || rating)
                          ? "fill-slate-800 text-slate-800" // Filled state
                          : "fill-transparent text-slate-800" // Hollow state
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-sm font-medium text-slate-500 transition-colors">
                {getRatingText()}
              </span>
            </div>

            <div className="mb-6">
              <Reusable_Field
              label="Additional Comments"
              id="comments"
              type="textarea"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
                placeholder="Any additional feedback..."
              />
            </div>

            <div className="flex items-center justify-center gap-4">
              <Reusable_Button
              onClick={handleClose}
              children = "Skip"
              variant="secondary"
              />
              
              <Reusable_Button
              onClick={handleSubmit}
                disabled={rating === 0}
              children = "Submit Feedback"
              variant="primary"
              leftIcon = {<FiSend size={16} className={rating > 0 ? "text-white" : "text-white"} />}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-medium transition-all shadow-sm
                  ${rating > 0 
                    ? "bg-[#164468] hover:bg-[#0f324d] text-white" 
                    : "bg-slate-300 text-slate-500 cursor-not-allowed"
                  }
                `}
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Rating_Model;