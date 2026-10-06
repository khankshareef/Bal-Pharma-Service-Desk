import { useCallback, useMemo, useState } from "react";
import { FaHospitalUser, FaUsers } from "react-icons/fa";
import { FaUserCheck, FaUserPlus, FaUserTie } from "react-icons/fa6";
import { FiTrash2 } from "react-icons/fi";
import { SiDatabricks } from "react-icons/si";
import { useNavigate } from "react-router-dom";
import Reusable_Button from "../../../component/button/Reusable_Button";
import Reusable_Stat from "../../../component/stats/Reusable_Stat";
import Reusable_Table, { type TableColumn } from "../../../component/table/Reusable_Table";


const User_Management = () => {

  const [currentPage, setCurrentPage] = useState(1);
    const [selectedTickets, setSelectedTickets] = useState<any[]>([]);
     const navigate = useNavigate();
    
    const handleViewTicket = () => {
        navigate(`user-details`);
      };
    
      const ticketsData = useMemo(() => [
        { id: 101, TicketID: "TKT-0010", Subject: "Network connectivity", Category: "Network", Priority: "High", Status: "Open", SLA: "On Track", Date: "02 Sept 2026 16:15" },
        { id: 102, TicketID: "TKT-0025", Subject: "Access permission", Category: "Access & Permissions", Priority: "Low", Status: "In Progress", SLA: "Breached", Date: "02 Sept 2026 16:13" },
        { id: 103, TicketID: "TKT-0033", Subject: "Email sync", Category: "Application", Priority: "Low", Status: "Open", SLA: "At Risk", Date: "02 Sept 2026 15:57" },
        { id: 104, TicketID: "TKT-0002", Subject: "VPN access", Category: "Network", Priority: "Medium", Status: "In Progress", SLA: "At Risk", Date: "02 Sept 2026 15:50" },
        { id: 105, TicketID: "TKT-0015", Subject: "Software installation", Category: "Software", Priority: "Medium", Status: "In Progress", SLA: "At Risk", Date: "02 Sept 2026 15:28" },
        { id: 106, TicketID: "TKT-0042", Subject: "Hardware Failure Report", Category: "Hardware", Priority: "High", Status: "Resolved", SLA: "On Track", Date: "02 Sept 2026 13:00" },
        { id: 107, TicketID: "TKT-0055", Subject: "Server Maintenance", Category: "Infrastructure", Priority: "High", Status: "In Progress", SLA: "On Track", Date: "03 Sept 2026 11:30" },
        { id: 108, TicketID: "TKT-0061", Subject: "User Access Request", Category: "Access & Permissions", Priority: "High", Status: "Open", SLA: "Breached", Date: "04 Sept 2026 08:20" },
        { id: 109, TicketID: "TKT-0078", Subject: "Data Backup Issue", Category: "Database", Priority: "Medium", Status: "In Progress", SLA: "On Track", Date: "04 Sept 2026 14:10" },
        { id: 110, TicketID: "TKT-0089", Subject: "Software Update Request", Category: "Software", Priority: "Low", Status: "Open", SLA: "On Track", Date: "05 Sept 2026 16:05" },
        { id: 111, TicketID: "TKT-0092", Subject: "Performance Optimization", Category: "Network", Priority: "Medium", Status: "Resolved", SLA: "On Track", Date: "06 Sept 2026 09:00" },
        { id: 112, TicketID: "TKT-0105", Subject: "Security Patch Installation", Category: "Security", Priority: "High", Status: "In Progress", SLA:"Breached", Date: "06 Sept 2026 11:25" },
      ], []);
    
      const ticketsColumns: TableColumn<typeof ticketsData[0]>[] = useMemo(() => [
        { key: "TicketID", label: "Ticket ID", type: "text" },
        { key: "Subject", label: "Subject", type: "text" },
        { key: "Category", label: "Category", type: "text" },
        { key: "Priority", label: "Priority", type: "badge" },
        { key: "Status", label: "Status", type: "badge" },
        { key: "SLA", label: "SLA", type: "sla" },
        { key: "Date", label: "Date", type: "text"},
      ], []);
    
      const handleSelectionChange = useCallback((selected: typeof ticketsData) => {
        setSelectedTickets(selected);
      }, []);
      
  return (
    <div>
      <p className="text-2xl font-bold text-gray-800 mb-8">User Management</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <Reusable_Stat
        title="Total User"
        value={52}
        icon={FaUsers}
        />
        <Reusable_Stat
        title="Active"
        value={48}
        icon={FaUserCheck}
        />
        <Reusable_Stat
        title="Employees"
        value={36}
        icon={FaHospitalUser}
        />
        <Reusable_Stat
        title="Exicutive"
        value={14}
        icon={FaUserTie}
        />
      </div>

       <div className="flex justify-between items-center mb-4 px-1 mt-8 mb-8">
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">Users</h2>

              <div className="flex items-center gap-2">
                <Reusable_Button
                onClick={() => navigate('add-user')}
              children = "Add User"
              variant="primary"
              leftIcon = {<FaUserPlus/>}
              />

              <Reusable_Button
              children = "Bulk Ops"
              variant="secondary"
              leftIcon = {<SiDatabricks/>}
              />
              
              </div>
              {selectedTickets.length > 0 && (
                <button 
                  className="flex items-center gap-2 bg-rose-50 text-rose-600 border border-rose-200 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-rose-600 hover:text-white transition-colors duration-200 shadow-sm cursor-pointer"
                  onClick={() => alert(`Deleting ${selectedTickets.length} tickets!`)}
                >
                  <FiTrash2 size={16} />
                  Delete {selectedTickets.length} Selected
                </button>
              )}
            </div>

             <Reusable_Table 
        columns={ticketsColumns} 
        data={ticketsData} 
        enableSelection={true}
        idKey="id" 
        onSelectionChange={handleSelectionChange}
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
        itemsPerPage={6}
        currentPage={currentPage}
        onPageChange={(page) => setCurrentPage(page)}
        showSearch={true}
        showFilters={true}
        showColumnControls={true}
        showExport={true}
        showPagination={true}
        showActions={true}
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
  )
}

export default User_Management