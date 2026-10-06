import Assigned from "../../page/Exicutive/assigned/Assigned";
import Assigned_Details from "../../page/Exicutive/assigned/Assigned_Details";
import Assigned_Main from "../../page/Exicutive/assigned/Assigned_Main";
import Dashboard from "../../page/Exicutive/dashboard/Dashboard";
import Closure from "../../page/Exicutive/open_queue/Closure";
import Investigation from "../../page/Exicutive/open_queue/Investigation";
import Notification from "../../page/Exicutive/open_queue/Notification";
import Open_Queue from "../../page/Exicutive/open_queue/Open_Queue";
import OpenQueue_Main from "../../page/Exicutive/open_queue/OpenQueue_Main";
import Re_Solve from "../../page/Exicutive/open_queue/Re_Solve";
import ReOpen_Details from "../../page/Exicutive/open_queue/ReOpen_Details";
import Request_Info from "../../page/Exicutive/request_Info/Request_Info";
import Review_Reopen_Main from "../../page/Exicutive/review_reopens/Review_Reopen_Main";
import Review_ReOpens from "../../page/Exicutive/review_reopens/Review_ReOpens";
import SLA_Dashboard from "../../page/Exicutive/sla_dashboard/SLA_Dashboard";
import SLAMain_Dashboard from "../../page/Exicutive/sla_dashboard/SLAMain_Dashboard";
import Ticket_Details from "../../page/User/my_ticket/Ticket_Details";
import User_Profile from "../../page/User/user_profile/User_Profile";


export const ExicutiveMain_Route = [
  {
    path: "dashboard",
    Component: Dashboard,
  },

  {
    path: "open-queue",
    Component: OpenQueue_Main,
    children: [
      {
        index: true,
        Component: Open_Queue,
      },
      {
        path: "open-queue-detail/:id",    
        Component: Assigned_Details,
      },
      {
        path: "investigation/:id",
        Component: Investigation,
      },
      {
        path: "resolve/:id",
        Component: Re_Solve,
      },
      {
        path: "closure/:id",
        Component: Closure,
      },
    ],
  },

  {
    path: "assigned",
    Component: Assigned_Main,
    children: [
      {
        index: true,
        Component: Assigned,
      },
      {
        path: "assigned-details/:id",    
        Component: Assigned_Details,
      },
      {
        path: "investigation/:id",
        Component: Investigation,
      },
      {
        path: "request-info/:id",
        Component: Request_Info,
      },
      {
        path: "resolve/:id",
        Component: Re_Solve,
      },
      {
        path: "closure/:id",
        Component: Closure,
      },
    ],
  },

  {
    path: "review-reopen",
    Component: Review_Reopen_Main,
    children: [
      {
        index: true,
        Component: Review_ReOpens,
      },
      {
        path: "reopen-details/:id",       
        Component: ReOpen_Details,         
      },
      {
        path: "investigation/:id",
        Component: Investigation,
      },
      {
        path: "resolve/:id",
        Component: Re_Solve,
      },
      {
        path: "closure/:id",
        Component: Closure,
      },
    ],
  },

  {
    path: "sla-dashboard",
    Component: SLAMain_Dashboard,
    children: [
      {
        index: true,
        Component: SLA_Dashboard,
      },
      {
        path: "sla-detail/:id",       
        Component: Ticket_Details,
      },
    ],
  },

  {
    path: "notification",
    Component: Notification,
  },

  {
    path: "executive-profile",
    Component: User_Profile,
  },
];