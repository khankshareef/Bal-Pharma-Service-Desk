import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../../service/reusable_service/api";


export interface UnitAssignmentPayload {
  unitCode: string;
  unitName: string;
  address?: string;
  portCode?: string;
  latitude?: number | null;
  longitude?: number | null;
  radiusMeters?: number | null;
}

export interface UserPayload {
  employeeId: string;
  name: string;
  roles: string[];             
  primaryRole: string;         
  password: string;
  department: string;
  subDepartment: string;
  allowedLocations: UnitAssignmentPayload[];
}

export interface UnitPayload {
  unitCode?: string;
  unitName: string;
  address: string;
  latitude?: number;
  longitude?: number;
  portCode?: string;
  radiusMeters?: number;
}

export interface UpdateUnitPayload {
  unitId: number | string;
  unitCode?: string;
  unitName?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  portCode?: string;
  radiusMeters?: number;
}

export interface Unit {
  id?: number;
  unitCode: string;
  unitName: string;
  address?: string;
  portCode?: string;
  latitude?: number;
  longitude?: number;
  radiusMeters?: number;
  active?: boolean;
}

interface AddUserState {
  user: any;
  units: Unit[];
  loading: boolean;
  unitLoading: boolean;
  error: any;
  unitError: any;
}

const initialState: AddUserState = {
  user: null,
  units: [],
  loading: false,
  unitLoading: false,
  error: null,
  unitError: null,
};


export const create_User = createAsyncThunk<any, UserPayload, { rejectValue: any }>(
  "addUser/createUser",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await api.post("/super-manager/users", payload);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data || err?.message || "Something went wrong"
      );
    }
  }
);

export const createUnit = createAsyncThunk<Unit, UnitPayload, { rejectValue: any }>(
  "addUser/createUnit",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await api.post<Unit>("/units", payload);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data || err?.message || "Something went wrong"
      );
    }
  }
);

export const fetchUnits = createAsyncThunk<Unit[], void, { rejectValue: any }>(
  "addUser/fetchUnits",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get<Unit[]>("/units");
      return Array.isArray(res.data) ? res.data : (res.data as any)?.data ?? [];
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data || err?.message || "Something went wrong"
      );
    }
  }
);

export const UpdateUnits = createAsyncThunk<Unit, UpdateUnitPayload, { rejectValue: any }>(
  "addUser/updateUnit",
  async (payload, { rejectWithValue }) => {
    try {
      const { unitId, ...data } = payload;
      const res = await api.put<Unit>(`/units/${unitId}`, data);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data || err?.message || "Something went wrong"
      );
    }
  }
);

export const DeleteUnits = createAsyncThunk<number | string, number | string, { rejectValue: any }>(
  "addUser/deleteUnit",
  async (unitId, { rejectWithValue }) => {
    try {
      await api.delete(`/units/${unitId}`);
      return unitId;
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data || err?.message || "Something went wrong"
      );
    }
  }
);


const addUserSlice = createSlice({
  name: "addUser",
  initialState,
  reducers: {
    resetAddUser: () => initialState,
  },
  extraReducers: (builder) => {
    builder

      .addCase(create_User.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(create_User.fulfilled, (s, a) => {
        s.loading = false;
        s.user = a.payload;
      })
      .addCase(create_User.rejected, (s, a: any) => {
        s.loading = false;
        s.error = a.payload;
      })

      .addCase(createUnit.pending, (s) => {
        s.unitLoading = true;
        s.unitError = null;
      })
      .addCase(createUnit.fulfilled, (s, a) => {
        s.unitLoading = false;
        s.units.push(a.payload);
      })
      .addCase(createUnit.rejected, (s, a: any) => {
        s.unitLoading = false;
        s.unitError = a.payload;
      })

      .addCase(fetchUnits.pending, (s) => {
        s.unitLoading = true;
        s.unitError = null;
      })
      .addCase(fetchUnits.fulfilled, (s, a) => {
        s.unitLoading = false;
        s.units = a.payload;
      })
      .addCase(fetchUnits.rejected, (s, a: any) => {
        s.unitLoading = false;
        s.unitError = a.payload;
      })

      .addCase(UpdateUnits.pending, (s) => {
        s.unitLoading = true;
        s.unitError = null;
      })
      .addCase(UpdateUnits.fulfilled, (s, a) => {
        s.unitLoading = false;
        const i = s.units.findIndex((u) => u.id === a.payload.id);
        if (i >= 0) s.units[i] = a.payload;
      })
      .addCase(UpdateUnits.rejected, (s, a: any) => {
        s.unitLoading = false;
        s.unitError = a.payload;
      })

      .addCase(DeleteUnits.pending, (s) => {
        s.unitLoading = true;
        s.unitError = null;
      })
      .addCase(DeleteUnits.fulfilled, (s, a) => {
        s.unitLoading = false;
        s.units = s.units.filter((u) => u.id !== a.payload);
      })
      .addCase(DeleteUnits.rejected, (s, a: any) => {
        s.unitLoading = false;
        s.unitError = a.payload;
      });
  },
});

export const { resetAddUser } = addUserSlice.actions;
export default addUserSlice.reducer;