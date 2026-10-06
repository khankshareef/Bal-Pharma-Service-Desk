import { createBrowserRouter, redirect } from "react-router-dom";

import AppShell from "../component/common/404Page/AppShell";
import NoInternet from "../component/common/404Page/NoInternet";
import PageNotFound from "../component/common/404Page/PageNotFound";
import ProtectedRoute from "../component/common/404Page/ProtectedRoute";
import DepAdminLayout from "../component/common/dep_admin/DepAdminLayout";
import ExecutiveLayout from "../component/common/exicutive/ExecutiveLayout";
import SuperAdminLayout from "../component/common/sup_admin/SuperAdminLayout";
import UserLayout from "../component/common/user/UserLayout";
import Login from "../page/login/Login";
import Password_Change from "../page/login/Password_Change";
import { DepAdminMain_Route } from "./Dep_Admin/DepAdminMain_Route";
import { ExicutiveMain_Route } from "./Exicutive/ExicutiveMain_Route";
import { SuperAdminMain_Route } from "./Super_Admin/SuperAdminMain_Route";
import { UserMain_Route } from "./User/UserMain_Route";

export const MainRoute = createBrowserRouter([
  {
    path: "/",
    Component: AppShell,
    children: [
      {
        index: true,
        loader: () => redirect("/login"),
      },

      { path: "login",           Component: Login },
      { path: "change-password", Component: Password_Change },

      {
        Component: ProtectedRoute,
        children: [
          {
            path: "employee",
            Component: UserLayout,
            children: UserMain_Route,
          },
          {
            path: "executive",
            Component: ExecutiveLayout,
            children: ExicutiveMain_Route,
          },
          {
            path: "super-manager",
            Component: SuperAdminLayout,
            children: SuperAdminMain_Route,
          },
          {
            path: "deputy-manager",
            Component: DepAdminLayout,
            children: DepAdminMain_Route,
          },
        ],
      },

      { path: "no-internet", Component: NoInternet },

      { path: "*", Component: PageNotFound },
    ],
  },
]);