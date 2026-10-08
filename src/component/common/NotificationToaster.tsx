import { useEffect } from "react";
import { FiBell, FiX } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";

import type { AppDispatch, RootState } from "../../store/store/Store";
import { markAllRead } from "../../store/user/slice/socketSlice";

const NotificationToaster = () => {
  const dispatch = useDispatch<AppDispatch>();
  const list = useSelector((s: RootState) => s.socket.notifications);

  useEffect(() => {
    if (list.length === 0) return;
    const t = setTimeout(() => dispatch(markAllRead()), 6000);
    return () => clearTimeout(t);
  }, [list.length, dispatch]);

  const visible = list.filter((n) => !n.read).slice(0, 3);
  if (visible.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[10000] flex flex-col gap-2 max-w-sm">
      {visible.map((n) => (
        <div
          key={n.id}
          className="bg-white border border-gray-200 shadow-lg rounded-xl px-4 py-3 flex gap-3 animate-in slide-in-from-right"
        >
          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
            <FiBell className="text-blue-600" size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">
              {n.title}
            </p>
            <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
              {n.message}
            </p>
          </div>
          <button
            onClick={() => dispatch(markAllRead())}
            className="text-gray-400 hover:text-gray-600 shrink-0"
          >
            <FiX size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationToaster;