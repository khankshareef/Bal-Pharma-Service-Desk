import { useEffect, useState } from "react";
import bal_pharma_limited_logo from "../../assets/bal_pharma_limited_logo.jpg";

const Preloader = () => {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("Authenticating...");

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress === 100) {
          clearInterval(timer);
          return 100;
        }
        const newProgress = Math.min(oldProgress + Math.random() * 15, 100);
        if (newProgress > 30 && newProgress < 70) {
          setLoadingText("Loading workspace...");
        } else if (newProgress >= 70) {
          setLoadingText("Preparing your dashboard...");
        }
        return newProgress;
      });
    }, 400); 

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-50 flex flex-col items-center justify-center overflow-hidden font-sans">
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#003D8C]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="relative flex items-center justify-center w-40 h-40 mb-8">
        <div className="absolute inset-0 border-[4px] border-slate-200 rounded-full" />
        <div className="absolute inset-0 border-[4px] border-[#003D8C] rounded-full border-t-transparent border-l-transparent animate-spin" />
        <div className="absolute inset-2 bg-white rounded-full shadow-sm flex items-center justify-center overflow-hidden z-10">
          <img 
            src={bal_pharma_limited_logo} 
            alt="Bal Pharma Limited" 
            className="w-24 h-24 object-contain" 
          />
        </div>
        <div className="absolute inset-[-10px] bg-[#003D8C]/10 rounded-full animate-pulse blur-sm -z-10" />
      </div>
      <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight mb-2">
        Welcome to Bal Pharma
      </h2>
      <p className="text-sm font-medium text-slate-500 mb-8 flex items-center gap-1">
        {loadingText}
        <span className="flex gap-0.5">
          <span className="animate-bounce delay-75">.</span>
          <span className="animate-bounce delay-150">.</span>
          <span className="animate-bounce delay-300">.</span>
        </span>
      </p>
      <div className="w-64 h-1.5 bg-slate-200 rounded-full overflow-hidden shadow-inner">
        <div 
          className="h-full bg-gradient-to-r from-[#003D8C] to-[#005bb5] rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default Preloader;