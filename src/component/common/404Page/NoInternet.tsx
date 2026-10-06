import { useEffect, useState } from "react";
import { FiRefreshCcw, FiWifiOff } from "react-icons/fi";

import bal_pharma_limited_logo from "../../../assets/bal_pharma_limited_logo.jpg";
import Reusable_Button from "../../button/Reusable_Button";

const NoInternet = () => {
  const [online, setOnline] = useState<boolean>(navigator.onLine);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);

    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  const handleRetry = () => {
    setRetrying(true);
    setTimeout(() => {
      window.location.reload();
    }, 300);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 font-sans p-6">
      <div className="w-full max-w-full rounded-3xl p-8 sm:p-10 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full overflow-hidden p-1 mb-6">
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
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-50 border border-amber-100 mb-5">
            <FiWifiOff className="text-amber-600" size={34} />
          </div>

          <p className="text-xl font-bold text-slate-800">
            No Internet Connection
          </p>
          <p className="mt-2 text-sm text-slate-500 leading-relaxed">
            {online
              ? "The server is unreachable. Please check your connection or try again."
              : "You appear to be offline. Reconnect to continue using the Service Desk."}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Reusable_Button
            variant="primary"
            leftIcon={<FiRefreshCcw size={16} />}
            onClick={handleRetry}
            disabled={retrying}
            className="w-full sm:w-auto bg-[#003D8C] hover:bg-[#002f6c] text-white"
          >
            {retrying ? "Retrying…" : "Retry"}
          </Reusable_Button>
        </div>

        <p className="mt-8 text-xs font-medium text-slate-400">
          © {new Date().getFullYear()} Bal Pharma Limited. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default NoInternet;