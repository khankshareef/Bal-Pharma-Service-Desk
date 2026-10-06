import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../../service/reusable_service/api";

export interface Unit {
  id?: number;
  unitCode: string;
  unitName: string;
  address: string;
  portCode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  radiusMeters?: number | null;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UnitPayload {
  unitCode?: string;
  unitName: string;
  address: string;
  portCode?: string;
  latitude?: number | null;
  longitude?: number | null;
  radiusMeters?: number | null;
  active?: boolean;
}

export interface UnitStats {
  totalUnits: number;
  activeUnits: number;
  inactiveUnits: number;
  totalUsers: number;
  totalExecutives: number;
}

interface UnitsState {
  units: Unit[];
  stats: UnitStats | null;
  loading: boolean;
  error: any;
}

const initialState: UnitsState = {
  units: [],
  stats: null,
  loading: false,
  error: null,
};

export const createUnit = createAsyncThunk<
  Unit,
  UnitPayload,
  { rejectValue: any }
>("units/create", async (payload, { rejectWithValue }) => {
  try {
    const res = await api.post<Unit>("/units", payload);
    return res.data;
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data || error?.message || "Something went wrong"
    );
  }
});

export const fetchUnits = createAsyncThunk<
  Unit[],
  void,
  { rejectValue: any }
>("units/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get<Unit[]>("/units");
    return res.data;
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data || error?.message || "Something went wrong"
    );
  }
});

export const fetchUnitById = createAsyncThunk<
  Unit,
  number,
  { rejectValue: any }
>("units/fetchOne", async (id, { rejectWithValue }) => {
  try {
    const res = await api.get<Unit>(`/units/${id}`);
    return res.data;
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data || error?.message || "Something went wrong"
    );
  }
});

export const fetchUnitStats = createAsyncThunk<
  UnitStats,
  void,
  { rejectValue: any }
>("units/stats", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get<UnitStats>("/units/stats");
    return res.data;
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data || error?.message || "Something went wrong"
    );
  }
});

export const updateUnit = createAsyncThunk<
  Unit,
  { id: number; data: Partial<UnitPayload> },
  { rejectValue: any }
>("units/update", async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await api.put<Unit>(`/units/${id}`, data);
    return res.data;
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data || error?.message || "Something went wrong"
    );
  }
});

export const deleteUnit = createAsyncThunk<
  number,
  number,
  { rejectValue: any }
>("units/delete", async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/units/${id}`);
    return id;
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data || error?.message || "Something went wrong"
    );
  }
});

const unitsSlice = createSlice({
  name: "units",
  initialState,
  reducers: {
    clearUnitsError: (state) => {
      state.error = null;
    },
    resetUnits: () => initialState,
  },
  extraReducers: (builder) => {
    builder

      .addCase(createUnit.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUnit.fulfilled, (state, action) => {
        state.loading = false;
        state.units.push(action.payload);
      })
      .addCase(createUnit.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchUnits.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUnits.fulfilled, (state, action) => {
        state.loading = false;
        state.units = action.payload;
      })
      .addCase(fetchUnits.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchUnitById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUnitById.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.units.findIndex((u) => u.id === action.payload.id);
        if (idx >= 0) state.units[idx] = action.payload;
        else state.units.push(action.payload);
      })
      .addCase(fetchUnitById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchUnitStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })

      .addCase(updateUnit.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUnit.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.units.findIndex((u) => u.id === action.payload.id);
        if (idx >= 0) state.units[idx] = action.payload;
      })
      .addCase(updateUnit.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(deleteUnit.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUnit.fulfilled, (state, action) => {
        state.loading = false;
        state.units = state.units.filter((u) => u.id !== action.payload);
      })
      .addCase(deleteUnit.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearUnitsError, resetUnits } = unitsSlice.actions;
export default unitsSlice.reducer;