import React from "react";
import { type IconType } from "react-icons";

interface ReusableStatProps {
  title: string;
  value: string | number;
  icon?: IconType;
  subText?: string;
  subIcon?: IconType;
  subTextColor?: "green" | "red" | "orange" | "gray" | "blue";
  className?: string;
}

const Reusable_Stat: React.FC<ReusableStatProps> = ({
  title,
  value,
  icon: Icon,
  subText,
  subIcon: SubIcon,
  subTextColor = "green",
  className = "",
}) => {
  const badgeStyles = {
    green: "bg-emerald-50 text-emerald-700 border-emerald-100",
    red: "bg-rose-50 text-rose-700 border-rose-100",
    orange: "bg-amber-50 text-amber-700 border-amber-100",
    gray: "bg-slate-50 text-slate-600 border-slate-200",
    blue: "bg-[#003D8C]/10 text-[#003D8C] border-[#003D8C]/20",
  };

  return (
    <div
      className={`
        relative bg-white border border-slate-200/60 rounded-[24px] 
        p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] 
        hover:shadow-[0_8px_30px_rgb(0,61,140,0.08)] hover:border-[#003D8C]/30
        hover:-translate-y-1 transition-all duration-300 ease-out flex flex-col
        overflow-hidden group cursor-pointer
        ${className}
      `}
    >
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br from-[#003D8C]/10 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 ease-in-out pointer-events-none" />
      <div className="flex justify-between items-start relative z-10">
        <div className="flex flex-col">
          <h3 className="text-slate-500 text-sm font-semibold tracking-wide uppercase mt-1">
            {title}
          </h3>
          
          <p className="text-slate-800 font-bold text-2xl mt-2 tracking-tight group-hover:text-[#003D8C] transition-colors duration-300">
            {value}
          </p>
        </div>

        {Icon && (
          <div className="p-2 bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-100 rounded-[18px] shadow-sm text-[#003D8C]  transition-all duration-300">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {subText && (
        <div className="mt-5 flex items-center relative z-10">
          <div 
            className={`
              inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full 
              text-xs font-bold border transition-colors duration-300
              ${badgeStyles[subTextColor]}
            `}
          >
            {SubIcon && <SubIcon className="w-3.5 h-3.5" />}
            {subText}
          </div>
        </div>
      )}
    </div>
  );
};

export default Reusable_Stat;