import React, { useEffect, useState } from "react";
import { FiInfo, FiPlus, FiSave, FiTag, FiX } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";

import type { AppDispatch, RootState } from "../../../store/store/Store";
import {
    createCategory,
    updateCategory,
    type Category,
    type CategoryPayload,
} from "../../../store/super_admin/slice/CategorySlice";
import { fetchDepartments } from "../../../store/super_admin/slice/DepartmentSlice";
import { fetchUnits } from "../../../store/super_admin/slice/UnitSlice";
import Reusable_Button from "../../button/Reusable_Button";

interface AddCategoryModelProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
  categoryToEdit?: Category | null;
}

interface FormState {
  name: string;
  departmentId: string;         
  scope: string;
  active: "Active" | "Inactive";
  subCategories: string[];
  newSubCategory: string;
}

const emptyForm: FormState = {
  name: "",
  departmentId: "",            
  scope: "All Units",
  active: "Active",
  subCategories: [],
  newSubCategory: "",
};

const Add_Category_Model: React.FC<AddCategoryModelProps> = ({
  isOpen,
  onClose,
  onSaved,
  categoryToEdit,
}) => {
  const dispatch = useDispatch<AppDispatch>();

  const { saving } = useSelector((s: RootState) => s.categories);
  const { units, loading: unitLoading } = useSelector((s: RootState) => s.unit);
  const { departments, loading: depLoading } = useSelector(
    (s: RootState) => s.departments
  );

  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && units.length === 0) dispatch(fetchUnits());
  }, [isOpen, units.length, dispatch]);

  useEffect(() => {
    if (isOpen && departments.length === 0) dispatch(fetchDepartments());
  }, [isOpen, departments.length, dispatch]);

  useEffect(() => {
    if (!isOpen) return;

    if (categoryToEdit) {
      setForm({
        name: categoryToEdit.name ?? "",
        departmentId: categoryToEdit.departmentId
          ? String(categoryToEdit.departmentId)
          : "",
        scope: categoryToEdit.scope ?? "All Units",
        active: categoryToEdit.active ? "Active" : "Inactive",
        subCategories:
          (categoryToEdit.subCategories ?? []).map((s: any) =>
            typeof s === "string" ? s : s.name
          ),
        newSubCategory: "",
      });
    } else {
      setForm(emptyForm);
    }
    setError(null);
  }, [isOpen, categoryToEdit]);

  if (!isOpen) return null;

  const isEditMode = !!categoryToEdit;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSubCategory = () => {
    const val = form.newSubCategory.trim();
    if (!val) return;

    if (form.subCategories.some((s) => s.toLowerCase() === val.toLowerCase())) {
      setError("Sub-category already added.");
      return;
    }

    setForm((prev) => ({
      ...prev,
      subCategories: [...prev.subCategories, val],
      newSubCategory: "",
    }));
    setError(null);
  };

  const handleRemoveSubCategory = (index: number) => {
    setForm((prev) => ({
      ...prev,
      subCategories: prev.subCategories.filter((_, i) => i !== index),
    }));
  };

  const handleSubCategoryKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddSubCategory();
    }
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) return setError("Category name is required.");
    if (!form.departmentId) return setError("Department is required.");

    const payload: CategoryPayload = {
      name: form.name.trim(),
      departmentId: Number(form.departmentId),    
      scope: form.scope,
      active: form.active === "Active",
      subCategories: form.subCategories,
    };

    try {
      setError(null);

      if (isEditMode && categoryToEdit?.id) {
        await dispatch(
          updateCategory({ id: categoryToEdit.id, data: payload })
        ).unwrap();
      } else {
        await dispatch(createCategory(payload)).unwrap();
      }

      onSaved?.();
      onClose();
    } catch (err: any) {
      setError(err?.error || err?.message || "Failed to save category.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm font-sans mt-18">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-2 text-[#002D5B]">
            <FiTag size={22} className="stroke-2" />
            <h2 className="text-xl font-bold">
              {isEditMode ? "Edit Category" : "Add Category"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-full transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="px-6 pb-2 flex flex-col gap-5 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="block text-sm text-gray-600 mb-1.5">
              Category Name *
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Payroll"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-[#003D8C] focus:ring-1 focus:ring-[#003D8C] transition-all"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1.5">
              Department *
            </label>
            <select
              name="departmentId"
              value={form.departmentId}
              onChange={handleChange}
              disabled={depLoading && departments.length === 0}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 bg-white focus:outline-none focus:border-[#003D8C] transition-all disabled:bg-gray-50 disabled:text-gray-400"
            >
              <option value="">Select Department</option>

              {depLoading && departments.length === 0 && (
                <option value="" disabled>
                  Loading departments…
                </option>
              )}

              {departments.map((d: any) => (
                <option key={d.id} value={String(d.id)}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1.5">Scope</label>
            <select
              name="scope"
              value={form.scope}
              onChange={handleChange}
              disabled={unitLoading}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 bg-white focus:outline-none focus:border-[#003D8C] transition-all disabled:bg-gray-50 disabled:text-gray-400"
            >
              <option value="All Units">All Units</option>

              {unitLoading && units.length === 0 && (
                <option value="" disabled>
                  Loading units…
                </option>
              )}

              {units.map((u) => (
                <option key={u.unitCode} value={u.unitName}>
                  {u.unitName}
                  {u.address ? ` - ${u.address}` : ""}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">
              Leave as "All Units" to apply this category across every unit.
            </p>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm text-gray-600 mb-1.5">Status</label>
            <select
              name="active"
              value={form.active}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 bg-white focus:outline-none focus:border-[#003D8C] transition-all"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1.5">
              Sub-Categories
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter sub-category name"
                value={form.newSubCategory}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    newSubCategory: e.target.value,
                  }))
                }
                onKeyDown={handleSubCategoryKeyDown}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-[#003D8C] transition-all"
              />
              <button
                type="button"
                onClick={handleAddSubCategory}
                className="flex items-center gap-1.5 px-5 py-2.5 border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <FiPlus size={16} /> Add
              </button>
            </div>

            <div className="mt-3">
              {form.subCategories.length === 0 ? (
                <>
                  <p className="text-sm text-gray-400 mb-1">
                    No sub-categories added yet
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-[#003D8C]/70">
                    <FiInfo size={14} />
                    Add sub-categories to organize your category
                  </div>
                </>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {form.subCategories.map((sub, i) => (
                    <span
                      key={`${sub}-${i}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100"
                    >
                      {sub}
                      <button
                        type="button"
                        onClick={() => handleRemoveSubCategory(i)}
                        className="text-purple-700 hover:text-purple-900"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl p-3">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-5 flex justify-end gap-3 mt-2">
          <Reusable_Button
            variant="secondary"
            onClick={onClose}
            disabled={saving}
            className="px-6 py-2.5 rounded-full border border-gray-300"
          >
            Cancel
          </Reusable_Button>
          <Reusable_Button
            variant="primary"
            onClick={handleSubmit}
            disabled={saving}
            leftIcon={<FiSave size={16} />}
            className="px-6 py-2.5 rounded-full bg-[#003D8C] text-white"
          >
            {saving
              ? "Saving…"
              : isEditMode
              ? "Update Category"
              : "Add Category"}
          </Reusable_Button>
        </div>
      </div>
    </div>
  );
};

export default Add_Category_Model;