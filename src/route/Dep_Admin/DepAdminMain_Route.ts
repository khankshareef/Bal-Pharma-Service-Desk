import Departments from "../..//page/Super_Admin/departments/Departments";
import All_Feedbacks from "../../page/Super_Admin/all_feedbacks/All_Feedbacks";
import AllFeedBack_Main from "../../page/Super_Admin/all_feedbacks/AllFeedBack_Main";
import { default as AdminTicket_Detail, default as Ticket_Details } from "../../page/Super_Admin/all_tickets/AdminTicket_Detail";
import User_Details from "../../page/Super_Admin/all_tickets/adminUser_Details";
import All_Tickets from "../../page/Super_Admin/all_tickets/All_Tickets";
import All_Tickets_Main from "../../page/Super_Admin/all_tickets/All_Tickets_Main";
import Audit_Log from "../../page/Super_Admin/audit_log/Audit_Log";
import Categories from "../../page/Super_Admin/categories/Categories";
import Dashboard from "../../page/Super_Admin/dashboard/Dashboard";
import Template_Management from "../../page/Super_Admin/Template_Management/Template_Management";
import Unit_Management from "../../page/Super_Admin/unit_management/Unit_Management";
import Add_User from "../../page/Super_Admin/user_management/Add_User";
import User_Management from "../../page/Super_Admin/user_management/User_Management";
import UserManagement_Main from "../../page/Super_Admin/user_management/User_ManagementMain";
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
        path:"user-details/:id",
        Component: User_Details,
    },
    {
        path:"add-user",
        Component: Add_User,
    },
    {
        path:"edit-user/:id",
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
        path: "tkt-details/:id",
        Component : Ticket_Details,
    },
        ]
    },
    
     {
        path:"all-feedback",
        Component : AllFeedBack_Main,
        children : [
            {
        index: true,
        Component : All_Feedbacks,
    },
    {
        path: "tkt-details/:id",
        Component : AdminTicket_Detail,
    },
        ]
    },
    {
        path: 'deuputy-manager-profile',
        Component: User_Profile,
    }
])