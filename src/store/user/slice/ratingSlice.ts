import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../../service/reusable_service/api";

export interface Rating {
  id: number;
  ticketId: number;
  ticketCode?: string;
  ratedById: number;
  ratedByName?: string;
  rating: number;
  comments?: string;
  createdAt: string;
  updatedAt: string;
}

interface RatingState {
  list: Rating[];
  loading: boolean;
  error: any;
}

const initialState: RatingState = {
  list: [],
  loading: false,
  error: null,
};

export const createRating = createAsyncThunk<
  Rating,
  { ticketId: number; rating: number; comments: string; ratedBy: string },
  { rejectValue: any }
>("rating/create", async (payload, { rejectWithValue }) => {
  try {
    const res = await api.post<Rating>(
      `/ratings?ratedBy=${encodeURIComponent(payload.ratedBy)}`,
      {
        ticketId: payload.ticketId,
        rating: payload.rating,
        comments: payload.comments,
      }
    );
    return res.data;
  } catch (e: any) {
    return rejectWithValue(e.response?.data ?? e.message);
  }
});

export const fetchRatings = createAsyncThunk<
  Rating[],
  void,
  { rejectValue: any }
>("rating/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get<Rating[]>("/ratings");
    return res.data;
  } catch (e: any) {
    return rejectWithValue(e.response?.data ?? e.message);
  }
});

export const fetchRatingsByTicket = createAsyncThunk<
  Rating[],
  number,
  { rejectValue: any }
>("rating/fetchByTicket", async (ticketId, { rejectWithValue }) => {
  try {
    const res = await api.get<Rating[]>(`/ratings/ticket/${ticketId}`);
    return res.data;
  } catch (e: any) {
    return rejectWithValue(e.response?.data ?? e.message);
  }
});

export const fetchRatingsByEmployee = createAsyncThunk<
  Rating[],
  string,
  { rejectValue: any }
>("rating/fetchByEmployee", async (employeeId, { rejectWithValue }) => {
  try {
    const res = await api.get<Rating[]>(
      `/ratings/employee/${encodeURIComponent(employeeId)}`
    );
    return res.data;
  } catch (e: any) {
    return rejectWithValue(e.response?.data ?? e.message);
  }
});

export const updateRating = createAsyncThunk<
  Rating,
  { id: number; rating: number; comments: string; employeeId: string },
  { rejectValue: any }
>("rating/update", async (payload, { rejectWithValue }) => {
  try {
    const res = await api.put<Rating>(
      `/ratings/${payload.id}?employeeId=${encodeURIComponent(payload.employeeId)}`,
      {
        rating: payload.rating,
        comments: payload.comments,
      }
    );
    return res.data;
  } catch (e: any) {
    return rejectWithValue(e.response?.data ?? e.message);
  }
});

export const deleteRating = createAsyncThunk<
  number,
  number,
  { rejectValue: any }
>("rating/delete", async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/ratings/${id}`);
    return id;
  } catch (e: any) {
    return rejectWithValue(e.response?.data ?? e.message);
  }
});

const ratingSlice = createSlice({
  name: "rating",
  initialState,
  reducers: {
    clearRatings: (s) => {
      s.list = [];
      s.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createRating.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(createRating.fulfilled, (s, a) => {
        s.loading = false;
        s.list.unshift(a.payload);
      })
      .addCase(createRating.rejected, (s, a: any) => {
        s.loading = false;
        s.error = a.payload;
      })

      .addCase(fetchRatings.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchRatings.fulfilled, (s, a) => {
        s.loading = false;
        s.list = a.payload;
      })
      .addCase(fetchRatings.rejected, (s, a: any) => {
        s.loading = false;
        s.error = a.payload;
      })

      .addCase(fetchRatingsByTicket.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchRatingsByTicket.fulfilled, (s, a) => {
        s.loading = false;
        s.list = a.payload;
      })
      .addCase(fetchRatingsByTicket.rejected, (s, a: any) => {
        s.loading = false;
        s.error = a.payload;
      })

      .addCase(fetchRatingsByEmployee.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchRatingsByEmployee.fulfilled, (s, a) => {
        s.loading = false;
        s.list = a.payload;
      })
      .addCase(fetchRatingsByEmployee.rejected, (s, a: any) => {
        s.loading = false;
        s.error = a.payload;
      })

      .addCase(updateRating.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(updateRating.fulfilled, (s, a) => {
        s.loading = false;
        s.list = s.list.map((r) => (r.id === a.payload.id ? a.payload : r));
      })
      .addCase(updateRating.rejected, (s, a: any) => {
        s.loading = false;
        s.error = a.payload;
      })

      .addCase(deleteRating.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(deleteRating.fulfilled, (s, a) => {
        s.loading = false;
        s.list = s.list.filter((r) => r.id !== a.payload);
      })
      .addCase(deleteRating.rejected, (s, a: any) => {
        s.loading = false;
        s.error = a.payload;
      });
  },
});

export const { clearRatings } = ratingSlice.actions;
export default ratingSlice.reducer;