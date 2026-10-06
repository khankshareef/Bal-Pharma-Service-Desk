import Audit_Log from "../../page/Dep_Admin/audit_log/Audit_Log";
import Categories from "../../page/Dep_Admin/categories/Categories";
import Dashboard from "../../page/Dep_Admin/dashboard/Dashboard";
import Departments from "../../page/Dep_Admin/departments/Departments";
import All_Tickets from "../../page/Dep_Admin/tickets/All_Tickets";
import All_Tickets_Main from "../../page/Dep_Admin/tickets/All_Tickets_Main";
import Ticket_Details from "../../page/Dep_Admin/tickets/Ticket_Details";
import Unit_Management from "../../page/Dep_Admin/unit_management/Unit_Management";
import Add_User from "../../page/Dep_Admin/users_management/Add_User";
import User_Details from "../../page/Dep_Admin/users_management/User_Details";
import User_Management from "../../page/Dep_Admin/users_management/User_Management";
import UserManagement_Main from "../../page/Dep_Admin/users_management/UserManagement_Main";
import All_Feedbacks from "../../page/Super_Admin/all_feedbacks/All_Feedbacks";
import Template_Management from "../../page/Super_Admin/Template_Management/Template_Management";
import User_Profile from "../../page/User/user_profile/User_Profile";


export const DepAdminMain_Route =  ([    
    {
        path:"dashboard",
        Component : Dashboard,
    },
    {
        path:"user-management",
        Component : UserManagement_Main,
        children : [
            {
        index:true,
        Component : User_Management,
    },
    {
        path:"user-details",
        Component: User_Details,
    },
    {
        path:"add-user",
        Component: Add_User,
    }
        ]
    },
    
    {
        path:"audit-log",
        Component : Audit_Log,
    },
    {
        path:"unit-management",
        Component : Unit_Management,
    },
    {
        path:"template-management",
        Component : Template_Management,
    },
    {
        path:"department",
        Component : Departments,
    },
    {
        path:"categories",
        Component : Categories,
    },
    {
        path:"all-tickets",
        Component : All_Tickets_Main,
        children : [
            {
        index: true,
        Component : All_Tickets
    },
    {
        path: "user-details",
        Component : Ticket_Details,
    },
        ]
    },
    
    {
        path:"all-feedback",
        Component : All_Feedbacks,
    },
    {
        path: 'deuputy-manager-profile',
        Componrnt: User_Profile,
    }
])