import { useEffect, useMemo, useState } from "react";
import { FaPlus } from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";

import Reusable_Button from "../../../component/button/Reusable_Button";
import Add_Department_Model from "../../../component/common/model/Add_Department_Model";
import Reusable_Stat from "../../../component/stats/Reusable_Stat";
import Reusable_Table, {
  type TableColumn,
} from "../../../component/table/Reusable_Table";

import type { AppDispatch, RootState } from "../../../store/store/Store";
import {
  deleteDepartment,
  fetchDepartments,
  fetchDepartmentStats,
  type Department,
} from "../../../store/super_admin/slice/DepartmentSlice";

interface DeptRow {
  id: number;
  DeptID: string;
  DeptName: string;
  Unit: string;
  UnitLabel: React.ReactNode;
  Users: number;
  Status: string;
}

const Departments = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { departments, stats, loading } = useSelector(
    (s: RootState) => s.departments
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);

  useEffect(() => {
    dispatch(fetchDepartments());
    dispatch(fetchDepartmentStats());
  }, [dispatch]);

  const deptData: DeptRow[] = useMemo(
    () =>
      departments.map((d) => {
        const isAllUnits = d.unitId == null;
        const label = d.unitName || "All Units";
        const color = isAllUnits
          ? "bg-[#F3E8FF] text-[#6B21A8]"
          : "bg-[#FEF3C7] text-[#92400E]";
        return {
          id: d.id,
          DeptID: d.departmentCode,
          DeptName: d.name,
          Unit: label,
          UnitLabel: (
  <span className={`px-3 py-1 text-xs font-semibold ${color} rounded-full`}>
    {isAllUnits ? "All Units" : label}
  </span>
),
          Users: d.users,
          Status: d.active ? "Active" : "Inactive",
        };
      }),
    [departments]
  );

  const deptColumns: TableColumn<DeptRow>[] = useMemo(
    () => [
      { key: "DeptID",   label: "Department ID",   type: "text" },
      { key: "DeptName", label: "Department Name", type: "text" },
      { key: "UnitLabel",label: "Unit",            type: "text" },
      { key: "Users",    label: "Users",           type: "text" },
      { key: "Status",   label: "Status",          type: "badge" },
    ],
    []
  );

  const handleAdd = () => {
    setEditing(null);
    setIsOpen(true);
  };

  const handleEdit = (row: DeptRow) => {
    const full = departments.find((d) => d.id === row.id) ?? null;
    setEditing(full);
    setIsOpen(true);
  };

  const handleDelete = async (row: DeptRow) => {
    if (!confirm(`Delete department "${row.DeptName}"?`)) return;
    try {
      await dispatch(deleteDepartment(row.id)).unwrap();
      dispatch(fetchDepartmentStats());
    } catch (err: any) {
      alert(err?.error || err?.message || "Failed to delete department.");
    }
  };

  const handleCloseModal = () => {
    setIsOpen(false);
    setEditing(null);
  };

  return (
    <div className="max-w-full mx-auto font-sans">
      <div className="flex justify-between items-end mb-6">
        <h1 className="text-2xl font-bold text-[#002D5B]">
          Department Management
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
        <Reusable_Stat title="Total Departments" value={String(stats?.total ?? 0)} />
        <Reusable_Stat title="Active"            value={String(stats?.active ?? 0)} />
        <Reusable_Stat title="Inactive"          value={String(stats?.inactive ?? 0)} />
        <Reusable_Stat title="Assigned Users"    value={String(stats?.assignedUsers ?? 0)} />
      </div>

      <div>
        <div className="flex justify-between items-center mb-4 px-2">
          <h2 className="text-lg font-bold text-gray-900">
            Departments{" "}
            {loading && departments.length === 0 && (
              <span className="text-sm text-gray-400 font-normal ml-2">
                loading…
              </span>
            )}
          </h2>
          <Reusable_Button
            onClick={handleAdd}
            children="Add Department"
            variant="primary"
            leftIcon={<FaPlus />}
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
            showView: false,
            showEdit: true,
            showDelete: true,
            onEdit: handleEdit,
            onDelete: handleDelete,
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
          onClose={handleCloseModal}
          departmentToEdit={editing}
          onSaved={() => dispatch(fetchDepartmentStats())}
        />
      )}
    </div>
  );
};

export default Departments;