import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../../service/reusable_service/api";

export interface ExecStats {
  openTickets: number;
  assignedToMe: number;
  inInvestigation: number;
  resolvedToday: number;

  onTrack: number;
  atRisk: number;
  breached: number;

  totalAssigned: number;
  totalActive: number;
  responseRate: number;
}

interface State {
  data: ExecStats | null;
  loading: boolean;
  error: any;
}

const initialState: State = { data: null, loading: false, error: null };

export const fetchExecStats = createAsyncThunk<
  ExecStats,
  string,
  { rejectValue: any }
>("execStats/fetch", async (employeeId, { rejectWithValue }) => {
  try {
    const res = await api.get<ExecStats>(
      `/dashboard/executive/${encodeURIComponent(employeeId)}`
    );
    return res.data;
  } catch (e: any) {
    return rejectWithValue(e.response?.data ?? e.message);
  }
});

export const fetchGlobalStats = createAsyncThunk<
  ExecStats,
  void,
  { rejectValue: any }
>("execStats/fetchGlobal", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get<ExecStats>(`/dashboard/global`);
    return res.data;
  } catch (e: any) {
    return rejectWithValue(e.response?.data ?? e.message);
  }
});

const execStatsSlice = createSlice({
  name: "execStats",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    const pending = (s: State) => { s.loading = true; s.error = null; };
    const rejected = (s: State, a: any) => { s.loading = false; s.error = a.payload; };

    builder
      .addCase(fetchExecStats.pending, pending)
      .addCase(fetchExecStats.fulfilled, (s, a) => { s.loading = false; s.data = a.payload; })
      .addCase(fetchExecStats.rejected, rejected)

      .addCase(fetchGlobalStats.pending, pending)
      .addCase(fetchGlobalStats.fulfilled, (s, a) => { s.loading = false; s.data = a.payload; })
      .addCase(fetchGlobalStats.rejected, rejected);
  },
});

export default execStatsSlice.reducer;