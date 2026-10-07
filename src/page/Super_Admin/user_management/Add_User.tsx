import { useEffect, useMemo, useState } from "react";
import { FiArrowLeft, FiSave } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import Reusable_Button from "../../../component/button/Reusable_Button";
import Reusable_Field from "../../../component/fields/Reusable_Field";
import Loader from "../../../component/loader/Loader";

import {
  create_User,
  createUnit,
  fetchUnits,
} from "../../../store/super_admin/slice/Add_User";

import {
  fetchUserById,
  updateUser,
} from "../../../store/super_admin/slice/usersSlice";

import {
  fetchDepartments,
} from "../../../store/super_admin/slice/DepartmentSlice";

import {
  fetchCategories,
  fetchCategoriesByDepartment,
} from "../../../store/super_admin/slice/CategorySlice";

import type {
  AppDispatch,
  RootState,
} from "../../../store/store/Store";

type RoleUnitMap = Record<string, string[]>;

interface UserFormData {
  employeeId: string;
  name: string;
  roles: string[];
  role: string;
  password: string;
  department: string;

  roleUnits: RoleUnitMap;
}

interface UnitOption {
  label: string;
  value: string;
}

interface NewUnitData {
  name: string;
  location: string;
  portCode: string;
  latitude: string;
  longitude: string;
  radiusMeters: string;
}

const emptyForm: UserFormData = {
  employeeId: "",
  name: "",
  roles: [],
  role: "",
  password: "",
  department: "",
  roleUnits: {},
};

const ROLE_OPTIONS = [
  { label: "Employee",       value: "EMPLOYEE" },
  { label: "Executive",      value: "EXECUTIVE" },
  { label: "Deputy Manager", value: "DEPUTY_MANAGER" },
  { label: "Super Manager",  value: "SUPER_MANAGER" },
];

const Add_User = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  const { units: apiUnits, unitLoading } = useSelector(
    (state: RootState) => state.addUser
  );
  const { saving } = useSelector((state: RootState) => state.users);
  const { departments } = useSelector((state: RootState) => state.departments);

  const [handleData, setHandleData] = useState<UserFormData>(emptyForm);
  const [isLoader, setLoader] = useState(false);
  const [showAddUnitForm, setShowAddUnitForm] = useState(false);

  const [newUnitData, setNewUnitData] = useState<NewUnitData>({
    name: "",
    location: "",
    portCode: "",
    latitude: "",
    longitude: "",
    radiusMeters: "100",
  });

  useEffect(() => {
    dispatch(fetchUnits());
    dispatch(fetchDepartments());
  }, [dispatch]);

  useEffect(() => {
    if (!handleData.department) return;

    const dep = departments.find(
      (d: any) => d.name.toLowerCase() === handleData.department.toLowerCase()
    );
    if (dep?.id) {
      dispatch(fetchCategoriesByDepartment(dep.id));
    } else {
      dispatch(fetchCategories());
    }
  }, [dispatch, handleData.department, departments]);

  useEffect(() => {
    if (!isEditMode || !id) {
      setHandleData(emptyForm);
      return;
    }

    setLoader(true);
    dispatch(fetchUserById(Number(id)))
      .unwrap()
      .then((user: any) => {
        const userRoles: string[] =
          Array.isArray(user.roles) && user.roles.length > 0
            ? user.roles
            : user.role
            ? [user.role]
            : [];
        const flatCodes: string[] =
          user.allowedLocations?.map((u: any) => u.unitCode) ?? [];

        const roleUnits: RoleUnitMap = {};
        userRoles.forEach((r) => {
          roleUnits[r] = [...flatCodes];
        });

        setHandleData({
          employeeId: user.employeeId,
          name: user.name,
          roles: userRoles,
          role: user.primaryRole ?? user.role ?? userRoles[0] ?? "",
          password: "",
          department: user.department,
          roleUnits,
        });
      })
      .catch((err) => {
        console.error("Fetch user failed:", err);
        alert(err?.error || err?.message || "Failed to load user.");
        navigate("/super-manager/user-management");
      })
      .finally(() => setLoader(false));
  }, [dispatch, id, isEditMode, navigate]);

  const unitOptions: UnitOption[] = useMemo(
    () => [
      { label: "Select Unit", value: "" },
      ...apiUnits.map((u) => ({
        label: `${u.unitName}: ${u.address ?? ""}${
          u.portCode ? ` (${u.portCode})` : ""
        }`.trim(),
        value: u.unitCode,
      })),
    ],
    [apiUnits]
  );

  const departmentOptions = useMemo(
    () => [
      { label: "Select Department", value: "" },
      ...departments.map((d: any) => ({ label: d.name, value: d.name })),
    ],
    [departments]
  );

  const handleOnchange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setHandleData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleRole = (role: string) => {
    setHandleData((prev) => {
      const active = prev.roles.includes(role);

      if (active) {
        const nextRoleUnits = { ...prev.roleUnits };
        delete nextRoleUnits[role];

        const nextRoles = prev.roles.filter((r) => r !== role);
        const nextPrimary =
          prev.role === role ? nextRoles[0] ?? "" : prev.role;

        return {
          ...prev,
          roles: nextRoles,
          role: nextPrimary,
          roleUnits: nextRoleUnits,
        };
      }

      return {
        ...prev,
        roles: [...prev.roles, role],
        role: prev.role || role,
        roleUnits: { ...prev.roleUnits, [role]: [] },
      };
    });
  };

  const setPrimaryRole = (role: string) => {
    setHandleData((prev) => ({ ...prev, role }));
  };


  const toggleUnitForRole = (role: string, unitCode: string) => {
    setHandleData((prev) => {
      const current = prev.roleUnits[role] ?? [];
      const isEmployeeOnly =
        role === "EMPLOYEE" &&
        !prev.roles.some((r) =>
          ["EXECUTIVE", "DEPUTY_MANAGER", "SUPER_MANAGER"].includes(r)
        );

      let next: string[];

      if (isEmployeeOnly) {
        next = current.includes(unitCode) ? [] : [unitCode];
      } else {
        next = current.includes(unitCode)
          ? current.filter((c) => c !== unitCode)
          : [...current, unitCode];
      }

      return {
        ...prev,
        roleUnits: { ...prev.roleUnits, [role]: next },
      };
    });
  };

  const removeUnitFromRole = (role: string, unitCode: string) => {
    setHandleData((prev) => ({
      ...prev,
      roleUnits: {
        ...prev.roleUnits,
        [role]: (prev.roleUnits[role] ?? []).filter((c) => c !== unitCode),
      },
    }));
  };


  const handleNewUnitChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewUnitData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setLoader(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setNewUnitData((prev) => ({
          ...prev,
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6),
        }));
        setLoader(false);
      },
      (err) => {
        setLoader(false);
        alert(err.message || "Could not get your location.");
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const handleCreateUnit = async () => {
    if (!newUnitData.name.trim()) return alert("Unit Name is required.");
    if (!newUnitData.location.trim()) return alert("Address is required.");

    const lat = newUnitData.latitude.trim() ? Number(newUnitData.latitude) : 0;
    const lng = newUnitData.longitude.trim() ? Number(newUnitData.longitude) : 0;

    if (lat !== 0 && (lat < -90 || lat > 90))
      return alert("Latitude must be between -90 and 90.");
    if (lng !== 0 && (lng < -180 || lng > 180))
      return alert("Longitude must be between -180 and 180.");

    try {
      setLoader(true);
      await dispatch(
        createUnit({
          unitCode: "",
          unitName: newUnitData.name.trim(),
          address: newUnitData.location.trim(),
          latitude: lat,
          longitude: lng,
          portCode: newUnitData.portCode.trim() || undefined,
        })
      ).unwrap();

      const refreshed = await dispatch(fetchUnits()).unwrap();
      const created = refreshed.find(
        (u) => u.unitName === newUnitData.name.trim()
      );

      if (created) {
        const target = handleData.role || handleData.roles[0];
        if (target) {
          setHandleData((prev) => {
            const current = prev.roleUnits[target] ?? [];
            const isEmployeeOnly =
              target === "EMPLOYEE" &&
              !prev.roles.some((r) =>
                ["EXECUTIVE", "DEPUTY_MANAGER", "SUPER_MANAGER"].includes(r)
              );
            const next = isEmployeeOnly
              ? [created.unitCode]
              : [...current, created.unitCode];
            return {
              ...prev,
              roleUnits: { ...prev.roleUnits, [target]: next },
            };
          });
        }
      }

      setNewUnitData({
        name: "",
        location: "",
        portCode: "",
        latitude: "",
        longitude: "",
        radiusMeters: "100",
      });
      setShowAddUnitForm(false);
      alert("Unit created successfully.");
    } catch (err: any) {
      console.error("Create unit error:", err);
      alert(err?.error || err?.message || "Failed to create unit.");
    } finally {
      setLoader(false);
    }
  };


  const handleSubmit = async () => {
    if (
      !handleData.employeeId.trim() ||
      !handleData.name.trim() ||
      handleData.roles.length === 0 ||
      !handleData.role ||
      !handleData.department
    ) {
      alert("Please fill all required fields.");
      return;
    }

    if (!isEditMode && !handleData.password) {
      alert("Password is required.");
      return;
    }

    if (!handleData.roles.includes(handleData.role)) {
      alert("Primary role must be one of the selected roles.");
      return;
    }

    const missingUnitRole = handleData.roles.find(
      (r) => (handleData.roleUnits[r] ?? []).length === 0
    );
    if (missingUnitRole) {
      alert(
        `Please assign at least one unit to the "${missingUnitRole}" role.`
      );
      return;
    }

    const employeeOnly =
      handleData.roles.length === 1 && handleData.roles[0] === "EMPLOYEE";
    if (employeeOnly && (handleData.roleUnits["EMPLOYEE"] ?? []).length > 1) {
      alert("Employee role can be assigned to only one unit.");
      return;
    }

    const allUnitCodes = Array.from(
      new Set(Object.values(handleData.roleUnits).flat())
    );

    const allowedLocations = allUnitCodes.map((code) => {
      const u = apiUnits.find((x) => x.unitCode === code);
      return {
        unitCode: code,
        unitName: u?.unitName ?? "",
        address: u?.address ?? "",
        portCode: u?.portCode ?? undefined,
        latitude: u?.latitude ?? null,
        longitude: u?.longitude ?? null,
        radiusMeters: u?.radiusMeters ?? 100,
      };
    });

    const primaryUnit = handleData.roleUnits[handleData.role]?.[0] ?? null;

    try {
      setLoader(true);

      if (isEditMode && id) {
        const payload = {
          name: handleData.name.trim(),
          roles: handleData.roles,
          primaryRole: handleData.role,
          department: handleData.department,
          primaryLocation: primaryUnit,
          allowedLocations,

          roleUnits: handleData.roleUnits,
        };

        console.log("Update User Payload:", JSON.stringify(payload, null, 2));
        await dispatch(updateUser({ id: Number(id), data: payload })).unwrap();
        alert("User updated successfully.");
      } else {
        const payload = {
          employeeId: handleData.employeeId.trim(),
          name: handleData.name.trim(),
          password: handleData.password,
          roles: handleData.roles,
          primaryRole: handleData.role,
          department: handleData.department,
          subDepartment: "",
          allowedLocations,

          roleUnits: handleData.roleUnits,
        };

        console.log("Create User Payload:", JSON.stringify(payload, null, 2));
        await dispatch(create_User(payload)).unwrap();
        alert("User created successfully.");
      }

      navigate("/super-manager/user-management");
    } catch (err: any) {
      console.error("Submit error:", err);
      alert(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          err?.error ||
          err?.message ||
          `Failed to ${isEditMode ? "update" : "create"} user.`
      );
    } finally {
      setLoader(false);
    }
  };

  return (
    <div className="max-w-full mx-auto font-sans">
      {isLoader && <Loader />}

      <div className="mb-8">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4 cursor-pointer"
        >
          <FiArrowLeft size={18} />
          <span className="font-medium">Back</span>
        </button>
        <h1 className="text-2xl font-bold text-[#002D5B]">
          {isEditMode ? "Edit User" : "Add User"}
        </h1>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col gap-8">
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-6">
            User Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Reusable_Field
              label="Employee ID *"
              placeholder="Enter employee ID"
              name="employeeId"
              value={handleData.employeeId}
              onChange={handleOnchange}
              disabled={isEditMode}
            />

            <Reusable_Field
              label="Name *"
              placeholder="Enter full name"
              name="name"
              value={handleData.name}
              onChange={handleOnchange}
            />

            {!isEditMode && (
              <Reusable_Field
                type="password"
                label="Password *"
                name="password"
                placeholder="Enter password"
                value={handleData.password}
                onChange={handleOnchange}
              />
            )}

            <Reusable_Field
              type="select"
              label="Department *"
              name="department"
              value={handleData.department}
              onChange={handleOnchange}
              options={departmentOptions}
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-800 block mb-1">
            Roles *{" "}
            <span className="text-xs text-gray-500 font-normal">
              (select all that apply)
            </span>
          </label>
          <div className="flex flex-wrap gap-3 mt-2">
            {ROLE_OPTIONS.map((r) => {
              const active = handleData.roles.includes(r.value);
              return (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => toggleRole(r.value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition cursor-pointer ${
                    active
                      ? "bg-[#003D8C] text-white border-[#003D8C]"
                      : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {active ? "✓ " : ""}
                  {r.label}
                </button>
              );
            })}
          </div>
        </div>

        {handleData.roles.length > 1 && (
          <div className="bg-[#F4F8FB] border border-[#E1EAF4] rounded-xl p-4">
            <label className="text-sm font-semibold text-gray-800 block mb-3">
              Default role on login *
            </label>
            <div className="flex flex-wrap gap-4">
              {handleData.roles.map((r) => (
                <label
                  key={r}
                  className="flex items-center gap-2 text-sm cursor-pointer"
                >
                  <input
                    type="radio"
                    name="primaryRole"
                    className="accent-[#003D8C]"
                    checked={handleData.role === r}
                    onChange={() => setPrimaryRole(r)}
                  />
                  {ROLE_OPTIONS.find((o) => o.value === r)?.label ?? r}
                </label>
              ))}
            </div>
          </div>
        )}

        {handleData.roles.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">
              Units per Role
            </h2>
            <p className="text-xs text-gray-500 mb-5">
              Assign different units for each role. At login, the user sees
              only the units they selected for the role they logged in with.
            </p>

            <div className="space-y-6">
              {handleData.roles.map((role) => {
                const assigned: string[] = handleData.roleUnits[role] ?? [];
                const isPrimary = handleData.role === role;

                return (
                  <div
                    key={role}
                    className={`rounded-xl border p-5 transition ${
                      isPrimary
                        ? "border-[#003D8C] bg-[#F4F8FB]"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <h3 className="text-sm font-bold text-gray-800">
                          {ROLE_OPTIONS.find((o) => o.value === role)?.label ?? role}
                        </h3>
                        {isPrimary && (
                          <span className="text-[10px] font-bold uppercase text-white bg-[#003D8C] rounded-full px-2 py-0.5">
                            Primary
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowAddUnitForm((s) => !s)}
                        className="text-xs font-medium text-[#003D8C] hover:underline"
                      >
                        + New Unit
                      </button>
                    </div>

                    {/* selected units as pills */}
                    {assigned.length > 0 ? (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {assigned.map((code) => {
                          const u = apiUnits.find((x) => x.unitCode === code);
                          return (
                            <span
                              key={code}
                              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100"
                            >
                              {u?.unitName}: {u?.address}
                              <button
                                type="button"
                                onClick={() => removeUnitFromRole(role, code)}
                                className="ml-1 text-blue-700 hover:text-blue-900"
                              >
                                ✕
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic mb-3">
                        No units selected yet.
                      </p>
                    )}

                    {/* dropdown to add units */}
                    <div className="w-full max-w-md">
                      <Reusable_Field
                        type="select"
                        options={[
                          { label: "Add unit to this role…", value: "" },
                          ...unitOptions.filter(
                            (o) => o.value && !assigned.includes(o.value)
                          ),
                        ]}
                        name={`unit-${role}`}
                        value=""
                        onChange={(e) => {
                          const code = e.target.value;
                          if (code) toggleUnitForRole(role, code);
                        }}
                        disabled={unitLoading || isLoader}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {showAddUnitForm && (
          <div className="bg-white border border-blue-100 rounded-lg p-5 shadow-sm">
            <div className="pb-3 border-b border-gray-100 mb-4">
              <h3 className="text-sm font-bold text-gray-800">
                Create New Unit
              </h3>
              <p className="text-xs text-gray-500">
                Latitude and longitude are used for office geofence validation.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Reusable_Field
                label="Unit Name *"
                name="name"
                placeholder="e.g., Unit 3"
                value={newUnitData.name}
                onChange={handleNewUnitChange}
              />
              <Reusable_Field
                label="Address *"
                name="location"
                placeholder="e.g., Mumbai"
                value={newUnitData.location}
                onChange={handleNewUnitChange}
              />
              <Reusable_Field
                label="Port Code"
                name="portCode"
                placeholder="e.g., INBOM"
                value={newUnitData.portCode}
                onChange={handleNewUnitChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <Reusable_Field
                label="Latitude"
                name="latitude"
                placeholder="e.g., 19.076000"
                value={newUnitData.latitude}
                onChange={handleNewUnitChange}
              />
              <Reusable_Field
                label="Longitude"
                name="longitude"
                placeholder="e.g., 72.877700"
                value={newUnitData.longitude}
                onChange={handleNewUnitChange}
              />
              <Reusable_Field
                label="Radius (meters)"
                name="radiusMeters"
                placeholder="500"
                value={newUnitData.radiusMeters}
                onChange={handleNewUnitChange}
              />
            </div>

            <div className="flex items-center gap-3 mt-5 flex-wrap">
              <button
                type="button"
                onClick={handleUseMyLocation}
                disabled={isLoader}
                className="flex items-center gap-2 text-sm font-medium text-[#003D8C] bg-white border border-[#003D8C] rounded-full px-4 py-2 hover:bg-[#003D8C] hover:text-white transition-colors disabled:opacity-50"
              >
                📍 Use My Current Location
              </button>

              <Reusable_Button
                variant="primary"
                onClick={handleCreateUnit}
                className="rounded-md px-6"
                disabled={isLoader}
              >
                Save Unit
              </Reusable_Button>

              <Reusable_Button
                variant="secondary"
                onClick={() => setShowAddUnitForm(false)}
                className="rounded-md"
                disabled={isLoader}
              >
                Cancel
              </Reusable_Button>
            </div>
          </div>
        )}

        <div className="flex gap-4 mt-2">
          <Reusable_Button
            variant="secondary"
            className="!text-gray-600 !border-gray-300 !bg-white hover:!bg-gray-50 rounded-full px-8"
            onClick={() => navigate("/super-manager/user-management")}
            disabled={isLoader || saving}
          >
            Cancel
          </Reusable_Button>

          <Reusable_Button
            onClick={handleSubmit}
            variant="primary"
            leftIcon={<FiSave size={18} />}
            className="rounded-full px-6"
            disabled={isLoader || saving}
          >
            {isEditMode ? "Update User" : "Create User"}
          </Reusable_Button>
        </div>
      </div>
    </div>
  );
};

export default Add_User;