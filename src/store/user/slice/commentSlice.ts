import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import api from "../../../service/reusable_service/api";

export interface Comment {
  id: number;
  ticketId: number;
  authorId: number;
  authorName: string;
  authorInitials: string;
  body: string;
  createdAt: string;
}

interface CommentState {
  byTicket: Record<number, Comment[]>;
  loadingByTicket: Record<number, boolean>;
  savingByTicket: Record<number, boolean>;
  errorByTicket: Record<number, string | null>;
}

const initialState: CommentState = {
  byTicket: {},
  loadingByTicket: {},
  savingByTicket: {},
  errorByTicket: {},
};

export const fetchComments = createAsyncThunk<
  { ticketId: number; comments: Comment[] },
  number,
  { rejectValue: any }
>("comments/fetch", async (ticketId, { rejectWithValue }) => {
  try {
    const res = await api.get<Comment[]>(`/tickets/${ticketId}/comments`);
    return { ticketId, comments: Array.isArray(res.data) ? res.data : [] };
  } catch (e: any) {
    return rejectWithValue(e.response?.data ?? e.message);
  }
});

export const addComment = createAsyncThunk<
  Comment,
  { ticketId: number; body: string },
  { rejectValue: any }
>("comments/add", async ({ ticketId, body }, { rejectWithValue }) => {
  try {
    const res = await api.post<Comment>(`/tickets/${ticketId}/comments`, {
      body,
    });
    return res.data;
  } catch (e: any) {
    return rejectWithValue(e.response?.data ?? e.message);
  }
});

const commentSlice = createSlice({
  name: "comments",
  initialState,
  reducers: {
    receiveComment(state, action: PayloadAction<any>) {
      const payload = action.payload;

      const raw = payload?.comment ?? payload;
      const ticketId = Number(
        payload?.ticketId ??
          payload?.ticket_id ??
          raw?.ticketId ??
          raw?.ticket_id
      );

      if (!Number.isFinite(ticketId) || !raw?.id) {
        console.warn("[comments] receiveComment skipped bad payload:", payload);
        return;
      }

      const c: Comment = {
        id: raw.id,
        ticketId,
        authorId: raw.authorId,
        authorName: raw.authorName,
        authorInitials: raw.authorInitials ?? "?",
        body: raw.body,
        createdAt: raw.createdAt,
      };

      const list = state.byTicket[ticketId] ?? [];
      if (!list.find((x) => x.id === c.id)) {
        state.byTicket[ticketId] = [...list, c];
      }
    },

    setComments(
      state,
      action: PayloadAction<{ ticketId: number; comments: Comment[] }>
    ) {
      state.byTicket[action.payload.ticketId] = action.payload.comments;
    },

    clearCommentsFor(state, action: PayloadAction<number>) {
      delete state.byTicket[action.payload];
      delete state.loadingByTicket[action.payload];
      delete state.savingByTicket[action.payload];
      delete state.errorByTicket[action.payload];
    },

    clearCommentsError(state, action: PayloadAction<number>) {
      state.errorByTicket[action.payload] = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchComments.pending, (state, action) => {
        state.loadingByTicket[action.meta.arg] = true;
        state.errorByTicket[action.meta.arg] = null;
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        const { ticketId, comments } = action.payload;
        state.loadingByTicket[ticketId] = false;
        state.byTicket[ticketId] = comments;
      })
      .addCase(fetchComments.rejected, (state, action: any) => {
        const ticketId = action.meta.arg;
        state.loadingByTicket[ticketId] = false;
        state.errorByTicket[ticketId] =
          action.payload?.error ||
          action.payload?.message ||
          "Failed to load comments";
      })

      .addCase(addComment.pending, (state, action) => {
        const { ticketId } = action.meta.arg;
        state.savingByTicket[ticketId] = true;
        state.errorByTicket[ticketId] = null;
      })
      .addCase(addComment.fulfilled, (state, action) => {
        const c = action.payload;
        state.savingByTicket[c.ticketId] = false;

        const list = state.byTicket[c.ticketId] ?? [];
        if (!list.find((x) => x.id === c.id)) {
          state.byTicket[c.ticketId] = [...list, c];
        }
      })
      .addCase(addComment.rejected, (state, action: any) => {
        const { ticketId } = action.meta.arg;
        state.savingByTicket[ticketId] = false;
        state.errorByTicket[ticketId] =
          action.payload?.error ||
          action.payload?.message ||
          "Failed to send comment";
      });
  },
});

export const {
  receiveComment,
  setComments,
  clearCommentsFor,
  clearCommentsError,
} = commentSlice.actions;

export default commentSlice.reducer;