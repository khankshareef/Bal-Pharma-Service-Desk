import { useEffect, useMemo, useState } from "react";
import { FaPlus } from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";

import Reusable_Button from "../../../component/button/Reusable_Button";
import Add_Unit_Model from "../../../component/common/model/Add_Unit_Model";
import Reusable_Stat from "../../../component/stats/Reusable_Stat";
import Reusable_Table, {
  type TableColumn,
} from "../../../component/table/Reusable_Table";

import Loader from "../../../component/loader/Loader";
import type { AppDispatch, RootState } from "../../../store/store/Store";
import {
  deleteUnit,
  fetchUnits,
  type Unit,
} from "../../../store/super_admin/slice/UnitSlice";

interface UnitRow {
  id: number;
  UnitID: string;
  UnitName: string;
  Location: string;
  Users: number;
  Executives: number;
  Status: string;
}

const Unit_Management = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { units: apiUnits, loading } = useSelector(
    (s: RootState) => s.unit
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [isModelOpen, setModelOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);

  useEffect(() => {
    dispatch(fetchUnits());
  }, [dispatch]);

  const unitData: UnitRow[] = useMemo(
    () =>
      apiUnits.map((u) => ({
        id: u.id ?? 0,
        UnitID: u.unitCode,
        UnitName: u.unitName,
        Location: u.address,
        Users: 0,         
        Executives: 0,
        Status: u.active === false ? "Inactive" : "Active",
      })),
    [apiUnits]
  );

  const stats = useMemo(() => {
    const total = unitData.length;
    const active = unitData.filter((u) => u.Status === "Active").length;
    const users = unitData.reduce((sum, u) => sum + u.Users, 0);
    return { total, active, users };
  }, [unitData]);

  const unitColumns: TableColumn<UnitRow>[] = useMemo(
    () => [
      { key: "UnitID", label: "Unit ID", type: "text" },
      { key: "UnitName", label: "Unit Name", type: "text" },
      { key: "Location", label: "Location", type: "text" },
      { key: "Users", label: "Users", type: "text" },
      { key: "Executives", label: "Executives", type: "text" },
      { key: "Status", label: "Status", type: "badge" },
    ],
    []
  );

  const handleAdd = () => {
    setEditingUnit(null);
    setModelOpen(true);
  };

  const handleEdit = (row: UnitRow) => {
    const full = apiUnits.find((u) => u.id === row.id) ?? null;
    setEditingUnit(full);
    setModelOpen(true);
  };

  const handleDelete = async (row: UnitRow) => {
    if (!confirm(`Delete unit "${row.UnitName}" (${row.UnitID})?`)) return;
    try {
      await dispatch(deleteUnit(row.id)).unwrap();
    } catch (err: any) {
      alert(err?.error || err?.message || "Failed to delete unit.");
    }
  };

  const handleCloseModal = () => {
    setModelOpen(false);
    setEditingUnit(null);
  };

  if (loading && unitData.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto font-sans">
      <div className="flex justify-between items-end mb-6">
        <h1 className="text-2xl font-bold text-[#002D5B]">Unit Management</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <Reusable_Stat title="Total Units" value={String(stats.total)} />
        <Reusable_Stat title="Active Units" value={String(stats.active)} />
        <Reusable_Stat title="Total Users" value={String(stats.users)} />
      </div>

      <div>
        <div className="flex justify-between items-center mb-4 px-2">
          <h2 className="text-lg font-bold text-gray-900">Units</h2>
          <Reusable_Button
            onClick={handleAdd}
            children="Add Unit"
            variant="primary"
            leftIcon={<FaPlus />}
          />
        </div>

        {loading && unitData.length === 0 ? (
          <div className="text-center py-12 text-gray-500">Loading units…</div>
        ) : (
          <Reusable_Table
            columns={unitColumns}
            data={unitData}
            idKey="id"
            itemsPerPage={8}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            actions={{
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
        )}
      </div>

      {isModelOpen && (
        <Add_Unit_Model
          isOpen={isModelOpen}
          onClose={handleCloseModal}
          unitToEdit={editingUnit}
          onSaved={() => dispatch(fetchUnits())}
        />
      )}
    </div>
  );
};

export default Unit_Management;