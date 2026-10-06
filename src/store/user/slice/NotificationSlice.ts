import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../../service/reusable_service/api";

export type NotificationType = "INFO" | "WARNING" | "SUCCESS" | "ERROR";

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: NotificationType;
  action: string;
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
  error: any;
}

const initialState: NotificationState = {
  items: [],
  unreadCount: 0,
  loading: false,
  error: null,
};

export const fetchNotifications = createAsyncThunk<
  Notification[],
  string,
  { rejectValue: any }
>("notifications/fetchAll", async (employeeId, { rejectWithValue }) => {
  try {
    const res = await api.get<Notification[]>(
      `/notifications/user/${encodeURIComponent(employeeId)}`
    );
    return res.data;
  } catch (e: any) {
    return rejectWithValue(e.response?.data ?? e.message);
  }
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
    clearNotifications: (state) => {
      state.items = [];
      state.unreadCount = 0;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (s, a) => {
        s.loading = false;
        s.items = a.payload;
        s.unreadCount = a.payload.filter((n) => !n.isRead).length;
      })
      .addCase(fetchNotifications.rejected, (s, a: any) => {
        s.loading = false;
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

export const { clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;