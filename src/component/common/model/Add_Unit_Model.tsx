import React, { useEffect, useState } from "react";
import { FiMapPin, FiSave, FiX } from "react-icons/fi";
import { HiOutlineOfficeBuilding } from "react-icons/hi";
import { useDispatch, useSelector } from "react-redux";

import type { AppDispatch, RootState } from "../../../store/store/Store";
import {
  createUnit,
  updateUnit,
  type Unit,
  type UnitPayload,
} from "../../../store/super_admin/slice/UnitSlice";

interface AddUnitModelProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
  unitToEdit?: Unit | null; 
}

interface FormState {
  unitName: string;
  location: string;
  portCode: string;
  latitude: string;
  longitude: string;
  radiusMeters: string;
  status: "Active" | "Inactive";
}

const emptyForm: FormState = {
  unitName: "",
  location: "",
  portCode: "",
  latitude: "",
  longitude: "",
  radiusMeters: "100",
  status: "Active",
};

const Add_Unit_Model: React.FC<AddUnitModelProps> = ({
  isOpen,
  onClose,
  onSaved,
  unitToEdit,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((s: RootState) => s.unit);

  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    if (unitToEdit) {
      setForm({
        unitName: unitToEdit.unitName ?? "",
        location: unitToEdit.address ?? "",
        portCode: unitToEdit.portCode ?? "",
        latitude: unitToEdit.latitude != null ? String(unitToEdit.latitude) : "",
        longitude: unitToEdit.longitude != null ? String(unitToEdit.longitude) : "",
        radiusMeters: unitToEdit.radiusMeters != null
          ? String(unitToEdit.radiusMeters)
          : "500",
        status: unitToEdit.active === false ? "Inactive" : "Active",
      });
    } else {
      setForm(emptyForm);
    }
    setError(null);
  }, [isOpen, unitToEdit]);

  if (!isOpen) return null;

  const isEditMode = !!unitToEdit;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setForm((prev) => ({
          ...prev,
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6),
        })),
      (err) => alert(err.message || "Could not get your location."),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const handleSubmit = async () => {
    if (!form.unitName.trim()) return setError("Unit name is required.");
    if (!form.location.trim()) return setError("Location is required.");

    const lat = form.latitude.trim() ? Number(form.latitude) : null;
    const lng = form.longitude.trim() ? Number(form.longitude) : null;
    const radius = form.radiusMeters.trim() ? Number(form.radiusMeters) : 500;

    if (lat !== null && (isNaN(lat) || lat < -90 || lat > 90))
      return setError("Latitude must be between -90 and 90.");
    if (lng !== null && (isNaN(lng) || lng < -180 || lng > 180))
      return setError("Longitude must be between -180 and 180.");
    if (isNaN(radius) || radius <= 0)
      return setError("Radius must be greater than 0.");
    if ((lat === null) !== (lng === null))
      return setError("Provide both latitude and longitude, or leave both empty.");

    const payload: UnitPayload = {
      unitName: form.unitName.trim(),
      address: form.location.trim(),
      portCode: form.portCode.trim() || undefined,
      latitude: lat,
      longitude: lng,
      radiusMeters: radius,
      active: form.status === "Active",
    };

    try {
      setError(null);

      if (isEditMode && unitToEdit?.id) {
        await dispatch(updateUnit({ id: unitToEdit.id, data: payload })).unwrap();
      } else {
        await dispatch(createUnit(payload)).unwrap();
      }

      onSaved?.();
      onClose();
    } catch (err: any) {
      setError(
        err?.error ||
          err?.message ||
          err?.response?.data?.error ||
          `Failed to ${isEditMode ? "update" : "create"} unit.`
      );
    }
  };

  return (
    <div className="fixed mt-18 inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 font-sans">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-2 text-[#002D5B]">
            <HiOutlineOfficeBuilding size={22} className="stroke-2" />
            <h2 className="text-xl font-bold">
              {isEditMode ? "Edit Unit" : "Add Unit"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-full transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pb-6 flex flex-col gap-5 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="block text-sm text-gray-600 mb-1.5">
              Unit Name *
            </label>
            <input
              type="text"
              name="unitName"
              value={form.unitName}
              onChange={handleChange}
              placeholder="Enter unit name"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-[#003D8C] focus:ring-1 focus:ring-[#003D8C]"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1.5">
              Location *
            </label>
            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="Enter location"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-[#003D8C] focus:ring-1 focus:ring-[#003D8C]"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1.5">
              Port Code
            </label>
            <input
              type="text"
              name="portCode"
              value={form.portCode}
              onChange={handleChange}
              placeholder="e.g., INBOM"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-[#003D8C] focus:ring-1 focus:ring-[#003D8C]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">Latitude</label>
              <input
                type="text"
                name="latitude"
                value={form.latitude}
                onChange={handleChange}
                placeholder="e.g., 19.076"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-[#003D8C]"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">Longitude</label>
              <input
                type="text"
                name="longitude"
                value={form.longitude}
                onChange={handleChange}
                placeholder="e.g., 72.877"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-[#003D8C]"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">Radius (m)</label>
              <input
                type="text"
                name="radiusMeters"
                value={form.radiusMeters}
                onChange={handleChange}
                placeholder="500"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-[#003D8C]"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleUseMyLocation}
            className="self-start flex items-center gap-2 text-sm font-medium text-[#003D8C] bg-white border border-[#003D8C] rounded-full px-4 py-2 hover:bg-[#003D8C] hover:text-white transition-colors"
          >
            <FiMapPin size={16} />
            Use My Current Location
          </button>

          <div>
            <label className="block text-sm text-gray-600 mb-1.5">Status</label>
            <select
              name="status"
              value={form.status}
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

        {/* Footer */}
        <div className="px-6 py-5 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#003D8C] text-white rounded-full text-sm font-medium hover:bg-[#002a61] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiSave size={16} />
            {loading ? "Saving…" : isEditMode ? "Update Unit" : "Add Unit"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Add_Unit_Model;