import React from "react";
import bal_pharma_limited_logo from "../../assets/bal_pharma_limited_logo.jpg";

interface LoaderProps {
  text?: string;
}

const Loader: React.FC<LoaderProps> = ({ text = "Processing..." }) => {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/20 backdrop-blur-[2px] transition-all duration-300">
      <div className="bg-white px-8 py-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 flex flex-col items-center gap-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="relative flex items-center justify-center w-16 h-16">
          <div className="absolute inset-0 border-[3px] border-slate-100 rounded-full" />
          <div className="absolute inset-0 border-[3px] border-[#003D8C] rounded-full border-t-transparent animate-spin" />
          <div className="absolute inset-1.5 bg-white rounded-full flex items-center justify-center overflow-hidden z-10 shadow-sm">
            <img 
              src={bal_pharma_limited_logo} 
              alt="Loading" 
              className="w-[85%] h-[85%] object-contain" 
            />
          </div>
        </div>
        <p className="text-sm font-bold text-slate-600 tracking-wide flex items-center gap-1">
          {text}
          <span className="flex gap-0.5">
            <span className="animate-bounce delay-75">.</span>
            <span className="animate-bounce delay-150">.</span>
            <span className="animate-bounce delay-300">.</span>
          </span>
        </p>

      </div>
    </div>
  );
};

export default Loader;