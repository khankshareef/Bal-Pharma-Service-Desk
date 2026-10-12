import { useEffect, useMemo, useState } from "react";
import { FiBell, FiX } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import type { AppDispatch, RootState } from "../../store/store/Store";
import {
  markAllRead,
  markRead,
} from "../../store/user/slice/socketSlice";

const AUTO_HIDE_MS = 6000;
const MAX_VISIBLE = 3;

interface LiveNotif {
  id: string;
  type: string;
  title: string;
  message: string;
  ticketId?: number | null;
  createdAt: string;
  read: boolean;
  source?: string;
}

const NotificationToaster = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const user = useSelector(
    (s: any) => s.auth?.user ?? s.loginRoute?.user
  );

  const list = useSelector(
    (s: RootState) => (s.socket?.notifications ?? []) as LiveNotif[]
  );

  const [hidden, setHidden] = useState<Record<string, true>>({});
  const [timedOut, setTimedOut] = useState<Record<string, true>>({});

  useEffect(() => {
    const timers: number[] = [];
    list.forEach((n) => {
      const key = String(n.id);
      if (timedOut[key]) return;
      const t = window.setTimeout(() => {
        setTimedOut((prev) => (prev[key] ? prev : { ...prev, [key]: true }));
      }, AUTO_HIDE_MS);
      timers.push(t);
    });
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [list, timedOut]);

  const visible = useMemo(() => {
    const seen = new Set<string>();
    const out: LiveNotif[] = [];
    for (const n of list) {
      if (n.read) continue;
      if (hidden[String(n.id)]) continue;
      if (timedOut[String(n.id)]) continue;
      const key = `${n.ticketId ?? "-"}|${n.title ?? ""}|${n.message ?? ""}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(n);
      if (out.length >= MAX_VISIBLE) break;
    }
    return out;
  }, [list, hidden, timedOut]);

  if (visible.length === 0) return null;

  const goToTicket = (ticketId?: number | null) => {
    if (!ticketId) return;
    const role = user?.activeRole ?? "";
    if (role === "EMPLOYEE") {
      navigate(`/employee/my-tickets/tkt-details/${ticketId}`);
    } else if (role === "EXECUTIVE" || role === "DEPUTY_MANAGER") {
      navigate(`/executive/assigned/assigned-details/${ticketId}`);
    } else {
      navigate(`/super-manager/all-tickets/${ticketId}`);
    }
  };

  const handleOpen = (n: LiveNotif) => {
    dispatch(markRead(String(n.id)));   
    setHidden((prev) => ({ ...prev, [String(n.id)]: true }));
    goToTicket(n.ticketId ?? null);
  };

  const handleDismiss = (id: string) => {
    setHidden((prev) => ({ ...prev, [id]: true }));
  };

  const handleMarkAllRead = () => {
    dispatch(markAllRead());
    const next: Record<string, true> = { ...hidden };
    list.forEach((n) => {
      next[String(n.id)] = true;
    });
    setHidden(next);
  };

  const anyUnread = list.some((n) => !n.read);

  return (
    <div className="fixed bottom-4 right-4 z-[10000] flex flex-col gap-2 max-w-sm">
      {visible.map((n) => (
        <div
          key={String(n.id)}
          onClick={() => handleOpen(n)}
          className={`bg-white border shadow-lg rounded-xl px-4 py-3 flex gap-3 cursor-pointer transition-colors ${
            n.read
              ? "border-gray-200 opacity-80"
              : "border-blue-200 hover:bg-blue-50"
          }`}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleOpen(n);
            }
          }}
        >
          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
            <FiBell className="text-blue-600" size={16} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-gray-800 truncate">
                {n.title}
              </p>
              {!n.read && (
                <span className="w-2 h-2 rounded-full bg-[#003D8C] shrink-0" />
              )}
            </div>
            <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
              {n.message}
            </p>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDismiss(String(n.id));
            }}
            className="text-gray-400 hover:text-gray-600 shrink-0 self-start"
            aria-label="Dismiss toast"
          >
            <FiX size={14} />
          </button>
        </div>
      ))}

      {anyUnread && (
        <button
          onClick={handleMarkAllRead}
          className="self-end text-[11px] text-[#003D8C] hover:underline font-medium"
        >
          Mark all read
        </button>
      )}
    </div>
  );
};

export default NotificationToaster;