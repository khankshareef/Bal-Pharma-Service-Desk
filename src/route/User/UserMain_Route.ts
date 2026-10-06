import Create_Ticket from "../../page/User/create_ticket/Create_Ticket";
import Dashboard from "../../page/User/dashboard/Dashboard";
import My_Tickets from "../../page/User/my_ticket/My_Tickets";
import Myticket_Main from "../../page/User/my_ticket/Myticket_Main";
import Reopen_Ticket from "../../page/User/my_ticket/Reopen_Ticket";
import Ticket_Details from "../../page/User/my_ticket/Ticket_Details";
import User_Notification from "../../page/User/notification/User_Notification";
import User_Profile from "../../page/User/user_profile/User_Profile";

export const UserMain_Route =  ([
            {
                path : "dashboard",
                Component: Dashboard,
            },
            {
        path: "create-ticket",
        Component: Create_Ticket,
    },
    {
        path: "edit-ticket/:id",
        Component: Create_Ticket,        
      },
    {
        path: "my-tickets",
        Component: Myticket_Main,
        children: [
            {
               index: true,
        Component: My_Tickets,
            },
            {
            path: "tkt-details/:id",
            Component: Ticket_Details,
            },
            {
                path: "reopen-ticket/:id",
                Component: Reopen_Ticket,
            }
        ]
    },
      {
    path: "notification",
    Component: User_Notification,
  },
    {
        path:"employee-profile",
        Component:User_Profile,
    }
])