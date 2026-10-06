import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../../service/reusable_service/api";

export interface PriorityConfig {
  id: number;
  priorityId: string;
  name: string;
  tickets: number;
  active: boolean;
}

export interface StatusConfig {
  id: number;
  statusId: string;
  name: string;
  tickets: number;
  active: boolean;
}

interface State {
  priorities: PriorityConfig[];
  statuses: StatusConfig[];
  loading: boolean;
  error: any;
}

const initialState: State = {
  priorities: [],
  statuses: [],
  loading: false,
  error: null,
};

export const fetchPriorities = createAsyncThunk<
  PriorityConfig[],
  void,
  { rejectValue: any }
>("config/fetchPriorities", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get<PriorityConfig[]>("/config/priorities");
    return res.data;
  } catch (e: any) {
    return rejectWithValue(e.response?.data ?? e.message);
  }
});

export const fetchStatuses = createAsyncThunk<
  StatusConfig[],
  void,
  { rejectValue: any }
>("config/fetchStatuses", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get<StatusConfig[]>("/config/statuses");
    return res.data;
  } catch (e: any) {
    return rejectWithValue(e.response?.data ?? e.message);
  }
});

const slice = createSlice({
  name: "config",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPriorities.pending, (s) => {
        s.loading = true; s.error = null;
      })
      .addCase(fetchPriorities.fulfilled, (s, a) => {
        s.loading = false; s.priorities = a.payload;
      })
      .addCase(fetchPriorities.rejected, (s, a: any) => {
        s.loading = false; s.error = a.payload;
      })

      .addCase(fetchStatuses.pending, (s) => {
        s.loading = true; s.error = null;
      })
      .addCase(fetchStatuses.fulfilled, (s, a) => {
        s.loading = false; s.statuses = a.payload;
      })
      .addCase(fetchStatuses.rejected, (s, a: any) => {
        s.loading = false; s.error = a.payload;
      });
  },
});

export default slice.reducer;