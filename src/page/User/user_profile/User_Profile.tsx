import { useEffect } from "react";
import { FaBuilding } from "react-icons/fa";
import {
  IoBriefcaseOutline,
  IoBusinessOutline,
  IoCheckmarkCircle,
  IoCloseCircle,
  IoFingerPrintOutline,
  IoLogInOutline,
  IoPersonOutline,
} from "react-icons/io5";

import { useDispatch, useSelector } from "react-redux";
import Loader from "../../../component/loader/Loader";
import type { AppDispatch } from "../../../store/login_route_store/store";
import { meApi } from "../../../store/user/slice/Login_Slice";

interface AssignedUnit {
  unitCode: string;
  unitName: string;
  portCode: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  radiusMeters?: number;
}

interface UserProfile {
  userId: number;
  employeeId: string;
  name: string;
  initials: string;
  department: string;

  activeRole: string;         
  roleDisplay: string;       
  roles: string[];             

  status: string;             
  active: boolean;
  mustChangePassword: boolean;

  primaryLocation: string;
  allowedLocations: string[];
  assignedUnits: AssignedUnit[];

  createdAt: string;
  accountAgeDays: number;
  lastLoginAt: string;
  lastLoginLocation: string | null;
  locationCount: number;
}

const User_Profile = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { user, meApiLoading } = useSelector(
    (state: any) => state.auth || state.loginRoute
  );

  useEffect(() => {
    if (!user) dispatch(meApi());
  }, [dispatch, user]);

  const profile = user as UserProfile | null;

  const formatDateTime = (dateString?: string | null) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (meApiLoading) return <Loader />;

  if (!profile) {
    return (
      <div className="flex min-h-[400px] items-center justify-center text-gray-500">
        No user data available.
      </div>
    );
  }

  const initials =
    profile.initials ||
    profile.name
      ?.split(" ")
      .map((n) => n.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase() ||
    "N/A";

  const isActive =
    profile.active === true || profile.status?.toUpperCase() === "ACTIVE";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-full">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
          <p className="mt-1 text-gray-500">
            Manage your account details and access levels.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-1">
            {/* ---- Identity card ---- */}
            <div className="relative overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
              <div className="h-32 bg-[#003D8C]"></div>
              <div className="relative px-6 pb-6">
                <div className="absolute -top-12 left-6 h-24 w-24 rounded-2xl bg-white p-1.5 shadow-md">
                  <div className="flex h-full w-full items-center justify-center rounded-xl bg-[#003D8C]/10 text-3xl font-bold text-[#003D8C]">
                    {initials}
                  </div>
                </div>

                <div className="pt-16">
                  <h2 className="text-xl font-bold text-gray-900">
                    {profile.name || "N/A"}
                  </h2>

                  <p className="mt-1 flex items-center gap-1.5 font-medium text-[#003D8C]">
                    <IoBriefcaseOutline />
                    {/* ✅ activeRole is the source of truth */}
                    {profile.roleDisplay || profile.activeRole || "N/A"}
                  </p>

                  <div className="mt-6 space-y-4">
                    <div className="flex items-center gap-3 text-gray-600">
                      <div className="rounded-lg bg-gray-50 p-2 text-gray-400">
                        <IoFingerPrintOutline size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase text-gray-400">
                          Employee ID
                        </p>
                        <p className="font-semibold text-gray-800">
                          {profile.employeeId || "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-gray-600">
                      <div className="rounded-lg bg-gray-50 p-2 text-gray-400">
                        <IoBusinessOutline size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase text-gray-400">
                          Department
                        </p>
                        <p className="font-semibold text-gray-800">
                          {profile.department || "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-gray-600">
                      <div className="rounded-lg bg-gray-50 p-2">
                        {isActive ? (
                          <IoCheckmarkCircle size={20} className="text-green-500" />
                        ) : (
                          <IoCloseCircle size={20} className="text-red-500" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase text-gray-400">
                          Account Status
                        </p>
                        <p
                          className={`font-semibold ${
                            isActive ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {profile.status || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#003D8C]/10">
                    <FaBuilding className="text-[#003D8C]" size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">
                      Assigned Units
                    </h3>
                    <p className="mt-0.5 text-xs text-gray-400">
                      Units assigned to you
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {profile.assignedUnits?.length > 0 ? (
                  <div className="space-y-3">
                    {profile.assignedUnits.map((unit, index) => (
                      <div
                        key={`${unit.unitCode}-${index}`}
                        className="rounded-xl border border-gray-100 bg-gray-50 p-4 transition-all hover:border-[#003D8C]/20 hover:bg-[#003D8C]/5"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#003D8C]/10">
                            <FaBuilding className="text-[#003D8C]" size={15} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm font-semibold text-gray-800">
                                {unit.unitName || "N/A"}
                              </p>
                              <span className="shrink-0 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-600">
                                Authorized
                              </span>
                            </div>

                            <div className="mt-3 grid grid-cols-2 gap-3">
                              <div>
                                <p className="text-[11px] font-medium uppercase text-gray-400">
                                  Unit address
                                </p>
                                <p className="mt-0.5 text-xs font-semibold text-gray-700">
                                  {unit.address || "N/A"}
                                </p>
                              </div>
                              <div>
                                <p className="text-[11px] font-medium uppercase text-gray-400">
                                  Port Code
                                </p>
                                <p className="mt-0.5 text-xs font-semibold text-gray-700">
                                  {unit.portCode || "N/A"}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gray-50">
                      <FaBuilding className="text-gray-300" size={20} />
                    </div>
                    <p className="mt-3 text-sm font-medium text-gray-500">
                      No assigned units
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      No units have been assigned to this employee.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6 lg:col-span-2">
            {/* ---- Role & Access ---- */}
            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-xl bg-[#003D8C]/10 p-2.5 text-[#003D8C]">
                  <IoPersonOutline size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-800">
                  Role & Access
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <p className="mb-1 text-sm text-gray-500">Active Role</p>
                  <p className="font-semibold text-gray-800">
                    {profile.roleDisplay || profile.activeRole || "N/A"}
                  </p>
                </div>

                <div>
                  <p className="mb-1 text-sm text-gray-500">Role Code</p>
                  <p className="font-semibold text-gray-800">
                    {profile.activeRole || "N/A"}
                  </p>
                </div>

                <div>
                  <p className="mb-1 text-sm text-gray-500">
                    All Assigned Roles
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {profile.roles?.length > 0 ? (
                      profile.roles.map((r) => (
                        <span
                          key={r}
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                            r === profile.activeRole
                              ? "bg-[#003D8C]/10 text-[#003D8C]"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {r}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )}
                  </div>
                </div>

                <div>
                  <p className="mb-1 text-sm text-gray-500">Department</p>
                  <p className="font-semibold text-gray-800">
                    {profile.department || "N/A"}
                  </p>
                </div>

                <div>
                  <p className="mb-1 text-sm text-gray-500">Account Status</p>
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                      isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {profile.status || "N/A"}
                  </span>
                </div>

                <div>
                  <p className="mb-1 text-sm text-gray-500">
                    First Time Login
                  </p>
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                      profile.mustChangePassword
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {profile.mustChangePassword ? "Yes" : "Completed"}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-xl bg-[#003D8C]/10 p-2.5 text-[#003D8C]">
                  <IoLogInOutline size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-800">
                  Login Information
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <p className="mb-1 text-sm text-gray-500">Last Login</p>
                  <p className="font-semibold text-gray-800">
                    {formatDateTime(profile.lastLoginAt)}
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-sm text-gray-500">
                    Last Login Location
                  </p>
                  <p className="font-semibold text-gray-800">
                    {profile.lastLoginLocation || "Not Available"}
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-sm text-gray-500">Account Age</p>
                  <p className="font-semibold text-gray-800">
                    {profile.accountAgeDays ?? 0}{" "}
                    {profile.accountAgeDays === 1 ? "day" : "days"}
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-sm text-gray-500">Employee ID</p>
                  <p className="font-semibold text-gray-800">
                    {profile.employeeId || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {profile.assignedUnits?.length > 0 && (
              <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
                <div className="mb-6 flex items-center gap-3">
                  <div className="rounded-xl bg-[#003D8C]/10 p-2.5 text-[#003D8C]">
                    <FaBuilding size={22} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">
                    Unit Details
                  </h3>
                </div>

                <div className="space-y-4">
                  {profile.assignedUnits.map((unit, index) => (
                    <div
                      key={`${unit.unitCode}-${index}`}
                      className="rounded-2xl border border-gray-100 bg-gray-50 p-5"
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium uppercase text-gray-400">
                            Unit
                          </p>
                          <h4 className="text-base font-bold text-gray-800">
                            {unit.unitName}
                          </h4>
                        </div>
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                          Authorized
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div>
                          <p className="text-xs text-gray-400">Unit address</p>
                          <p className="mt-1 text-sm font-semibold text-gray-700">
                            {unit.address ?? "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Port Code</p>
                          <p className="mt-1 text-sm font-semibold text-gray-700">
                            {unit.portCode ?? "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Radius</p>
                          <p className="mt-1 text-sm font-semibold text-gray-700">
                            {unit.radiusMeters ?? "N/A"} meters
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Latitude</p>
                          <p className="mt-1 text-sm font-semibold text-gray-700">
                            {unit.latitude ?? "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Longitude</p>
                          <p className="mt-1 text-sm font-semibold text-gray-700">
                            {unit.longitude ?? "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Location</p>
                          <p className="mt-1 text-sm font-semibold text-gray-700">
                            {unit.unitName}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 flex items-center justify-between px-2 text-xs font-medium text-gray-400">
              <p>Employee ID: {profile.employeeId || "N/A"}</p>
              <p>Account Age: {profile.accountAgeDays ?? 0} days</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default User_Profile;