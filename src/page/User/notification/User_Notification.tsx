import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import Reusable_Button from "../../../component/button/Reusable_Button";
import Loader from "../../../component/loader/Loader";

import type { AppDispatch, RootState } from "../../../store/store/Store";
import {
  markAllNotificationsRead,
  markLiveNotificationRead,
  markNotificationRead,
  type Notification as NotificationType,
} from "../../../store/user/slice/NotificationSlice";

const iconFor = (type: NotificationType["type"]) => {
  switch (type) {
    case "WARNING": return "⚠️";
    case "SUCCESS": return "✅";
    case "ERROR":   return "❌";
    default:        return "ℹ️";
  }
};

const User_Notification = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const user = useSelector((s: any) => s.auth?.user ?? s.loginRoute?.user);
  const employeeId = user?.employeeId ?? "";

  const {
    items: dbNotifications,
    unreadCount,
    loading,
  } = useSelector((s: RootState) => s.notifications);

  const liveNotifications = useSelector(
    (s: RootState) => s.socket?.notifications ?? []
  );

  const [localLoading, setLocalLoading] = useState(false);

  const notifications: NotificationType[] = useMemo(() => {
    const list: NotificationType[] = [...dbNotifications];
    liveNotifications.forEach((n) => {
      const exists = list.some(
        (d) =>
          d.title === n.title &&
          d.message === n.message &&
          (d.ticketId ?? null) === (n.ticketId ?? null)
      );
      if (!exists) {
        list.unshift({
          id: -Math.abs(hashCode(n.id)),
          title: n.title,
          message: n.message,
          type: "INFO",
          ticketId: n.ticketId ?? null,
          ticketCode: null,
          isRead: false,
          createdAt: n.createdAt,
        });
      }
    });

    return list;
  }, [dbNotifications, liveNotifications]);

  const handleMarkAsRead = async (id: number) => {
    if (!employeeId) return;
    if (id < 0) {
      dispatch(markLiveNotificationRead(id));
      return;
    }
    try {
      setLocalLoading(true);
      await dispatch(markNotificationRead({ id, employeeId })).unwrap();
    } catch {
      /* ignore */
    } finally {
      setLocalLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    if (!employeeId) return;
    try {
      setLocalLoading(true);
      await dispatch(markAllNotificationsRead(employeeId)).unwrap();
    } finally {
      setLocalLoading(false);
    }
  };

  const handleClick = (notif: NotificationType) => {
    if (!notif.isRead) handleMarkAsRead(notif.id);
    const ticketId = notif.ticketId ?? null;
    if (ticketId) {
      navigate(`../my-tickets/tkt-details/${ticketId}`);
    }
  };

  if (loading && notifications.length === 0) return <Loader />;

  return (
    <div className="max-w-full mx-auto font-sans relative">
      {localLoading && (
        <div className="fixed inset-0 z-40 bg-white/60 backdrop-blur-sm flex items-center justify-center">
          <Loader />
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Notifications{" "}
          {unreadCount > 0 && (
            <span className="text-sm font-normal text-gray-500 ml-2">
              ({unreadCount} unread)
            </span>
          )}
        </h1>

        <Reusable_Button
          onClick={handleMarkAllRead}
          disabled={unreadCount === 0 || localLoading}
          children="Mark All Read"
          variant="secondary"
          className={`px-4 py-2 border rounded-full text-sm font-medium ${
            unreadCount > 0
              ? "border-gray-300 text-gray-700 hover:bg-gray-50"
              : "border-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        />
      </div>

      <div className="bg-[#F8FAFC] border border-gray-100 rounded-2xl p-6 shadow-sm">
        {notifications.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-gray-500 font-medium">No notifications yet.</p>
            <p className="text-xs text-gray-400 mt-2">
              You'll be notified when tickets are created, updated, or resolved.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`relative flex flex-col p-4 pl-5 rounded-xl transition-all border ${
                  !notif.isRead
                    ? "bg-[#F0F6FF] hover:bg-[#e4effc] border-[#003D8C]/20"
                    : "bg-white hover:bg-gray-50 border-gray-100"
                }`}
              >
                {!notif.isRead && (
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#003D8C] rounded-l-xl" />
                )}

                <div className="flex justify-between items-start">
                  <div
                    onClick={() => handleClick(notif)}
                    className="flex-1 cursor-pointer"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {!notif.isRead && (
                        <div className="w-2.5 h-2.5 bg-[#003D8C] rounded-full mr-1 shrink-0" />
                      )}
                      <span className="text-lg">{iconFor(notif.type)}</span>
                      <h2
                        className={`font-bold text-base ${
                          notif.isRead ? "text-gray-600" : "text-black"
                        }`}
                      >
                        {notif.title}
                      </h2>
                    </div>

                    <p className="text-sm text-gray-600 ml-7">
                      {notif.message}
                    </p>

                    {notif.ticketCode && (
                      <p className="text-xs text-blue-600 ml-7 mt-1 font-medium">
                        Ticket: {notif.ticketCode}
                      </p>
                    )}

                    <p className="text-sm text-gray-400 ml-7 mt-0.5">
                      {new Date(notif.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return h;
}

export default User_Notification;