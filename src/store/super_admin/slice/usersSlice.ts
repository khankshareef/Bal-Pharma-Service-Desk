import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../../service/reusable_service/api";

export type Role =
  | "EMPLOYEE"
  | "EXECUTIVE"
  | "DEPUTY_MANAGER"
  | "SUPER_MANAGER"
  | "ADMIN";

export type UserStatus = "ACTIVE" | "CLOSED" | "SUSPENDED";

export interface UnitAssignment {
  unitCode: string;
  unitName: string;
  address?: string | null;
  portCode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  radiusMeters?: number | null;
}

export interface User {
  id: number;
  employeeId: string;
  name: string;
  roles: Role[];
  role?: Role | string; 
  status: UserStatus;
  firstTimeLogin: boolean;
  department: string;
  subDepartment?: string;
  primaryLocation?: string | null;
  allowedLocations: UnitAssignment[];
  lastLoginAt?: string | null;
  lastLoginLocation?: string | null;
  createdAt?: string | null;
  passwordLastReset?: string | null;
  resetByName?: string | null;
  roleUnits?: Record<string, string[]>;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  employees: number;
  executives: number;
  deputyManagers: number;
  superManagers: number;
  admins: number;
}

export interface UpdateUserPayload {
  name?: string;
  roles?: string[];
  primaryRole?: string;
  status?: string;
  department?: string;
  subDepartment?: string;
  primaryLocation?: string | null;
  allowedLocations?: UnitAssignment[];
  roleUnits?: Record<string, string[]>;
}

interface UsersState {
  users: User[];
  stats: UserStats | null;
  loading: boolean;
  saving: boolean;
  resettingPassword: boolean;
  error: any;
}

const initialState: UsersState = {
  users: [],
  stats: null,
  loading: false,
  saving: false,
  resettingPassword: false,
  error: null,
};


export const fetchUsers = createAsyncThunk<User[], void, { rejectValue: any }>(
  "users/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get<User[]>("/super-manager/users");
      return res.data;
    } catch (e: any) {
      return rejectWithValue(e.response?.data ?? e.message);
    }
  }
);

export const fetchUserStats = createAsyncThunk<
  UserStats,
  void,
  { rejectValue: any }
>("users/stats", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get<UserStats>("/super-manager/users/stats");
    return res.data;
  } catch (e: any) {
    return rejectWithValue(e.response?.data ?? e.message);
  }
});

export const fetchUserById = createAsyncThunk<User, number, { rejectValue: any }>(
  "users/fetchOne",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get<User>(`/super-manager/users/${id}`);
      return res.data;
    } catch (e: any) {
      return rejectWithValue(e.response?.data ?? e.message);
    }
  }
);

export const updateUser = createAsyncThunk<
  User,
  { id: number; data: UpdateUserPayload },
  { rejectValue: any }
>("users/update", async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await api.put<User>(`/super-manager/users/${id}`, data);
    return res.data;
  } catch (e: any) {
    return rejectWithValue(e.response?.data ?? e.message);
  }
});

export const deleteUser = createAsyncThunk<number, number, { rejectValue: any }>(
  "users/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/super-manager/users/${id}`);
      return id;
    } catch (e: any) {
      return rejectWithValue(e.response?.data ?? e.message);
    }
  }
);

export const updateUserStatus = createAsyncThunk<
  User,
  { id: number; status: string },
  { rejectValue: any }
>("users/updateStatus", async ({ id, status }, { rejectWithValue }) => {
  try {
    const res = await api.patch<User>(
      `/super-manager/users/${id}/status`,
      { status }
    );
    return res.data;
  } catch (e: any) {
    return rejectWithValue(e.response?.data ?? e.message);
  }
});

export const updateUserLocations = createAsyncThunk<
  User,
  {
    id: number;
    primaryLocation?: string | null;
    allowedLocations: UnitAssignment[];
  },
  { rejectValue: any }
>(
  "users/updateLocations",
  async ({ id, primaryLocation, allowedLocations }, { rejectWithValue }) => {
    try {
      const res = await api.put<User>(
        `/super-manager/users/${id}/locations`,
        { primaryLocation, allowedLocations }
      );
      return res.data;
    } catch (e: any) {
      return rejectWithValue(e.response?.data ?? e.message);
    }
  }
);

export interface ResetPasswordResult {
  tempPassword: string;
  message: string;
}

export const resetUserPassword = createAsyncThunk<
  ResetPasswordResult,
  number,                        
  { rejectValue: any }
>(
  "users/resetPassword",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.patch<ResetPasswordResult>(
        `/super-manager/users/${id}/reset-password`
      );
      return res.data;
    } catch (e: any) {
      return rejectWithValue(e.response?.data ?? e.message);
    }
  }
);


const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    clearUsersError: (s) => {
      s.error = null;
    },
  },
  extraReducers: (builder) => {
    builder

      .addCase(fetchUsers.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchUsers.fulfilled, (s, a) => {
        s.loading = false;
        s.users = a.payload;
      })
      .addCase(fetchUsers.rejected, (s, a: any) => {
        s.loading = false;
        s.error = a.payload;
      })

      .addCase(fetchUserStats.fulfilled, (s, a) => {
        s.stats = a.payload;
      })

      .addCase(fetchUserById.fulfilled, (s, a) => {
        const i = s.users.findIndex((u) => u.id === a.payload.id);
        if (i >= 0) s.users[i] = a.payload;
        else s.users.push(a.payload);
      })

      .addCase(updateUser.pending, (s) => {
        s.saving = true;
        s.error = null;
      })
      .addCase(updateUser.fulfilled, (s, a) => {
        s.saving = false;
        const i = s.users.findIndex((u) => u.id === a.payload.id);
        if (i >= 0) s.users[i] = a.payload;
      })
      .addCase(updateUser.rejected, (s, a: any) => {
        s.saving = false;
        s.error = a.payload;
      })

      .addCase(deleteUser.fulfilled, (s, a) => {
        s.users = s.users.filter((u) => u.id !== a.payload);
      })

      .addCase(updateUserStatus.fulfilled, (s, a) => {
        const i = s.users.findIndex((u) => u.id === a.payload.id);
        if (i >= 0) s.users[i] = a.payload;
      })

      .addCase(updateUserLocations.fulfilled, (s, a) => {
        const i = s.users.findIndex((u) => u.id === a.payload.id);
        if (i >= 0) s.users[i] = a.payload;
      })

      .addCase(resetUserPassword.pending, (s) => {
        s.resettingPassword = true;
        s.error = null;
      })
      .addCase(resetUserPassword.fulfilled, (s, a) => {
        s.resettingPassword = false;
        const i = s.users.findIndex((u) => u.id === a.meta.arg);
        if (i >= 0) {
          s.users[i] = {
            ...s.users[i],
            firstTimeLogin: true,
            passwordLastReset: new Date().toISOString(),
          };
        }
      })
      .addCase(resetUserPassword.rejected, (s, a: any) => {
        s.resettingPassword = false;
        s.error = a.payload;
      });
  },
});

export const { clearUsersError } = usersSlice.actions;
export default usersSlice.reducer;