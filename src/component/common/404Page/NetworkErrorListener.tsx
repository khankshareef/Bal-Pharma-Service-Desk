import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const NetworkErrorListener = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handler = () => navigate("/no-internet", { replace: true });

    window.addEventListener("network-error", handler);
    return () => window.removeEventListener("network-error", handler);
  }, [navigate]);

  return null;
};

export default NetworkErrorListener;