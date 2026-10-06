import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../../service/reusable_service/api";

export interface AuditRow {
  id: number;
  timestamp: string;
  user: string;
  action: string;
  type: string;
  unit: string;
  details: string;
}

interface State {
  data: AuditRow[];
  loading: boolean;
  error: any;
}

const initialState: State = { data: [], loading: false, error: null };

export const fetchAuditLog = createAsyncThunk<
  AuditRow[],
  void,
  { rejectValue: any }
>("auditLog/fetch", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get<AuditRow[]>("/audit-log");
    return res.data;
  } catch (e: any) {
    return rejectWithValue(e.response?.data ?? e.message);
  }
});

const slice = createSlice({
  name: "auditLog",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAuditLog.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchAuditLog.fulfilled, (s, a) => {
        s.loading = false;
        s.data = a.payload;
      })
      .addCase(fetchAuditLog.rejected, (s, a: any) => {
        s.loading = false;
        s.error = a.payload;
      });
  },
});

export default slice.reducer;