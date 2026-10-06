import { useEffect, useState } from "react";
import { FiSave, FiX } from "react-icons/fi";
import { HiOutlineOfficeBuilding } from "react-icons/hi";
import { useDispatch, useSelector } from "react-redux";

import Reusable_Button from "../../button/Reusable_Button";
import Reusable_Field from "../../fields/Reusable_Field";

import type { AppDispatch, RootState } from "../../../store/store/Store";
import {
    createDepartment,
    updateDepartment,
    type Department,
    type DepartmentPayload,
} from "../../../store/super_admin/slice/DepartmentSlice";
import { fetchUnits } from "../../../store/super_admin/slice/UnitSlice";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
  departmentToEdit?: Department | null;
}

const emptyForm = {
  name: "",
  unitId: "" as string,  
  active: "Active" as "Active" | "Inactive",
};

const Add_Department_Model = ({
  isOpen,
  onClose,
  onSaved,
  departmentToEdit,
}: Props) => {
  const dispatch = useDispatch<AppDispatch>();
  const { units } = useSelector((s: RootState) => s.unit);
  const { saving } = useSelector((s: RootState) => s.departments);

  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchUnits());
  }, [dispatch]);

  useEffect(() => {
    if (!isOpen) return;

    if (departmentToEdit) {
  setForm({
    name: departmentToEdit.name ?? "",
unitId: departmentToEdit.unitId != null
      ? String(departmentToEdit.unitId)    
      : "",    active: departmentToEdit.active ? "Active" : "Inactive",
  });
}else {
      setForm(emptyForm);
    }
    setError(null);
  }, [isOpen, departmentToEdit]);

  if (!isOpen) return null;

  const isEditMode = !!departmentToEdit;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) return setError("Department name is required.");

    const payload: DepartmentPayload = {
      name: form.name.trim(),
      unitId: form.unitId === "" ? null : Number(form.unitId),
      active: form.active === "Active",
    };

    try {
      setError(null);

      if (isEditMode && departmentToEdit?.id) {
        await dispatch(
          updateDepartment({ id: departmentToEdit.id, data: payload })
        ).unwrap();
      } else {
        await dispatch(createDepartment(payload)).unwrap();
      }

      onSaved?.();
      onClose();
    } catch (err: any) {
      setError(err?.error || err?.message || "Failed to save department.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden">
        <div className="px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-2 text-[#002D5B]">
            <HiOutlineOfficeBuilding size={22} />
            <h2 className="text-xl font-bold">
              {isEditMode ? "Edit Department" : "Add Department"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-full transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="px-6 pb-6 flex flex-col gap-5">
          <Reusable_Field
            label="Department Name *"
            name="name"
            placeholder="Enter department name"
            value={form.name}
            onChange={handleChange}
          />

          <div>
            <label className="block text-sm text-gray-600 mb-1.5">
              Unit
            </label>
            <select
              name="unitId"
              value={form.unitId}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm bg-white focus:outline-none focus:border-[#003D8C]"
            >
              <option value="">All Units</option>
              {units.map((u) => (
                <option key={u.unitCode} value={String(u.id)}>
                  {u.unitName}
                  {u.address ? ` - ${u.address}` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1.5">Status</label>
            <select
              name="active"
              value={form.active}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm bg-white focus:outline-none focus:border-[#003D8C]"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl p-3">
              {error}
            </div>
          )}
        </div>

        <div className="px-6 py-5 flex justify-end gap-3">
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
            {saving ? "Saving…" : isEditMode ? "Update Department" : "Add Department"}
          </Reusable_Button>
        </div>
      </div>
    </div>
  );
};

export default Add_Department_Model;