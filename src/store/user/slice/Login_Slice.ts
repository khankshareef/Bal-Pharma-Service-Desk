import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../../service/reusable_service/api";

interface LoginData {
  employeeId: string;
  role: string;
  password: string;
}

export interface AssignedUnit {
  unitCode: string;
  unitName: string;
  portCode: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  radiusMeters?: number;
}

export interface AuthUser {
  userId: number;
  employeeId: string;
  name: string;
  initials: string;
  department: string;

  activeRole: string;
  roleDisplay: string;
  roles: string[];

  status: string;
  active: boolean;
  mustChangePassword: boolean;

  primaryLocation: string;
  allowedLocations: string[];
  assignedUnits: AssignedUnit[];

  createdAt: string;
  accountAgeDays: number;
  lastLoginAt: string;
  lastLoginLocation: string | null;
  locationCount: number;

  message?: string;
  token?: string;
}

interface ChangePasswordData {
  employeeId: string;
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ApiError {
  error?: string;
  message?: string;
}

interface LoginState {
  token: string;
  mustChangePassword: boolean;
  user: AuthUser | null;
  loginLoading: boolean;
  loginError: string | null;
  changePasswordLoading: boolean;
  changePasswordError: string | null;
  meApiLoading: boolean;
  meApiError: ApiError | null;
}

const initialState: LoginState = {
  token:
    typeof window !== "undefined"
      ? window.sessionStorage.getItem("accessToken") || ""
      : "",
  mustChangePassword: false,
  user: null,
  loginLoading: false,
  loginError: null,
  changePasswordLoading: false,
  changePasswordError: null,
  meApiLoading: false,
  meApiError: null,
};


export const LoginSlice = createAsyncThunk<
  AuthUser,
  LoginData,
  { rejectValue: ApiError }
>("auth/login", async (payload, { rejectWithValue }) => {
  try {
    const response = await api.post<AuthUser>("/auth/login", payload);

    if (response.data.token) {
      sessionStorage.setItem("accessToken", response.data.token);
    }
    if (response.data.employeeId) {
      sessionStorage.setItem("EmployeeId", response.data.employeeId);
    }
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data || { message: "Login failed" }
    );
  }
});

export const meApi = createAsyncThunk<
  AuthUser,
  void,
  { rejectValue: ApiError }
>("auth/meApi", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get<AuthUser>("/auth/me");
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data || { message: "Me API Error" }
    );
  }
});

export const FirstTimeChangePassword = createAsyncThunk<
  { message: string },
  ChangePasswordData,
  { rejectValue: string }
>("auth/changePassword", async (payload, { rejectWithValue }) => {
  try {
    const response = await api.post<{ message: string }>(
      "/auth/change-password",
      payload
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.error ||
        error.response?.data?.message ||
        "Change password failed"
    );
  }
});

const loginRouteSlice = createSlice({
  name: "loginRoute",
  initialState,

  reducers: {
    logout: (state) => {
      Object.assign(state, initialState);
      sessionStorage.removeItem("accessToken");
      sessionStorage.removeItem("EmployeeId");
    },
  },

  extraReducers: (builder) => {
    builder

      .addCase(LoginSlice.pending, (state) => {
        state.loginLoading = true;
        state.loginError = null;
      })
      .addCase(LoginSlice.fulfilled, (state, action) => {
        state.loginLoading = false;
        state.token = action.payload.token || "";
        state.mustChangePassword = action.payload.mustChangePassword;
        state.user = action.payload;
        state.loginError = null;
      })
      .addCase(LoginSlice.rejected, (state, action) => {
        state.loginLoading = false;
        state.loginError =
          action.payload?.error ||
          action.payload?.message ||
          "Login failed";
      })

      .addCase(FirstTimeChangePassword.pending, (state) => {
        state.changePasswordLoading = true;
        state.changePasswordError = null;
      })
      .addCase(FirstTimeChangePassword.fulfilled, (state) => {
        state.changePasswordLoading = false;
        state.changePasswordError = null;
        state.mustChangePassword = false;
      })
      .addCase(FirstTimeChangePassword.rejected, (state, action) => {
        state.changePasswordLoading = false;
        state.changePasswordError =
          action.payload || "Change password failed";
      })

      .addCase(meApi.pending, (state) => {
        state.meApiLoading = true;
        state.meApiError = null;
      })
      .addCase(meApi.fulfilled, (state, action) => {
        state.meApiLoading = false;
        const token = state.token || "";
        state.user = { ...action.payload, token };
        state.token = token;
        state.mustChangePassword = action.payload.mustChangePassword;
        state.meApiError = null;
      })
      .addCase(meApi.rejected, (state, action) => {
        state.meApiLoading = false;
        state.meApiError =
          action.payload || { message: "Me API Error" };
      });
  },
});

export const { logout } = loginRouteSlice.actions;
export default loginRouteSlice.reducer;