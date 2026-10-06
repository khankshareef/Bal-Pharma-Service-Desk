import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../../service/reusable_service/api";

export interface Department {
  id: number;
  departmentCode: string;
  name: string;
  unitId?: number | null;
  unitName: string;
  active: boolean;
  users: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface DepartmentPayload {
  name: string;
  unitId?: number | null;
  active?: boolean;
}

export interface DepartmentStats {
  total: number;
  active: number;
  inactive: number;
  assignedUsers: number;
}

interface DepartmentsState {
  departments: Department[];
  stats: DepartmentStats | null;
  loading: boolean;
  saving: boolean;
  error: any;
}

const initialState: DepartmentsState = {
  departments: [],
  stats: null,
  loading: false,
  saving: false,
  error: null,
};


export const fetchDepartments = createAsyncThunk<
  Department[],
  void,
  { rejectValue: any }
>("departments/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get<Department[]>("/departments");
    return res.data;
  } catch (e: any) {
    return rejectWithValue(e.response?.data ?? e.message);
  }
});

export const fetchDepartmentStats = createAsyncThunk<
  DepartmentStats,
  void,
  { rejectValue: any }
>("departments/stats", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get<DepartmentStats>("/departments/stats");
    return res.data;
  } catch (e: any) {
    return rejectWithValue(e.response?.data ?? e.message);
  }
});

export const createDepartment = createAsyncThunk<
  Department,
  DepartmentPayload,
  { rejectValue: any }
>("departments/create", async (payload, { rejectWithValue }) => {
  try {
    const res = await api.post<Department>("/departments", payload);
    return res.data;
  } catch (e: any) {
    return rejectWithValue(e.response?.data ?? e.message);
  }
});

export const updateDepartment = createAsyncThunk<
  Department,
  { id: number; data: Partial<DepartmentPayload> },
  { rejectValue: any }
>("departments/update", async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await api.put<Department>(`/departments/${id}`, data);
    return res.data;
  } catch (e: any) {
    return rejectWithValue(e.response?.data ?? e.message);
  }
});

export const deleteDepartment = createAsyncThunk<
  number,
  number,
  { rejectValue: any }
>("departments/delete", async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/departments/${id}`);
    return id;
  } catch (e: any) {
    return rejectWithValue(e.response?.data ?? e.message);
  }
});


const departmentsSlice = createSlice({
  name: "departments",
  initialState,
  reducers: {
    clearDepartmentsError: (s) => {
      s.error = null;
    },
  },
  extraReducers: (builder) => {
    builder

      .addCase(fetchDepartments.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchDepartments.fulfilled, (s, a) => {
        s.loading = false;
        s.departments = a.payload;
      })
      .addCase(fetchDepartments.rejected, (s, a: any) => {
        s.loading = false;
        s.error = a.payload;
      })

      .addCase(fetchDepartmentStats.fulfilled, (s, a) => {
        s.stats = a.payload;
      })

      .addCase(createDepartment.pending, (s) => {
        s.saving = true;
        s.error = null;
      })
      .addCase(createDepartment.fulfilled, (s, a) => {
        s.saving = false;
        s.departments.push(a.payload);
      })
      .addCase(createDepartment.rejected, (s, a: any) => {
        s.saving = false;
        s.error = a.payload;
      })

      .addCase(updateDepartment.pending, (s) => {
        s.saving = true;
        s.error = null;
      })
      .addCase(updateDepartment.fulfilled, (s, a) => {
        s.saving = false;
        const i = s.departments.findIndex((d) => d.id === a.payload.id);
        if (i >= 0) s.departments[i] = a.payload;
      })
      .addCase(updateDepartment.rejected, (s, a: any) => {
        s.saving = false;
        s.error = a.payload;
      })

      .addCase(deleteDepartment.fulfilled, (s, a) => {
        s.departments = s.departments.filter((d) => d.id !== a.payload);
      });
  },
});

export const { clearDepartmentsError } = departmentsSlice.actions;
export default departmentsSlice.reducer;