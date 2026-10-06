import { useMemo, useState } from "react";
import { FiGlobe } from "react-icons/fi";
import { HiOutlineOfficeBuilding } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import Reusable_Table, { type TableColumn } from "../../../component/table/Reusable_Table";

const All_Tickets = () => {
   const [currentPage, setCurrentPage] = useState(1);
   const navigate = useNavigate();
  const ticketData = useMemo(() => [
    { 
      id: 1, TicketID: <span className="font-bold text-gray-900">TKT-<br/>0001</span>, Subject: <span className="text-gray-800">Printer not<br/>responding</span>, Category: "Hardware", 
      Priority: <span className="px-3 py-1 text-xs font-semibold bg-[#FEE2E2] text-[#B91C1C] rounded-full">High</span>, 
      Unit: <div className="inline-flex flex-col items-center bg-[#FEF3C7] text-[#92400E] px-3 py-0.5 rounded-full text-xs font-semibold leading-tight"><span>unit 2</span><span>BommaSandara</span></div>, 
      Status: <span className="px-3 py-1 text-xs font-semibold bg-[#FEF3C7] text-[#92400E] rounded-full">Open</span>, 
      CreatedBy: "Employee", AssignedTo: "Exec_Pune1", Date: <span className="text-gray-600 text-sm">06-Aug-2026<br/>09:30</span>, 
    },
    { 
      id: 2, TicketID: <span className="font-bold text-gray-900">TKT-<br/>0002</span>, Subject: <span className="text-gray-800">VPN connection<br/>failed</span>, Category: "Network", 
      Priority: <span className="px-3 py-1 text-xs font-semibold bg-[#FEF3C7] text-[#92400E] rounded-full">Medium</span>, 
      Unit: <div className="inline-flex flex-col items-center bg-[#FEF3C7] text-[#92400E] px-3 py-0.5 rounded-full text-xs font-semibold leading-tight"><span>unit 2</span><span>BommaSandara</span></div>, 
      Status: <span className="px-3 py-1 text-xs font-semibold bg-[#DBEAFE] text-[#1D4ED8] rounded-full">In Progress</span>, 
      CreatedBy: "Employee", AssignedTo: "Exec_Pune2", Date: <span className="text-gray-600 text-sm">05-Aug-2026<br/>14:20</span>, 
    },
    { 
      id: 3, TicketID: <span className="font-bold text-gray-900">TKT-<br/>0033</span>, Subject: "Email sync issue", Category: "Application", 
      Priority: <span className="px-3 py-1 text-xs font-semibold bg-[#DBEAFE] text-[#1D4ED8] rounded-full">Low</span>, 
      Unit: <div className="inline-flex flex-col items-center bg-[#FEF3C7] text-[#92400E] px-3 py-0.5 rounded-full text-xs font-semibold leading-tight"><span>unit 2</span><span>BommaSandara</span></div>, 
      Status: <span className="px-3 py-1 text-xs font-semibold bg-[#DCFCE7] text-[#166534] rounded-full">Resolved</span>, 
      CreatedBy: "Employee", AssignedTo: "Exec_Pune1", Date: <span className="text-gray-600 text-sm">04-Aug-2026<br/>11:45</span>, 
    },
    { 
      id: 4, TicketID: <span className="font-bold text-gray-900">TKT-<br/>0010</span>, Subject: <span className="text-gray-800">Network<br/>connectivity</span>, Category: "Network", 
      Priority: <span className="px-3 py-1 text-xs font-semibold bg-[#FEE2E2] text-[#B91C1C] rounded-full">High</span>, 
      Unit: <div className="inline-flex flex-col items-center bg-[#FEF3C7] text-[#92400E] px-3 py-0.5 rounded-full text-xs font-semibold leading-tight"><span>unit 2</span><span>BommaSandara</span></div>, 
      Status: <span className="px-3 py-1 text-xs font-semibold bg-[#DBEAFE] text-[#1D4ED8] rounded-full">In Progress</span>, 
      CreatedBy: "Employee", AssignedTo: "Exec_Pune1", Date: <span className="text-gray-600 text-sm">06-Aug-2026<br/>08:00</span>, 
    },
    { 
      id: 5, TicketID: <span className="font-bold text-gray-900">TKT-<br/>0101</span>, Subject: "Network outage", Category: "Network", 
      Priority: <span className="px-3 py-1 text-xs font-semibold bg-[#FEE2E2] text-[#B91C1C] rounded-full">High</span>, 
      Unit: <span className="px-3 py-1 text-xs font-semibold bg-[#FEF3C7] text-[#92400E] rounded-full">Unit 1</span>, 
      Status: <span className="px-3 py-1 text-xs font-semibold bg-[#DCFCE7] text-[#166534] rounded-full">Closed</span>, 
      CreatedBy: "Employee", AssignedTo: "Exec_Mumbai1", Date: <span className="text-gray-600 text-sm">05-Aug-2026<br/>15:30</span>, 
    },
  ], []);

  const handleViewTicket = () => {
        navigate(`user-details`);
      };

  

  const ticketColumns: TableColumn<typeof ticketData[0]>[] = useMemo(() => [
    { key: "TicketID", label: "Ticket ID", type: "text" },
    { key: "Subject", label: "Subject", type: "text" },
    { key: "Category", label: "Category", type: "text" },
    { key: "Priority", label: "Priority", type: "text" },
    { key: "Unit", label: "Unit", type: "text" },
    { key: "Status", label: "Status", type: "text" },
    { key: "CreatedBy", label: "Created By", type: "text" },
    { key: "AssignedTo", label: "Assigned To", type: "text" },
    { key: "Date", label: "Date", type: "text" },
  ], []);

  return (
    <div className="max-w-full mx-auto font-sans">
      
      <div className="flex justify-between items-end mb-6">
        <h1 className="text-2xl font-bold text-[#002D5B]">All Tickets Overview</h1>
      </div>

      <div className="bg-[#F4F8FB] border border-[#E1EAF4] rounded-xl p-4 flex items-center gap-4 flex-wrap mb-6">
        <div className="flex items-center gap-2 text-[#003D8C] font-semibold text-sm pl-2">
          <HiOutlineOfficeBuilding size={18} /> Filter by Unit:
        </div>
        <select className="px-4 py-2 w-48 border border-gray-200 rounded-full text-sm text-gray-700 bg-white focus:outline-none focus:border-[#002D5B] cursor-pointer">
          <option>All Units</option>
        </select>
        <div className="flex items-center gap-2 text-gray-500 text-sm ml-2">
          <FiGlobe size={16} /> Super Manager has visibility across all units
        </div>
      </div>

      <div className="">
        <Reusable_Table 
         onPageChange={(page) => setCurrentPage(page)}
          columns={ticketColumns} data={ticketData} idKey="id"
        enableSelection={false}
        itemsPerPage={6}
        currentPage={currentPage}
        showSearch={true}
        showFilters={true}
        showColumnControls={true}
        showExport={true}
        showPagination={true}
        showActions={true}
        actions={{
          showView: true,
          showEdit: false,
          showDelete: false,
          showReopen: false, 
          onView: handleViewTicket,
          onEdit: () => {
            navigate('../create-ticket')
          },
          onDelete: (row) => alert(`Deleting ticket ID: ${row.TicketID}`),
          onReopen: () => {
            navigate("reopen-ticket")
          },
          onRowClick: () => {
            navigate(`user-details`);
          }
        }}
        filters={[
          {
            key: "Priority",
            label: "Priority",
            options: ["High", "Medium", "Low"]
          },
          {
            key: "Status",
            label: "Status",
            options: ["Open", "In Progress", "Resolved", "Closed"]
          },
          {
            key: "Category",
            label: "Category",
            options: ["Network", "Hardware", "Software", "Application", "Security", "Database", "Infrastructure", "Access & Permissions"]
          }
        ]}
        />
      </div>

    </div>
  );
};

export default All_Tickets;