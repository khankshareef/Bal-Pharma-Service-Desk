import { FiArrowLeft, FiHome } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import bal_pharma_limited_logo from "../../../assets/bal_pharma_limited_logo.jpg";
import Reusable_Button from "../../button/Reusable_Button";

const PageNotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 font-sans p-6">
      <div className="w-full max-w-full rounded-3xl p-8 sm:p-10 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 overflow-hidden p-1 mb-6">
          <img
            src={bal_pharma_limited_logo}
            alt="Bal Pharma Limited"
            className="w-full h-full object-contain"
          />
        </div>

        <h2 className="text-lg font-semibold text-slate-700 tracking-tight mb-1">
          Bal Pharma Limited
        </h2>
        <p className="text-xs text-slate-400 font-medium mb-8">
          Service Desk
        </p>

        <div className="mb-6">
          <h1 className="text-7xl sm:text-8xl font-extrabold text-[#003D8C] tracking-tight leading-none">
            404
          </h1>
          <p className="mt-4 text-xl font-bold text-slate-800">
            Page Not Found
          </p>
          <p className="mt-2 text-sm text-slate-500 leading-relaxed">
            The page you are looking for doesn't exist or may have been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Reusable_Button
            variant="secondary"
            leftIcon={<FiArrowLeft size={16} />}
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto"
          >
            Go Back
          </Reusable_Button>

          <Reusable_Button
            variant="primary"
            leftIcon={<FiHome size={16} />}
            onClick={() => navigate("/login")}
            className="w-full sm:w-auto bg-[#003D8C] hover:bg-[#002f6c] text-white"
          >
            Back to Login
          </Reusable_Button>
        </div>

        <p className="mt-8 text-xs font-medium text-slate-400">
          © {new Date().getFullYear()} Bal Pharma Limited. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default PageNotFound;