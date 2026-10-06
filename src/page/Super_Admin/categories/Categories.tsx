import { useEffect, useMemo, useState } from "react";
import { FaPlus } from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";

import Reusable_Button from "../../../component/button/Reusable_Button";
import Add_Category_Model from "../../../component/common/model/Add_Category_Model";
import Reusable_Stat from "../../../component/stats/Reusable_Stat";
import Reusable_Table, {
  type TableColumn,
} from "../../../component/table/Reusable_Table";

import type { AppDispatch, RootState } from "../../../store/store/Store";
import {
  deleteCategory,
  fetchCategories,
  fetchCategoryStats,
  type Category,
} from "../../../store/super_admin/slice/CategorySlice";

interface CatRow {
  id: number;
  CatID: string;
  CatName: string;
  SubCategories: React.ReactNode;
  Scope: React.ReactNode;
  Tickets: number;
  Status: string;
}

const Categories = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { categories, stats, loading } = useSelector(
    (s: RootState) => s.categories
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [isModelOpen, setModelOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchCategoryStats());
  }, [dispatch]);

  const catData: CatRow[] = useMemo(
    () =>
      categories.map((c) => ({
        id: c.id,
        CatID: c.categoryCode,
        CatName: c.name,
        SubCategories: (
  <span className="px-3 py-1 text-xs font-semibold bg-[#F3E8FF] text-[#6B21A8] rounded-full">
    {c.subCategories?.length
      ? c.subCategories
          .map((s: any) => (typeof s === "string" ? s : s.name))
          .join(", ")
      : "—"}
  </span>
),
        Scope: (
          <span className="px-3 py-1 text-xs font-semibold bg-[#F3E8FF] text-[#6B21A8] rounded-full">
            {c.scope ?? "All Units"}
          </span>
        ),
        Tickets: c.ticketCount ?? 0,
        Status: c.active ? "Active" : "Inactive",
      })),
    [categories]
  );

  const catColumns: TableColumn<CatRow>[] = useMemo(
    () => [
      { key: "CatID",         label: "Category ID",    type: "text" },
      { key: "CatName",       label: "Category Name",  type: "text" },
      { key: "SubCategories", label: "Sub-Categories", type: "text" },
      { key: "Scope",         label: "Scope",          type: "text" },
      { key: "Tickets",       label: "Tickets",        type: "text" },
      { key: "Status",        label: "Status",         type: "badge" },
    ],
    []
  );

  const handleAdd = () => {
    setEditing(null);
    setModelOpen(true);
  };

  const handleView = (row: CatRow) => {
    // optional: navigate to a details page
    alert(`View ${row.CatID}`);
  };

  const handleEdit = (row: CatRow) => {
    const full = categories.find((c) => c.id === row.id) ?? null;
    setEditing(full);
    setModelOpen(true);
  };

  const handleDelete = async (row: CatRow) => {
    if (!confirm(`Delete category "${row.CatName}"?`)) return;
    try {
      await dispatch(deleteCategory(row.id)).unwrap();
      dispatch(fetchCategoryStats());
    } catch (err: any) {
      alert(err?.error || err?.message || "Failed to delete category.");
    }
  };

  const handleCloseModal = () => {
    setModelOpen(false);
    setEditing(null);
  };

  return (
    <div className="max-w-full mx-auto font-sans">
      <div className="flex justify-between items-end mb-6">
        <h1 className="text-2xl font-bold text-[#002D5B]">
          Category Management
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
        <Reusable_Stat title="Total Categories" value={String(stats?.total ?? 0)} />
        <Reusable_Stat title="Active"           value={String(stats?.active ?? 0)} />
        <Reusable_Stat title="Inactive"         value={String(stats?.inactive ?? 0)} />
        <Reusable_Stat title="Sub-Categories"   value={String(stats?.totalSubCategories ?? 0)} />
      </div>

      <div>
        <div className="flex justify-between items-center mb-4 px-2">
          <h2 className="text-lg font-bold text-gray-900">
            Categories{" "}
            {loading && categories.length === 0 && (
              <span className="text-sm text-gray-400 font-normal ml-2">
                loading…
              </span>
            )}
          </h2>
          <Reusable_Button
            onClick={handleAdd}
            children="Add Category"
            variant="primary"
            leftIcon={<FaPlus />}
          />
        </div>

        <Reusable_Table
          columns={catColumns}
          data={catData}
          idKey="id"
          itemsPerPage={5}
          currentPage={currentPage}
          onPageChange={(page) => setCurrentPage(page)}
          actions={{
            showView: true,
            showEdit: true,
            showDelete: true,
            onView: handleView,
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

      {isModelOpen && (
        <Add_Category_Model
          isOpen={isModelOpen}
          onClose={handleCloseModal}
          categoryToEdit={editing}
          onSaved={() => dispatch(fetchCategoryStats())}
        />
      )}
    </div>
  );
};

export default Categories;