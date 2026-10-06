import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../../service/reusable_service/api";

export interface KpiCards {
  totalTickets: number;
  openTickets: number;
  resolvedTickets: number;
  inProgressTickets: number;
  totalSlaText: string;
  openSlaText: string;
  resolvedAvgText: string;
  inProgressOverdueText: string;
}

export interface StatusOverview {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  overdue: number;
  slaOnTrack: number;
  responseRatePercent: number;
}

export interface RecentActivityItem {
  id: number;
  ticketId: string;
  subject: string;
  status: string;
  date: string;
}

export interface RecentTicketItem {
  id: number;
  ticketId: string;
  subject: string;
  department: string;
  category: string;
  priority: string;
  status: string;
  sla: string;
  date: string;
}

export interface DashboardResponse {
  kpis: KpiCards;
  statusOverview: StatusOverview;
  recentActivity: RecentActivityItem[];
  recentTickets: RecentTicketItem[];
}

interface ExecDashboardState {
  data: DashboardResponse | null;
  loading: boolean;
  error: any;
}

const initialState: ExecDashboardState = {
  data: null,
  loading: false,
  error: null,
};

export const fetchExecDashboard = createAsyncThunk<
  DashboardResponse,
  string,
  { rejectValue: any }
>("execDashboard/fetch", async (employeeId, { rejectWithValue }) => {
  try {
    const res = await api.get<DashboardResponse>(
      `/dashboard/executive/${encodeURIComponent(employeeId)}`
    );
    return res.data;
  } catch (e: any) {
    return rejectWithValue(e.response?.data ?? e.message);
  }
});

const execDashboardSlice = createSlice({
  name: "execDashboard",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchExecDashboard.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchExecDashboard.fulfilled, (s, a) => {
        s.loading = false;
        s.data = a.payload;
      })
      .addCase(fetchExecDashboard.rejected, (s, a: any) => {
        s.loading = false;
        s.error = a.payload;
      });
  },
});

export default execDashboardSlice.reducer;