import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import api from "../../../service/reusable_service/api";

export type NotificationType = "INFO" | "WARNING" | "SUCCESS" | "ERROR";

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: NotificationType;
  action?: string;
  isRead: boolean;
  createdAt: string;
  ticketId?: number | null;
  ticketCode?: string | null;
  ticketStatus?: string | null;
}

interface NotificationState {
  items: Notification[];
  unreadCount: number;
  loading: boolean;
  loadingEmployeeId: string | null;
  loadedEmployeeId: string | null;
  nextLiveId: number;
  error: any;
}

interface LiveNotificationPayload {
  title: string;
  message: string;
  type: string;
  ticketId?: number | null;
  createdAt?: string;
}

const initialState: NotificationState = {
  items: [],
  unreadCount: 0,
  loading: false,
  loadingEmployeeId: null,
  loadedEmployeeId: null,
  nextLiveId: 0,
  error: null,
};

export const fetchNotifications = createAsyncThunk<
  Notification[],
  string,
  { rejectValue: any; state: { notifications: NotificationState } }
>("notifications/fetchAll", async (employeeId, { rejectWithValue }) => {
  try {
    const res = await api.get<Notification[]>(
      `/notifications/user/${encodeURIComponent(employeeId)}`
    );
    return res.data;
  } catch (e: any) {
    return rejectWithValue(e.response?.data ?? e.message);
  }
}, {
  condition: (employeeId, { getState }) => {
    const state = getState().notifications;
    return (
      state.loadedEmployeeId !== employeeId &&
      !(state.loading && state.loadingEmployeeId === employeeId)
    );
  },
});

export const fetchUnreadCount = createAsyncThunk<
  number,
  string,
  { rejectValue: any }
>("notifications/unreadCount", async (employeeId, { rejectWithValue }) => {
  try {
    const res = await api.get<{ count: number }>(
      `/notifications/user/${encodeURIComponent(employeeId)}/unread-count`
    );
    return res.data.count;
  } catch (e: any) {
    return rejectWithValue(e.response?.data ?? e.message);
  }
});

export const markNotificationRead = createAsyncThunk<
  number,
  { id: number; employeeId: string },
  { rejectValue: any }
>("notifications/markRead", async ({ id, employeeId }, { rejectWithValue }) => {
  try {
    await api.patch(
      `/notifications/${id}/read?employeeId=${encodeURIComponent(employeeId)}`
    );
    return id;
  } catch (e: any) {
    return rejectWithValue(e.response?.data ?? e.message);
  }
});

export const markAllNotificationsRead = createAsyncThunk<
  void,
  string,
  { rejectValue: any }
>("notifications/markAllRead", async (employeeId, { rejectWithValue }) => {
  try {
    await api.patch(
      `/notifications/user/${encodeURIComponent(employeeId)}/read-all`
    );
  } catch (e: any) {
    return rejectWithValue(e.response?.data ?? e.message);
  }
});

export const deleteNotification = createAsyncThunk<
  number,
  number,
  { rejectValue: any }
>("notifications/delete", async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/notifications/${id}`);
    return id;
  } catch (e: any) {
    return rejectWithValue(e.response?.data ?? e.message);
  }
});

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    addLiveNotification: (
      state,
      action: PayloadAction<LiveNotificationPayload>
    ) => {
      const incoming = action.payload;
      const exists = state.items.some(
        (item) =>
          item.title === incoming.title &&
          item.message === incoming.message &&
          (item.ticketId ?? null) === (incoming.ticketId ?? null)
      );
      if (exists) return;

      let type: NotificationType;
      switch (incoming.type) {
        case "WARNING":
        case "SUCCESS":
        case "ERROR":
          type = incoming.type;
          break;
        default:
          type = "INFO";
      }

      state.nextLiveId -= 1;
      state.items.unshift({
        id: state.nextLiveId,
        title: incoming.title,
        message: incoming.message,
        type,
        ticketId: incoming.ticketId ?? null,
        isRead: false,
        createdAt: incoming.createdAt ?? new Date().toISOString(),
      });
      state.unreadCount += 1;
    },
    markLiveNotificationRead: (state, action: PayloadAction<number>) => {
      const notification = state.items.find(
        (item) => item.id === action.payload && item.id < 0
      );
      if (notification && !notification.isRead) {
        notification.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    clearNotifications: (state) => {
      state.items = [];
      state.unreadCount = 0;
      state.loading = false;
      state.loadingEmployeeId = null;
      state.loadedEmployeeId = null;
      state.nextLiveId = 0;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (s, a) => {
        s.loading = true;
        s.loadingEmployeeId = a.meta.arg;
        s.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (s, a) => {
        s.loading = false;
        s.loadingEmployeeId = null;
        s.loadedEmployeeId = a.meta.arg;
        const liveItems = s.items.filter(
          (item) =>
            item.id < 0 &&
            !a.payload.some(
              (notification) =>
                notification.title === item.title &&
                notification.message === item.message &&
                (notification.ticketId ?? null) === (item.ticketId ?? null)
            )
        );
        s.items = [...liveItems, ...a.payload];
        s.unreadCount = s.items.filter((notification) => !notification.isRead).length;
      })
      .addCase(fetchNotifications.rejected, (s, a: any) => {
        s.loading = false;
        s.loadingEmployeeId = null;
        s.error = a.payload;
      })
      .addCase(fetchUnreadCount.fulfilled, (s, a) => {
        s.unreadCount = a.payload;
      })
      .addCase(markNotificationRead.fulfilled, (s, a) => {
        const n = s.items.find((x) => x.id === a.payload);
        if (n && !n.isRead) {
          n.isRead = true;
          s.unreadCount = Math.max(0, s.unreadCount - 1);
        }
      })
      .addCase(markAllNotificationsRead.fulfilled, (s) => {
        s.items = s.items.map((n) => ({ ...n, isRead: true }));
        s.unreadCount = 0;
      })
      .addCase(deleteNotification.fulfilled, (s, a) => {
        const n = s.items.find((x) => x.id === a.payload);
        if (n && !n.isRead) s.unreadCount = Math.max(0, s.unreadCount - 1);
        s.items = s.items.filter((x) => x.id !== a.payload);
      });
  },
});

export const {
  addLiveNotification,
  markLiveNotificationRead,
  clearNotifications,
} = notificationSlice.actions;
export default notificationSlice.reducer;