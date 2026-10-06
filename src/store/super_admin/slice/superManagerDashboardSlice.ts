import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../../service/reusable_service/api";

export interface UnitCount {
  unitCode: string;
  unitName: string;
  address: string;
  userCount: number;
}

export interface ActivityItem {
  id: number;
  time: string;
  activity: string;
}

export interface SuperManagerDashboard {
  totalUsers: number;
  activeUsers: number;
  employees: number;
  executives: number;
  locations: number;

  totalUsersHint: string;
  activeUsersHint: string;
  employeesHint: string;
  executivesHint: string;
  locationsHint: string;

  units: UnitCount[];
  recentActivity: ActivityItem[];
}

interface State {
  data: SuperManagerDashboard | null;
  loading: boolean;
  error: any;
}

const initialState: State = { data: null, loading: false, error: null };

export const fetchSuperManagerDashboard = createAsyncThunk<
  SuperManagerDashboard,
  void,
  { rejectValue: any }
>("superManagerDashboard/fetch", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get<SuperManagerDashboard>("/dashboard/super-manager");
    return res.data;
  } catch (e: any) {
    return rejectWithValue(e.response?.data ?? e.message);
  }
});

const slice = createSlice({
  name: "superManagerDashboard",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSuperManagerDashboard.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchSuperManagerDashboard.fulfilled, (s, a) => {
        s.loading = false;
        s.data = a.payload;
      })
      .addCase(fetchSuperManagerDashboard.rejected, (s, a: any) => {
        s.loading = false;
        s.error = a.payload;
      });
  },
});

export default slice.reducer;