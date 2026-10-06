import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../../service/reusable_service/api";

export interface Bucket {
  label: string;
  value: number;
  color: string;
}

export interface TrendPoint {
  month: string;
  value: number;
}

export interface HeatCell {
  date: string;
  count: number;
}

export interface UnitMetric {
  unitName: string;
  hours: number;
}

export interface Analytics {
  totalTickets: number;
  avgResolutionHours: number;
  slaCompliancePercent: number;
  userSatisfaction: number;

  ticketsDeltaPercent: number;
  resolutionDeltaHours: number;
  slaDeltaPercent: number;
  satisfactionDelta: number;

  byPriority: Bucket[];
  byStatus: Bucket[];
  totalForStatus: number;

  monthlyTrend: TrendPoint[];
  byCategory: Bucket[];
  heatmap: HeatCell[];
  byUnit: UnitMetric[];
}

interface State {
  data: Analytics | null;
  loading: boolean;
  error: any;
}

const initialState: State = { data: null, loading: false, error: null };

export const fetchAnalytics = createAsyncThunk<
  Analytics,
  { startDate?: string; endDate?: string } | void,
  { rejectValue: any }
>("analytics/fetch", async (params, { rejectWithValue }) => {
  try {
    const qs = new URLSearchParams();
    if (params && "startDate" in params && params.startDate)
      qs.set("startDate", params.startDate);
    if (params && "endDate" in params && params.endDate)
      qs.set("endDate", params.endDate);

    const url = qs.toString() ? `/analytics?${qs}` : "/analytics";
    const res = await api.get<Analytics>(url);
    return res.data;
  } catch (e: any) {
    return rejectWithValue(e.response?.data ?? e.message);
  }
});

const slice = createSlice({
  name: "analytics",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnalytics.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchAnalytics.fulfilled, (s, a) => {
        s.loading = false;
        s.data = a.payload;
      })
      .addCase(fetchAnalytics.rejected, (s, a: any) => {
        s.loading = false;
        s.error = a.payload;
      });
  },
});

export default slice.reducer;