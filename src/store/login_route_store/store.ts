import { configureStore } from "@reduxjs/toolkit";
import loginRouteReducer from "./LoginRoute_Slice";

export const store = configureStore({
    reducer: {
        loginRoute: loginRouteReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;