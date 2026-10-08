import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface Comment {
  id: number;
  ticketId: number;
  authorId: number;
  authorName: string;
  authorInitials: string;
  body: string;
  createdAt: string;
}

export interface LiveNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  ticketId?: number;
  createdAt: string;
  read: boolean;
  source?: "EXECUTIVE" | "USER" | "ADMIN";
}

interface State {
  commentsByTicket: Record<number, Comment[]>;
  notifications: LiveNotification[];
  connected: boolean;
}

const initialState: State = {
  commentsByTicket: {},
  notifications: [],
  connected: false,
};

const slice = createSlice({
  name: "socket",
  initialState,
  reducers: {
    setConnected(state, action: PayloadAction<boolean>) {
      state.connected = action.payload;
    },

    receiveComment(state, action: PayloadAction<Comment>) {
      const c = action.payload;
      const list = state.commentsByTicket[c.ticketId] ?? [];
      if (!list.find((x) => x.id === c.id)) {
        state.commentsByTicket[c.ticketId] = [...list, c];
      }
    },

    setComments(
      state,
      action: PayloadAction<{ ticketId: number; comments: Comment[] }>
    ) {
      state.commentsByTicket[action.payload.ticketId] = action.payload.comments;
    },

    pushNotification(
      state,
      action: PayloadAction<
        Omit<LiveNotification, "id" | "createdAt" | "read"> & {
          id?: string;
          createdAt?: string;
        }
      >
    ) {
      const { id, createdAt, ...rest } = action.payload;

      const finalId = id ?? crypto.randomUUID();

      if (state.notifications.some((n) => n.id === finalId)) return;

      state.notifications.unshift({
        ...rest,
        id: finalId,
        createdAt: createdAt ?? new Date().toISOString(),
        read: false,
      });

      if (state.notifications.length > 50) {
        state.notifications.length = 50;
      }
    },

    markAllRead(state) {
      state.notifications.forEach((n) => (n.read = true));
    },

    markRead(state, action: PayloadAction<string>) {
      const n = state.notifications.find((x) => x.id === action.payload);
      if (n) n.read = true;
    },

    clearNotifications(state) {
      state.notifications = [];
    },
  },
});

export const {
  setConnected,
  receiveComment,
  setComments,
  pushNotification,
  markAllRead,
  markRead,
  clearNotifications,
} = slice.actions;

export default slice.reducer;