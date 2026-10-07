import { useEffect, useMemo, useState } from "react";
import {
  FiArrowLeft,
  FiCheck,
  FiEdit,
  FiKey,
  FiUserX
} from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import Reusable_Button from "../../../component/button/Reusable_Button";
import Loader from "../../../component/loader/Loader";

import {
  fetchUserById,
  updateUserStatus,
  type User,
} from "../../../store/super_admin/slice/usersSlice";

import type { AppDispatch, RootState } from "../../../store/store/Store";

const humanizeRole = (role: string) => {
  switch (role) {
    case "EMPLOYEE":       return "Employee";
    case "EXECUTIVE":      return "Executive";
    case "DEPUTY_MANAGER": return "Deputy Manager";
    case "SUPER_MANAGER":  return "Super Manager";
    case "ADMIN":          return "Admin";
    default:               return role || "N/A";
  }
};

const formatDate = (iso?: string | null) => {
  if (!iso) return "N/A";
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
};

const formatDateTime = (iso?: string | null) => {
  if (!iso) return "Never";
  try {
    return new Date(iso).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
};

const AdminUser_Details = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const cached = useSelector((s: RootState) =>
    s.users.users.find((u) => u.id === Number(id))
  );

  const [user, setUser] = useState<User | null>(cached ?? null);
  const [loading, setLoading] = useState(!cached);

const UserRole = user ? humanizeRole(user.role) : "N/A";


  useEffect(() => {
    if (!id) return;

    if (cached) {
      setUser(cached);
      setLoading(false);
      return;
    }

    setLoading(true);
    dispatch(fetchUserById(Number(id)))
      .unwrap()
      .then((data) => setUser(data))
      .catch((err) => {
        console.error("Fetch user failed:", err);
        alert(err?.error || err?.message || "Failed to load user.");
        navigate("/super-manager/user-management");
      })
      .finally(() => setLoading(false));
  }, [dispatch, id, cached, navigate]);

  const handleEdit = () => {
    if (!user) return;
    navigate(`../edit-user/${user.id}`);
  };

  const handleResetPassword = async () => {
    if (!user) return;
    const newPassword = prompt(
      `Reset password for ${user.name} (${user.employeeId}).\nEnter new password (min 6 chars):`
    );
    if (!newPassword || newPassword.length < 6) {
      if (newPassword !== null) alert("Password must be at least 6 characters.");
      return;
    }

    try {
      alert("Password reset functionality not wired yet.");
    } catch (err: any) {
      alert(err?.error || err?.message || "Failed to reset password.");
    }
  };

  const handleToggleStatus = async () => {
    if (!user) return;
    const nextStatus = user.status === "ACTIVE" ? "CLOSED" : "ACTIVE";
    const label = nextStatus === "ACTIVE" ? "activate" : "deactivate";

    if (!confirm(`${label[0].toUpperCase() + label.slice(1)} ${user.name}?`)) return;

    try {
      const updated = await dispatch(
        updateUserStatus({ id: user.id, status: nextStatus })
      ).unwrap();
      setUser(updated);
    } catch (err: any) {
      alert(err?.error || err?.message || "Failed to update status.");
    }
  };

  const initials = useMemo(() => {
    if (!user?.name) return "?";
    return user.name
      .split(" ")
      .map((p) => p.charAt(0))
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }, [user]);

  const primaryUnitLabel = useMemo(() => {
    if (!user?.allowedLocations?.length) return "—";
    const primary =
      user.allowedLocations.find((u) => u.unitCode === user.primaryLocation) ??
      user.allowedLocations[0];
    return `${primary.unitName}${
      primary.address ? ` - ${primary.address}` : ""
    }${primary.portCode ? ` (${primary.portCode})` : ""}`;
  }, [user]);

  const isActive = user?.status === "ACTIVE";

  if (loading) return <Loader />;

  if (!user) {
    return (
      <div className="flex min-h-[400px] items-center justify-center text-gray-500">
        No user data available.
      </div>
    );
  }

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

      <div className="bg-[#f8f9fb] border border-gray-100 rounded-2xl p-5 flex flex-wrap justify-between items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center text-[#1e4a66] font-bold">
            {initials}
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{user.name}</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {user.employeeId} · {humanizeRole(user.role)} · {user.department}
              {user.allowedLocations?.length > 1
                ? ` · ${user.allowedLocations.length} Units`
                : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Reusable_Button
            onClick={handleEdit}
            children="Edit"
            leftIcon={<FiEdit size={14} />}
            variant="secondary"
          />
          <Reusable_Button
            onClick={handleResetPassword}
            children="Reset Password"
            leftIcon={<FiKey size={14} />}
            className="flex items-center gap-2 px-5 py-2 bg-[#b85c14] border border-[#b85c14] rounded-full text-sm font-medium text-white hover:bg-[#9e4e10] transition-colors"
          />
          <Reusable_Button
            onClick={handleToggleStatus}
            children={isActive ? "Deactivate" : "Activate"}
            leftIcon={<FiUserX size={14} />}
            className={`flex items-center gap-2 px-5 py-2 border rounded-full text-sm font-medium transition-colors ${
              isActive
                ? "bg-red-600 border-red-300 text-white hover:bg-red-500"
                : "bg-green-600 border-green-300 text-white hover:bg-green-500"
            }`}
          />
        </div>
      </div>

      <div className="bg-[#f8f9fb] border border-gray-100 rounded-2xl p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-6">
          <div>
            <p className="text-xs text-gray-500 mb-1">Employee ID</p>
            <p className="text-[15px] text-gray-900 font-medium">
              {user.employeeId}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Full Name</p>
            <p className="text-[15px] text-gray-900 font-medium">{user.name}</p>
          </div>

          <div>
            <p className="text-xs text-gray-500 mb-1">Role</p>
            <p className="text-[15px] text-gray-900 font-medium">
              {UserRole}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Department</p>
            <p className="text-[15px] text-gray-900 font-medium">
              {user.department || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-2">Status</p>
            <span
              className={`inline-block px-3 py-0.5 text-xs font-semibold rounded-full ${
                isActive
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {isActive ? "Active" : "Inactive"}
            </span>
          </div>

          <div className="md:col-span-2">
            <p className="text-xs text-gray-500 mb-2">
              Assigned Unit{user.allowedLocations?.length > 1 ? "s" : ""}
            </p>
            <div className="flex flex-wrap gap-2">
              {user.allowedLocations?.length > 0 ? (
                user.allowedLocations.map((u) => (
                  <span
                    key={u.unitCode}
                    className={`inline-block px-3 py-0.5 text-xs font-semibold rounded-full ${
                      u.unitCode === user.primaryLocation
                        ? "bg-orange-100 text-[#a85312]"
                        : "bg-blue-50 text-blue-700"
                    }`}
                  >
                    {u.unitName}
                    {u.address ? ` - ${u.address}` : ""}
                    {u.portCode ? ` (${u.portCode})` : ""}
                    {u.unitCode === user.primaryLocation ? " · Primary" : ""}
                  </span>
                ))
              ) : (
                <span className="text-sm text-gray-400">
                  No units assigned
                </span>
              )}
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-500 mb-1">Last Login</p>
            <p className="text-[15px] text-gray-900 font-medium">
              {formatDateTime(user.lastLoginAt)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Last Login Location</p>
            <p className="text-[15px] text-gray-900 font-medium">
              {user.lastLoginLocation || "N/A"}
            </p>
          </div>
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
                className={`inline-block px-3 py-0.5 text-xs font-semibold rounded-full ${
                  isActive
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">First-Time Login</p>
              <p className="text-[15px] text-gray-900 font-medium">
                {user.firstTimeLogin ? "Required" : "Completed"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Primary Location</p>
              <p className="text-[15px] text-gray-900 font-medium">
                {primaryUnitLabel}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-[17px] font-bold text-gray-900 mb-4">
          Administrative Activity
        </h3>
        <div className="border border-gray-100 rounded-xl overflow-hidden bg-white">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8f9fb] border-b border-gray-100 text-sm">
                <th className="py-3 px-6 font-semibold text-gray-700 w-[20%]">
                  Date
                </th>
                <th className="py-3 px-6 font-semibold text-gray-700 w-[25%]">
                  Action
                </th>
                <th className="py-3 px-6 font-semibold text-gray-700">
                  Description
                </th>
              </tr>
            </thead>
            <tbody className="text-[14px]">
              <tr className="border-b border-gray-100">
                <td className="py-4 px-6 text-gray-700">
                  {formatDate(user.lastLoginAt)}
                </td>
                <td className="py-4 px-6">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#e5f5ea] text-[#1e7e40] text-xs font-semibold rounded-full">
                    <FiCheck size={12} /> Last Login
                  </span>
                </td>
                <td className="py-4 px-6 text-gray-700">
                  Last successful login
                  {user.lastLoginLocation
                    ? ` from ${user.lastLoginLocation}`
                    : ""}
                  .
                </td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-4 px-6 text-gray-700">
                  {formatDate(user.lastLoginAt)}
                </td>
                <td className="py-4 px-6">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#e5f5ea] text-[#1e7e40] text-xs font-semibold rounded-full">
                    <FiCheck size={12} /> User Created
                  </span>
                </td>
                <td className="py-4 px-6 text-gray-700">
                  Account {user.employeeId} created.
                </td>
              </tr>
              {user.firstTimeLogin === false && (
                <tr>
                  <td className="py-4 px-6 text-gray-700">
                    {formatDate(user.lastLoginAt)}
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#e5f5ea] text-[#1e7e40] text-xs font-semibold rounded-full">
                      <FiCheck size={12} /> Password Changed
                    </span>
                  </td>
                  <td className="py-4 px-6 text-gray-700">
                    User completed first-time password change.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-400 mt-3">
          Full activity log will be available once the audit module is wired in.
        </p>
      </div>
    </div>
  );
};

export default AdminUser_Details;