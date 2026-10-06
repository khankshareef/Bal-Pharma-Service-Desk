import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../../service/reusable_service/api";

export interface Reopen {
  id: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  ticketId: number;
  ticketCode: string;
  ticketSubject: string;
  ticketStatus: string;
  ticketPriority: string;
  ticketCategory?: string;
  ticketDepartment?: string;
  requestedById?: number;
  requestedByName?: string;
  requestedByEmployeeId?: string;
  reason: string;
  reviewedById?: number;
  reviewedByName?: string;
  reviewComments?: string;
  reviewedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateReopenPayload {
  ticketId: number;
  reason: string;
}

export interface ReviewReopenPayload {
  action: "APPROVE" | "REJECT";
  reviewComments?: string;
}

interface ReopenState {
  reopens: Reopen[];
  pending: Reopen[];
  current: Reopen | null;
  loading: boolean;
  saving: boolean;
  error: any;
}

const initialState: ReopenState = {
  reopens: [],
  pending: [],
  current: null,
  loading: false,
  saving: false,
  error: null,
};


export const requestReopen = createAsyncThunk<
  Reopen,
  { data: CreateReopenPayload; employeeId: string },
  { rejectValue: any }
>("reopens/request", async ({ data, employeeId }, { rejectWithValue }) => {
  try {
    const res = await api.post<Reopen>(
      `/reopens?employeeId=${encodeURIComponent(employeeId)}`,
      data
    );
    return res.data;
  } catch (e: any) {
    return rejectWithValue(e.response?.data ?? e.message);
  }
});

export const fetchReopens = createAsyncThunk<Reopen[], void, { rejectValue: any }>(
  "reopens/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get<Reopen[]>("/reopens");
      return res.data;
    } catch (e: any) {
      return rejectWithValue(e.response?.data ?? e.message);
    }
  }
);

export const fetchPendingReopens = createAsyncThunk<Reopen[], void, { rejectValue: any }>(
  "reopens/fetchPending",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get<Reopen[]>("/reopens/pending");
      return res.data;
    } catch (e: any) {
      return rejectWithValue(e.response?.data ?? e.message);
    }
  }
);

export const fetchReopenById = createAsyncThunk<Reopen, number, { rejectValue: any }>(
  "reopens/fetchOne",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get<Reopen>(`/reopens/${id}`);
      return res.data;
    } catch (e: any) {
      return rejectWithValue(e.response?.data ?? e.message);
    }
  }
);

export const reviewReopen = createAsyncThunk<
  Reopen,
  { id: number; data: ReviewReopenPayload; reviewerId: string },
  { rejectValue: any }
>("reopens/review", async ({ id, data, reviewerId }, { rejectWithValue }) => {
  try {
    const res = await api.patch<Reopen>(
      `/reopens/${id}/review?reviewerId=${encodeURIComponent(reviewerId)}`,
      data
    );
    return res.data;
  } catch (e: any) {
    return rejectWithValue(e.response?.data ?? e.message);
  }
});


const reopenSlice = createSlice({
  name: "reopens",
  initialState,
  reducers: {
    clearReopenError: (s) => {
      s.error = null;
    },
    clearCurrentReopen: (s) => {
      s.current = null;
    },
  },
  extraReducers: (builder) => {
    builder

      // REQUEST
      .addCase(requestReopen.pending, (s) => {
        s.saving = true;
        s.error = null;
      })
      .addCase(requestReopen.fulfilled, (s, a) => {
        s.saving = false;
        s.reopens.unshift(a.payload);
        s.pending.unshift(a.payload);
      })
      .addCase(requestReopen.rejected, (s, a: any) => {
        s.saving = false;
        s.error = a.payload;
      })

      // FETCH ALL
      .addCase(fetchReopens.pending, (s) => {
        s.loading = true;
      })
      .addCase(fetchReopens.fulfilled, (s, a) => {
        s.loading = false;
        s.reopens = a.payload;
      })
      .addCase(fetchReopens.rejected, (s, a: any) => {
        s.loading = false;
        s.error = a.payload;
      })

      // FETCH PENDING
      .addCase(fetchPendingReopens.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchPendingReopens.fulfilled, (s, a) => {
        s.loading = false;
        s.pending = a.payload;
      })
      .addCase(fetchPendingReopens.rejected, (s, a: any) => {
        s.loading = false;
        s.error = a.payload;
      })

      // FETCH ONE
      .addCase(fetchReopenById.pending, (s) => {
        s.loading = true;
      })
      .addCase(fetchReopenById.fulfilled, (s, a) => {
        s.loading = false;
        s.current = a.payload;
      })
      .addCase(fetchReopenById.rejected, (s, a: any) => {
        s.loading = false;
        s.error = a.payload;
      })

      // REVIEW
      .addCase(reviewReopen.pending, (s) => {
        s.saving = true;
      })
      .addCase(reviewReopen.fulfilled, (s, a) => {
        s.saving = false;
        s.current = a.payload;
        const i = s.reopens.findIndex((r) => r.id === a.payload.id);
        if (i >= 0) s.reopens[i] = a.payload;
        s.pending = s.pending.filter((r) => r.id !== a.payload.id);
      })
      .addCase(reviewReopen.rejected, (s, a: any) => {
        s.saving = false;
        s.error = a.payload;
      });
  },
});

export const { clearReopenError, clearCurrentReopen } = reopenSlice.actions;
export default reopenSlice.reducer;