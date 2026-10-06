import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface LoginRouteState {
  isLoggedIn: boolean;
  role: string;
}

const initialState: LoginRouteState = {
  isLoggedIn: false,
  role: "",
};

export const loginRouteSlice = createSlice({
  name: "loginRoute",
  initialState,
  reducers: {
    setIsLoggedIn: (state, action: PayloadAction<boolean>) => {
      state.isLoggedIn = action.payload;
    },

    setRole: (state, action: PayloadAction<string>) => {
      state.role = action.payload;
    },
  },
});

export const {
  setIsLoggedIn,
  setRole,
} = loginRouteSlice.actions;

export default loginRouteSlice.reducer;