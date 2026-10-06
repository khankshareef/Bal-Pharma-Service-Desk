import type { IconType } from "react-icons";
import {
  FiCheckSquare,
  FiGlobe,
  FiHelpCircle,
  FiKey,
  FiMessageSquare,
  FiMonitor,
  FiSearch,
  FiTool,
} from "react-icons/fi";

const iconMap: Record<string, IconType> = {
  tool: FiTool,
  globe: FiGlobe,
  monitor: FiMonitor,
  key: FiKey,
  search: FiSearch,
  check: FiCheckSquare,
  message: FiMessageSquare,
  help: FiHelpCircle,
};

const colorMap: Record<string, string> = {
  gray: "text-gray-400",
  blue: "text-blue-400",
  cyan: "text-cyan-500",
  yellow: "text-yellow-500",
  purple: "text-purple-400",
  green: "text-green-500",
  red: "text-red-400",
};

interface Props {
  icon: string;
  color: string;
  label: string;
  onClick?: () => void;
}

const TemplateChip = ({ icon, color, label, onClick }: Props) => {
  const Icon = iconMap[icon] ?? FiTool;
  const cls = colorMap[color] ?? "text-gray-400";

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm hover:bg-gray-50 text-gray-700 cursor-pointer"
    >
      <Icon className={cls} size={14} /> {label}
    </button>
  );
};

export default TemplateChip;