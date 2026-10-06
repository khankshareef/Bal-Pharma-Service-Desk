import { Outlet } from "react-router-dom";

import NetworkErrorListener from "../404Page/NetworkErrorListener";

const AppShell = () => (
  <>
    <NetworkErrorListener />

    {/* whichever route matches */}
    <Outlet />
  </>
);

export default AppShell;