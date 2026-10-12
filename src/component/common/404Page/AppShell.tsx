import { Outlet } from "react-router-dom";

import NetworkErrorListener from "../404Page/NetworkErrorListener";
import NotificationToaster from "../NotificationToaster";

const AppShell = () => (
  <>
    <NetworkErrorListener />
    <NotificationToaster />

    <Outlet />
  </>
);

export default AppShell;