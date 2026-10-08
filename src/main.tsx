import { Buffer } from "buffer";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { RouterProvider } from "react-router-dom";
(window as any).Buffer = Buffer;

import "./index.css";

import AuthBootstrap from "./component/common/auth/AuthBootstrap";
import { MainRoute } from "./route/MainRoute";
import store from "./store/store/Store";


const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error('Root element "#root" was not found.');
}

createRoot(rootElement).render(
    <StrictMode>
    <Provider store={store}>
      <AuthBootstrap>
        <RouterProvider router={MainRoute} />
      </AuthBootstrap>
    </Provider>
  </StrictMode>
);