import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../../service/reusable_service/api";
export interface TicketStatusOverview {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  overdue: number;
  slaOnTrack: number;
  slaAtRisk: number;
  responseRatePercent: number;
}

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

export interface Dashboard {
  kpis: KpiCards;
  statusOverview: TicketStatusOverview;
  recentActivity: RecentActivityItem[];
  recentTickets: RecentTicketItem[];
}

interface DashboardState {
  data: Dashboard | null;
  statusOverview: TicketStatusOverview | null;
  loading: boolean;
  error: any;
}

const initialState: DashboardState = {
  data: null,
  statusOverview: null,
  loading: false,
  error: null,
};

export const fetchEmployeeDashboard = createAsyncThunk<
  Dashboard,
  string,
  { rejectValue: any }
>("dashboard/fetchEmployee", async (employeeId, { rejectWithValue }) => {
  try {
    const res = await api.get<Dashboard>(
      `/dashboard/employee/${encodeURIComponent(employeeId)}`
    );
    return res.data;
  } catch (e: any) {
    return rejectWithValue(e.response?.data ?? e.message);
  }
});

export const fetchGlobalDashboard = createAsyncThunk<
  Dashboard,
  void,
  { rejectValue: any }
>("dashboard/fetchGlobal", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get<Dashboard>("/dashboard");
    return res.data;
  } catch (e: any) {
    return rejectWithValue(e.response?.data ?? e.message);
  }
});

export const fetchStatusOverview = createAsyncThunk<
  TicketStatusOverview,
  void,
  { rejectValue: any }
>("dashboard/statusOverview", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get<TicketStatusOverview>(
      "/dashboard/status-overview"
    );
    return res.data;
  } catch (e: any) {
    return rejectWithValue(e.response?.data ?? e.message);
  }
});

export const fetchEmployeeStatusOverview = createAsyncThunk<
  TicketStatusOverview,
  string,
  { rejectValue: any }
>("dashboard/statusOverviewEmployee", async (employeeId, { rejectWithValue }) => {
  try {
    const res = await api.get<TicketStatusOverview>(
      `/dashboard/status-overview/employee/${encodeURIComponent(employeeId)}`
    );
    return res.data;
  } catch (e: any) {
    return rejectWithValue(e.response?.data ?? e.message);
  }
});

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    clearDashboard: (s) => {
      s.data = null;
      s.statusOverview = null;
      s.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployeeDashboard.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchEmployeeDashboard.fulfilled, (s, a) => {
        s.loading = false;
        s.data = a.payload;
      })
      .addCase(fetchEmployeeDashboard.rejected, (s, a: any) => {
        s.loading = false;
        s.error = a.payload;
      })

      .addCase(fetchGlobalDashboard.fulfilled, (s, a) => {
        s.data = a.payload;
      })

      .addCase(fetchStatusOverview.fulfilled, (s, a) => {
        s.statusOverview = a.payload;
      })

      .addCase(fetchEmployeeStatusOverview.fulfilled, (s, a) => {
        s.statusOverview = a.payload;
      });
  },
});

export const { clearDashboard } = dashboardSlice.actions;
export default dashboardSlice.reducer;