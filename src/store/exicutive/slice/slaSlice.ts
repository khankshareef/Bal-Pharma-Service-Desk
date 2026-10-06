import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../../service/reusable_service/api";

export interface SlaDashboard {
  onTrack: number;
  atRisk: number;
  breached: number;
  total: number;
  overallCompliance: number;
}

interface State {
  data: SlaDashboard | null;
  loading: boolean;
  error: any;
}

const initialState: State = { data: null, loading: false, error: null };

export const fetchSlaDashboard = createAsyncThunk<
  SlaDashboard,
  string,
  { rejectValue: any }
>("sla/fetch", async (employeeId, { rejectWithValue }) => {
  try {
    const res = await api.get<SlaDashboard>(
      `/tickets/sla-dashboard/${encodeURIComponent(employeeId)}`
    );
    return res.data;                 
  } catch (e: any) {
    return rejectWithValue(e.response?.data ?? e.message);
  }
});


export const fetchGlobalSlaDashboard = createAsyncThunk<
  SlaDashboard,
  void,                                                           
  { rejectValue: any }
>("sla/fetchGlobal", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get<SlaDashboard>(`/tickets/sla-dashboard/global`);
    return res.data;
  } catch (e: any) {
    return rejectWithValue(e.response?.data ?? e.message);
  }
});

const slaSlice = createSlice({
  name: "sla",
  initialState,
  reducers: {
    clearSla: (s) => { s.data = null; s.error = null; },
  },
  extraReducers: (builder) => {
    const pending = (s: State) => { s.loading = true; s.error = null; };
    const rejected = (s: State, a: any) => { s.loading = false; s.error = a.payload; };

    builder
      .addCase(fetchSlaDashboard.pending, pending)
      .addCase(fetchSlaDashboard.fulfilled, (s, a) => { s.loading = false; s.data = a.payload; })
      .addCase(fetchSlaDashboard.rejected, rejected)

      .addCase(fetchGlobalSlaDashboard.pending, pending)
      .addCase(fetchGlobalSlaDashboard.fulfilled, (s, a) => { s.loading = false; s.data = a.payload; })
      .addCase(fetchGlobalSlaDashboard.rejected, rejected);
  },
});

export const { clearSla } = slaSlice.actions;
export default slaSlice.reducer;