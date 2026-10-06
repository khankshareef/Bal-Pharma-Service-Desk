import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../../service/reusable_service/api";

export interface ReportRow {
  department: string;
  unit: string;
  open: number;
  closed: number;
  avgResolutionHours: number;
}

export interface Reports {
  totalTickets: number;
  openTickets: number;
  resolvedTickets: number;
  avgResolutionHours: number;
  rows: ReportRow[];
}

interface State {
  data: Reports | null;
  loading: boolean;
  error: any;
}

const initialState: State = { data: null, loading: false, error: null };

export const fetchReports = createAsyncThunk<
  Reports,
  void,
  { rejectValue: any }
>("reports/fetch", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get<Reports>("/reports/dashboard");
    return res.data;
  } catch (e: any) {
    return rejectWithValue(e.response?.data ?? e.message);
  }
});

const slice = createSlice({
  name: "reports",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchReports.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchReports.fulfilled, (s, a) => {
        s.loading = false;
        s.data = a.payload;
      })
      .addCase(fetchReports.rejected, (s, a: any) => {
        s.loading = false;
        s.error = a.payload;
      });
  },
});

export default slice.reducer;