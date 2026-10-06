import { useMemo, useState } from "react";
import Reusable_Table, { type TableColumn } from "../../../component/table/Reusable_Table";

const Audit_Log = () => {
  const [currentPage, setCurrentPage] = useState(1);

  const auditData = useMemo(() => [
    { id: 1, Timestamp: "07 Sept 2026 16:25", User: "Kumar (SM)", Action: "Password reset for user", Type: "Admin", Unit: "All", Details: "Password reset for user" },
    { id: 2, Timestamp: "10-Aug-2026 09:15 AM", User: "Kumar (SM)", Action: "Password Reset", Type: "Security", Unit: "Unit 2", Details: "Reset password for EMP021" },
    { id: 3, Timestamp: "10-Aug-2026 08:45 AM", User: "Kumar (SM)", Action: "User Created", Type: "User", Unit: "Unit 3", Details: "Created new user EMP048" },
    { id: 4, Timestamp: "09-Aug-2026 06:20 PM", User: "Kumar (SM)", Action: "Department Updated", Type: "System", Unit: "All", Details: "Updated Production department" },
    { id: 5, Timestamp: "08-Aug-2026 11:10 AM", User: "Ravi (Admin)", Action: "Role Changed", Type: "Admin", Unit: "Unit 2", Details: "Changed EMP010 role to Admin" },
    { id: 6, Timestamp: "08-Aug-2026 09:00 AM", User: "Kumar (SM)", Action: "System Login", Type: "System", Unit: "All", Details: "Super Manager logged in" },
  ], []);

  const auditColumns: TableColumn<typeof auditData[0]>[] = useMemo(() => [
    { key: "Timestamp", label: "Timestamp", type: "text" },
    { key: "User", label: "User", type: "text" },
    { key: "Action", label: "Action", type: "text" },
    { key: "Type", label: "Type", type: "badge" },
    { key: "Unit", label: "Unit", type: "badge" },
    { key: "Details", label: "Details", type: "text" },
  ], []);

  return (
    <div className="max-w-full mx-autofont-sans">
      
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#002D5B]">Audit Log</h1>
        </div>
      </div>

      <div>
        <Reusable_Table 
          columns={auditColumns} 
          data={auditData} 
          idKey="id" 
          itemsPerPage={10}
          currentPage={currentPage}
          onPageChange={(page) => setCurrentPage(page)}
          showSearch={true}
          showFilters={true}
          showColumnControls={true}
          showExport={true}
          showPagination={true}
          showActions={false}
          enableSelection={false}
          filters={[
            {
              key: "Type",
              label: "All Types",
              options: ["Admin", "Security", "User", "System"]
            },
            {
              key: "Unit",
              label: "All Units",
              options: ["All", "Unit 2", "Unit 3"]
            }
          ]}
        />
      </div>

    </div>
  );
};

export default Audit_Log;