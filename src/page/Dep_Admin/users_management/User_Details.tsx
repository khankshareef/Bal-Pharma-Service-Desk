import { useEffect, useState } from "react";
import {
  FiArrowLeft,
  FiCheck,
  FiEdit,
  FiKey,
  FiMapPin,
  FiUser,
  FiUserX,
} from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import Reusable_Button from "../../../component/button/Reusable_Button";
import Loader from "../../../component/loader/Loader";

import type { AppDispatch, RootState } from "../../../store/store/Store";
import {
  fetchUserById,
  updateUserStatus,
  type User,
} from "../../../store/super_admin/slice/usersSlice";

const fmtDateTime = (iso?: string | null) =>
  iso
    ? new Date(iso).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const roleLabel = (r?: string) =>
  r
    ? r
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" ")
    : "—";

const statusLabel = (s?: string) =>
  s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "—";

const statusBadgeClass = (s?: string) => {
  switch ((s ?? "").toUpperCase()) {
    case "ACTIVE":
      return "bg-green-100 text-green-700";
    case "SUSPENDED":
      return "bg-amber-100 text-amber-700";
    case "CLOSED":
      return "bg-gray-100 text-gray-600";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

const User_Details = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { id } = useParams<{ id: string }>();
  const userId = Number(id);

  const cached = useSelector((s: RootState) =>
    s.users.users.find((u: User) => u.id === userId)
  );
  const loading = useSelector((s: RootState) => s.users.loading);
  const error = useSelector((s: RootState) => s.users.error);

  const [user, setUser] = useState<User | null>(cached ?? null);
  const [localLoading, setLocalLoading] = useState(!cached);

  useEffect(() => {
    if (!id) return;
    if (cached) {
      setUser(cached);
      setLocalLoading(false);
      return;
    }
    setLocalLoading(true);
    dispatch(fetchUserById(userId))
      .unwrap()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLocalLoading(false));
  }, [dispatch, id, cached, userId]);

  if (localLoading || (loading && !user)) return <Loader />;

  if (!user)
    return (
      <div className="max-w-full mx-auto font-sans min-h-screen">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4 cursor-pointer"
        >
          <FiArrowLeft size={18} />
          <span className="font-medium">Back</span>
        </button>
        <div className="flex min-h-[300px] items-center justify-center text-gray-500">
          {error ? "Failed to load user." : "User not found."}
        </div>
      </div>
    );

  const isActive = user.status === "ACTIVE";

  const handleToggleStatus = async () => {
    const next = isActive ? "SUSPENDED" : "ACTIVE";
    try {
      const updated = await dispatch(
        updateUserStatus({ id: user.id, status: next })
      ).unwrap();
      setUser(updated);
    } catch (e: any) {
      alert(e?.message || "Failed to update status");
    }
  };

  return (
    <div className="max-w-full mx-auto font-sans min-h-screen">
      <button
        onClick={() => window.history.back()}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4 cursor-pointer"
      >
        <FiArrowLeft size={18} />
        <span className="font-medium">Back</span>
      </button>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#0f2d4a]">User Details</h1>
      </div>

      {/* Profile Card */}
      <div className="bg-[#f8f9fb] border border-gray-100 rounded-2xl p-5 flex flex-wrap justify-between items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center text-[#1e4a66]">
            <FiUser size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{user.name}</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {user.employeeId} · {roleLabel(user.role)} · {user.department}
              {user.subDepartment ? ` / ${user.subDepartment}` : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Reusable_Button
            onClick={() => navigate(`../add-user?id=${user.id}`)}
            variant="secondary"
            leftIcon={<FiEdit size={14} />}
          >
            Edit
          </Reusable_Button>

          <Reusable_Button
            leftIcon={<FiKey size={14} />}
            className="flex items-center gap-2 px-5 py-2 bg-[#b85c14] border border-[#b85c14] rounded-full text-sm font-medium text-white hover:bg-[#9e4e10] transition-colors"
          >
            Reset Password
          </Reusable_Button>

          <Reusable_Button
            onClick={handleToggleStatus}
            leftIcon={<FiUserX size={14} />}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium text-white transition-colors ${
              isActive
                ? "bg-red-600 border border-red-300 hover:bg-red-500"
                : "bg-green-600 border border-green-300 hover:bg-green-500"
            }`}
          >
            {isActive ? "Deactivate" : "Activate"}
          </Reusable_Button>
        </div>
      </div>

      <div className="bg-[#f8f9fb] border border-gray-100 rounded-2xl p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-6">
          <Detail label="Employee ID" value={user.employeeId} />
          <Detail label="Full Name" value={user.name} />
          <Detail label="Role" value={roleLabel(user.role)} />
          <Detail label="Department" value={user.department} />
          <Detail label="Sub Department" value={user.subDepartment || "—"} />

          <div>
            <p className="text-xs text-gray-500 mb-2">Status</p>
            <span
              className={`inline-block px-3 py-0.5 text-xs font-semibold rounded-full ${statusBadgeClass(
                user.status
              )}`}
            >
              {statusLabel(user.status)}
            </span>
          </div>

          <Detail
            label="Primary Location"
            value={user.primaryLocation ?? "—"}
          />
          <Detail
            label="Last Login"
            value={fmtDateTime(user.lastLoginAt)}
          />
          <Detail
            label="Last Login Location"
            value={user.lastLoginLocation ?? "—"}
          />
          <Detail
            label="First Time Login"
            value={user.firstTimeLogin ? "Yes (pending)" : "No"}
          />
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-[17px] font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FiMapPin size={16} /> Allowed Locations
        </h3>
        <div className="bg-[#f8f9fb] border border-gray-100 rounded-2xl p-6">
          {(!user.allowedLocations || user.allowedLocations.length === 0) ? (
            <p className="text-sm text-gray-500">
              No additional locations assigned.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {user.allowedLocations.map((loc) => (
                <div
                  key={loc.unitCode}
                  className="border border-gray-100 bg-white rounded-xl p-4"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <FiCheck size={13} className="text-green-600" />
                    <span className="text-sm font-semibold text-gray-900">
                      {loc.unitName}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">Code: {loc.unitCode}</p>
                  {loc.address && (
                    <p className="text-xs text-gray-500 mt-1">{loc.address}</p>
                  )}
                  {loc.portCode && (
                    <p className="text-xs text-gray-500">
                      Port: {loc.portCode}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-[17px] font-bold text-gray-900 mb-4">
          Account Information
        </h3>
        <div className="bg-[#f8f9fb] border border-gray-100 rounded-2xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-xs text-gray-500 mb-2">Account Status</p>
              <span
                className={`inline-block px-3 py-0.5 text-xs font-semibold rounded-full ${statusBadgeClass(
                  user.status
                )}`}
              >
                {statusLabel(user.status)}
              </span>
            </div>
            <Detail label="Employee ID" value={user.employeeId} />
            <Detail label="Role" value={roleLabel(user.role)} />
          </div>
        </div>
      </div>
    </div>
  );
};

const Detail = ({ label, value }: { label: string; value: any }) => (
  <div>
    <p className="text-xs text-gray-500 mb-1">{label}</p>
    <p className="text-[15px] text-gray-900 font-medium">{value ?? "—"}</p>
  </div>
);

export default User_Details;