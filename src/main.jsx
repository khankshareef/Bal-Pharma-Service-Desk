import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { RouterProvider } from "react-router-dom";

import "./index.css";

import AuthBootstrap from "./component/common/auth/AuthBootstrap";
import { MainRoute } from "./route/MainRoute";
import store from "./store/store/Store";

createRoot(document.getElementById("root")).render(
    <StrictMode>
    <Provider store={store}>
      <AuthBootstrap>
        <RouterProvider router={MainRoute} />
      </AuthBootstrap>
    </Provider>
  </StrictMode>
);