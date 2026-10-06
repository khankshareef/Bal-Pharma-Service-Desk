import { useMemo, useState } from "react";
import { FaPlus } from "react-icons/fa6";
import Reusable_Button from "../../../component/button/Reusable_Button";
import Add_Department_Model from "../../../component/common/model/Add_Department_Model";
import Reusable_Stat from "../../../component/stats/Reusable_Stat";
import Reusable_Table, { type TableColumn } from "../../../component/table/Reusable_Table";


const Departments = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isOpen,setIsOpen] = useState(false);

  const deptData = useMemo(() => [
    { id: 1, DeptID: "DEP001", DeptName: "IT", Unit: <span className="px-3 py-1 text-xs font-semibold bg-[#F3E8FF] text-[#6B21A8] rounded-full">All</span>, Users: 8, Status: "Active" },
    { id: 2, DeptID: "DEP002", DeptName: "QA", Unit: <span className="px-3 py-1 text-xs font-semibold bg-[#FEF3C7] text-[#92400E] rounded-full">Unit 2</span>, Users: 6, Status: "Active" },
    { id: 3, DeptID: "DEP003", DeptName: "Production", Unit: <span className="px-3 py-1 text-xs font-semibold bg-[#FFEDD5] text-[#C2410C] rounded-full">BHO</span>, Users: 15, Status: "Active" },
    { id: 4, DeptID: "DEP004", DeptName: "Finance", Unit: <span className="px-3 py-1 text-xs font-semibold bg-[#FEF3C7] text-[#92400E] rounded-full">Corporate</span>, Users: 4, Status: "Active" },
    { id: 5, DeptID: "DEP008", DeptName: "R&D", Unit: <span className="px-3 py-1 text-xs font-semibold bg-[#FEF3C7] text-[#92400E] rounded-full">Unit 4</span>, Users: 4, Status: "Inactive" },
  ], []);

  const deptColumns: TableColumn<typeof deptData[0]>[] = useMemo(() => [
    { key: "DeptID", label: "Department ID", type: "text" },
    { key: "DeptName", label: "Department Name", type: "text" },
    { key: "Unit", label: "Unit", type: "text" }, 
    { key: "Users", label: "Users", type: "text" },
    { key: "Status", label: "Status", type: "badge" },
  ], []);

  return (
    <div className="max-w-full mx-auto font-sans">
      
      <div className="flex justify-between items-end mb-6">
        <h1 className="text-2xl font-bold text-[#002D5B]">Department Management</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
        <Reusable_Stat title="Total Departments" value="5" />
        <Reusable_Stat title="Active" value="4" />
        <Reusable_Stat title="Inactive" value="1" />
        <Reusable_Stat title="Assigned Users" value="52" />
      </div>

      <div className="">
        <div className="flex justify-between items-center mb-4 px-2">
          <h2 className="text-lg font-bold text-gray-900">Departments</h2>
          <Reusable_Button
          onClick={() => setIsOpen(true)}
          children = "Add Department"
          variant="primary"
          leftIcon = {<FaPlus/>}
          />
        </div>

        <Reusable_Table 
          columns={deptColumns} 
          data={deptData} 
          idKey="id"
          itemsPerPage={5}
          currentPage={currentPage}
          onPageChange={(page) => setCurrentPage(page)}
          actions={{
            showView: true,
            showDelete: true,
            onView: (row) => alert(`View ${row.DeptID}`),
            onDelete: (row) => alert(`Delete ${row.DeptID}`)
          }}
          showSearch={false}
          showFilters={false}
          showExport={true}
          showPagination={false}
          enableSelection={false}
        />
      </div>

      {isOpen && (
        <Add_Department_Model
        isOpen={isOpen}
        onClose={()=>setIsOpen(false)}
        />
      )}

    </div>
  );
};

export default Departments;