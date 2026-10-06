import { configureStore } from "@reduxjs/toolkit";
import usersSlice from "../../store/super_admin/slice/usersSlice";
import execDashboardReducer from "../exicutive/slice/execDashboardSlice";
import execStatsReducer from "../exicutive/slice/execStatsSlice";
import investigationTemplateReducer from "../exicutive/slice/investigationTemplateSlice";
import requestInfoReducer from "../exicutive/slice/requestInfoSlice";
import slaReducer from "../exicutive/slice/slaSlice";
import addUserReducer from "../super_admin/slice/Add_User";
import analyticsReducer from "../super_admin/slice/analyticsSlice";
import auditLogReducer from "../super_admin/slice/auditLogSlice";
import categoriesReducer from "../super_admin/slice/CategorySlice";
import configReducer from "../super_admin/slice/configSlice";
import departmentreducer from "../super_admin/slice/DepartmentSlice";
import reportsReducer from "../super_admin/slice/reportsSlice";
import superManagerDashboardReducer from "../super_admin/slice/superManagerDashboardSlice";
import templatesReducer from "../super_admin/slice/templatesSlice";
import UnitSlice from "../super_admin/slice/UnitSlice";
import dashboardReducer from "../user/slice/dashboardSlice";
import LoginReducer from "../user/slice/Login_Slice";
import notificationReducer from "../user/slice/NotificationSlice";
import ratingReducer from "../user/slice/ratingSlice";
import reopensReducer from "../user/slice/ReopenSlice";
import ticketsReducer from "../user/slice/TicketsSlice";

const store = configureStore({
  reducer: {
    auth: LoginReducer,
    addUser: addUserReducer,
    unit : UnitSlice,
    users : usersSlice,
    templates: templatesReducer,
    departments: departmentreducer,
    categories: categoriesReducer,
    tickets: ticketsReducer,
    dashboard: dashboardReducer,
    reopens: reopensReducer,
    notifications: notificationReducer, 
     rating: ratingReducer,
     requestInfo: requestInfoReducer,  
      sla: slaReducer,
      execStats: execStatsReducer,
      investigationTemplates: investigationTemplateReducer,
      execDashboard: execDashboardReducer,
      superManagerDashboard: superManagerDashboardReducer,
      auditLog: auditLogReducer,
      analytics: analyticsReducer,
       reports: reportsReducer,
        config: configReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;