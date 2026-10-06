import { useMemo, useState } from "react";
import { FaPlus } from "react-icons/fa6";
import Reusable_Button from "../../../component/button/Reusable_Button";
import Add_Unit_Model from "../../../component/common/model/Add_Unit_Model";
import Reusable_Stat from "../../../component/stats/Reusable_Stat";
import Reusable_Table, { type TableColumn } from "../../../component/table/Reusable_Table";


const Unit_Management = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isModelOpen,setModelOpen] = useState(false);

  const unitData = useMemo(() => [
    { id: 1, UnitID: "UNIT001", UnitName: "Unit 1", Location: "Bommasandra", Users: 8, Executives: 3, Status: "Active" },
    { id: 2, UnitID: "UNIT002", UnitName: "Unit 2", Location: "Bommasandra", Users: 12, Executives: 3, Status: "Active" },
    { id: 3, UnitID: "UNIT003", UnitName: "BHO", Location: "Bengaluru", Users: 10, Executives: 2, Status: "Active" },
    { id: 4, UnitID: "UNIT004", UnitName: "Unit 4", Location: "Rudrapur", Users: 9, Executives: 2, Status: "Active" },
    { id: 5, UnitID: "UNIT005", UnitName: "Unit 5", Location: "Sangli", Users: 7, Executives: 2, Status: "Active" },
    { id: 6, UnitID: "UNIT006", UnitName: "Unit 6", Location: "Udaipur", Users: 6, Executives: 2, Status: "Active" },
    { id: 7, UnitID: "UNIT007", UnitName: "CWH", Location: "Bommasandra", Users: 7, Executives: 2, Status: "Active" },
    { id: 8, UnitID: "UNIT008", UnitName: "GGM", Location: "GuruGram", Users: 6, Executives: 2, Status: "Active" },
  ], []);

  const unitColumns: TableColumn<typeof unitData[0]>[] = useMemo(() => [
    { key: "UnitID", label: "Unit ID", type: "text" },
    { key: "UnitName", label: "Unit Name", type: "text" },
    { key: "Location", label: "Location", type: "text" },
    { key: "Users", label: "Users", type: "text" },
    { key: "Executives", label: "Executives", type: "text" },
    { key: "Status", label: "Status", type: "badge" },
  ], []);

  return (
    <div className="max-w-full mx-auto font-sans">
      
      <div className="flex justify-between items-end mb-6">
        <h1 className="text-2xl font-bold text-[#002D5B]">Unit Management</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <Reusable_Stat title="Total Units" value="8" />
        <Reusable_Stat title="Active Units" value="8" />
        <Reusable_Stat title="Total Users" value="52" />
      </div>

      <div className="">
        <div className="flex justify-between items-center mb-4 px-2">
          <h2 className="text-lg font-bold text-gray-900">Units</h2>
          <Reusable_Button
          onClick={()=>setModelOpen(true)}
          children = "Add Unit"
          variant="primary"
          leftIcon = {<FaPlus/>}
          />
        </div>

        <Reusable_Table 
          columns={unitColumns} 
          data={unitData} 
          idKey="id"
          itemsPerPage={8}
          currentPage={currentPage}
          onPageChange={(page) => setCurrentPage(page)}
          actions={{
            showEdit: true,
            showDelete: true,
            onEdit: (row) => alert(`Edit ${row.UnitID}`),
            onDelete: (row) => alert(`Delete ${row.UnitID}`)
          }}
          showSearch={false}
          showFilters={false}
          showExport={true}
          showPagination={false}
          enableSelection={false}
        />
      </div>
      {isModelOpen && (
        <Add_Unit_Model
        isOpen={isModelOpen}
        onClose={() => setModelOpen(false)}
        />
      )}
    </div>
  );
};

export default Unit_Management;