import { useEffect, useRef, useState, type ReactNode } from "react";
import { useDispatch, useSelector } from "react-redux";

import Notification_Sound from "../../../assets/Notification_Sound.wav";
import { connectSocket, disconnectSocket } from "../../../service/socket";
import type { AppDispatch, RootState } from "../../../store/store/Store";
import { logout, meApi } from "../../../store/user/slice/Login_Slice";
import {
  clearNotifications as clearUserNotifications,
  fetchNotifications,
} from "../../../store/user/slice/NotificationSlice";
import {
  receiveComment,
  type Comment,
} from "../../../store/user/slice/commentSlice";
import {
  pushNotification,
  setConnected,
} from "../../../store/user/slice/socketSlice";
import Loader from "../../loader/Loader";
import NotificationToaster from "../NotificationToaster";

let audioEl: HTMLAudioElement | null = null;
let audioUnlocked = false;

const ensureAudio = () => {
  if (audioEl) return audioEl;
  try {
    audioEl = new Audio(Notification_Sound);
    audioEl.preload = "auto";
    audioEl.volume = 0.8;
  } catch {
    audioEl = null;
  }
  return audioEl;
};

const tryUnlockAudio = () => {
  const a = ensureAudio();
  if (!a) return;
  if (audioUnlocked) return;

  a.muted = true;
  a.currentTime = 0;
  a.play()
    .then(() => {
      a.pause();
      a.currentTime = 0;
      a.muted = false;
      audioUnlocked = true;
      console.log("[sound] audio unlocked ✅");
    })
    .catch((e) => {
      a.muted = false;
      console.log("[sound] unlock failed:", e?.message);
    });
};

const playNotificationSound = () => {
  const a = ensureAudio();
  if (!a) return;

  try {
    a.currentTime = 0;
    a.muted = false;
    a.play()
      .then(() => console.log("[sound] played ✅"))
      .catch((e) => console.log("[sound] play blocked:", e?.message));
  } catch (e) {
    console.log("[sound] play threw:", e);
  }
};

const AuthBootstrap = ({ children }: { children: ReactNode }) => {
  const dispatch = useDispatch<AppDispatch>();

  const token = useSelector((s: RootState) => s.auth.token);
  const user = useSelector((s: RootState) => s.auth.user);
  const employeeId = useSelector(
    (s: RootState) => s.auth.user?.employeeId ?? ""
  );

  const [authReady, setAuthReady] = useState(() => !token);
  const [restoreAttempt, setRestoreAttempt] = useState(0);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const restoreStartedFor = useRef<string | null>(null);

  const currentUserIdRef = useRef<number | null>(null);
  useEffect(() => {
    currentUserIdRef.current = user?.userId ?? null;
  }, [user]);

  useEffect(() => {
    const unlock = () => {
      tryUnlockAudio();
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("touchstart", unlock);
      window.removeEventListener("click", unlock);
    };

    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);
    window.addEventListener("touchstart", unlock);
    window.addEventListener("click", unlock);

    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("touchstart", unlock);
      window.removeEventListener("click", unlock);
    };
  }, []);

  useEffect(() => {
    if (!token) {
      restoreStartedFor.current = null;
      setAuthReady(true);
      setRestoreError(null);
      return;
    }
    if (user) {
      restoreStartedFor.current = null;
      setAuthReady(true);
      setRestoreError(null);
      return;
    }

    setAuthReady(false);
    if (restoreStartedFor.current === token) return;

    restoreStartedFor.current = token;
    setRestoreError(null);
    dispatch(meApi())
      .unwrap()
      .then(() => setAuthReady(true))
      .catch((error: { message?: string }) => {
        if (!sessionStorage.getItem("accessToken")) {
          dispatch(logout());
          return;
        }
        restoreStartedFor.current = null;
        setRestoreError(
          error.message || "Unable to restore your session. Please retry."
        );
      });
  }, [token, user, dispatch, restoreAttempt]);

  useEffect(() => {
    if (!token) {
      disconnectSocket();
      dispatch(setConnected(false));
      dispatch(clearUserNotifications());
      return;
    }

    const sock = connectSocket(token);

    const onConnect = () => dispatch(setConnected(true));
    const onDisconnect = () => dispatch(setConnected(false));

    const onComment = (payload: any) => {
      const raw = payload?.comment ?? payload;
      const ticketId = Number(
        payload?.ticketId ??
          payload?.ticket_id ??
          raw?.ticketId ??
          raw?.ticket_id
      );
      if (!Number.isFinite(ticketId) || !raw?.id) return;

      const comment: Comment = {
        id: raw.id,
        ticketId,
        authorId: raw.authorId,
        authorName: raw.authorName,
        authorInitials: raw.authorInitials ?? "?",
        body: raw.body,
        createdAt: raw.createdAt,
      };

      dispatch(receiveComment(comment));
      if (comment.authorId === currentUserIdRef.current) return;

      const preview =
        comment.body.length > 90
          ? `${comment.body.slice(0, 90)}…`
          : comment.body;

      dispatch(
        pushNotification({
          id: `comment-${comment.id}`,
          title: "New message",
          message: `${comment.authorName}: ${preview}`,
          type: "COMMENT",
          source: (raw.authorRole ?? "USER") as
            | "EXECUTIVE"
            | "USER"
            | "ADMIN",
          ticketId,
        })
      );

      playNotificationSound();
    };

    const onNotification = (n: any) => {
      dispatch(
        pushNotification({
          id: n.id ?? undefined,
          title: n.title ?? "Notification",
          message: n.message ?? "",
          type: n.type ?? "INFO",
          ticketId: n.ticketId ?? null,
          source: n.source,
        })
      );

      playNotificationSound();
    };

    sock.on("connect", onConnect);
    sock.on("disconnect", onDisconnect);
    sock.on("ticket:comment", onComment);
    sock.on("notification", onNotification);

    if (sock.connected) onConnect();

    return () => {
      sock.off("connect", onConnect);
      sock.off("disconnect", onDisconnect);
      sock.off("ticket:comment", onComment);
      sock.off("notification", onNotification);
    };
  }, [token, dispatch]);

  useEffect(() => {
    if (token && employeeId) {
      dispatch(fetchNotifications(employeeId));
    }
  }, [token, employeeId, dispatch]);

  if (!authReady) {
    if (restoreError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
          <p className="text-gray-700">{restoreError}</p>
          <button
            type="button"
            className="rounded-lg bg-[#003D8C] px-4 py-2 font-medium text-white hover:bg-[#002f6c]"
            onClick={() => {
              restoreStartedFor.current = null;
              setRestoreError(null);
              setRestoreAttempt((attempt) => attempt + 1);
            }}
          >
            Retry
          </button>
        </div>
      );
    }
    return <Loader />;
  }

  return (
    <>
      {children}
      <NotificationToaster />
    </>
  );
};

export default AuthBootstrap;