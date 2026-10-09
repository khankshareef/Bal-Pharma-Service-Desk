import { useCallback, useEffect, useMemo, useState } from "react";
import { FaHospitalUser, FaUsers } from "react-icons/fa";
import { FaUserCheck, FaUserPlus, FaUserTie } from "react-icons/fa6";
import { FiTrash2 } from "react-icons/fi";
import { SiDatabricks } from "react-icons/si";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import Reusable_Button from "../../../component/button/Reusable_Button";
import Reusable_Stat from "../../../component/stats/Reusable_Stat";
import Reusable_Table, {
  type TableColumn,
} from "../../../component/table/Reusable_Table";

import Loader from "../../../component/loader/Loader";
import type { AppDispatch, RootState } from "../../../store/store/Store";
import {
  deleteUser,
  fetchUsers,
  fetchUserStats,
  type User,
} from "../../../store/super_admin/slice/usersSlice";

interface UserRow {
  id: number;
  EmployeeID: string;
  Name: string;
  Role: string;
  Department: string;
  Status: string;
  LastLogin: string;
}

const humanizeRole = (role: string) => {
  switch (role) {
    case "EMPLOYEE":       return "Employee";
    case "EXECUTIVE":      return "Executive";
    case "DEPUTY_MANAGER": return "Deputy Manager";
    case "SUPER_MANAGER":  return "Super Manager";
    case "ADMIN":          return "Admin";
    default:               return role;
  }
};



const User_Management = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { users, stats, loading } = useSelector((s: RootState) => s.users);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUsers, setSelectedUsers] = useState<UserRow[]>([]);

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchUserStats());
  }, [dispatch]);

  const userRows: UserRow[] = useMemo(
    () =>
      users.map((u: User) => ({
        id: u.id,
        EmployeeID: u.employeeId,
        Name: u.name,
         Role: Array.isArray(u.roles)
        ? u.roles.map((role) => humanizeRole(role)).join(", ")
        : "No Role",
        Department: u.department,
        Status: u.status === "ACTIVE" ? "Active" : "Inactive",
        LastLogin: u.lastLoginAt
          ? new Date(u.lastLoginAt).toLocaleString()
          : "Never",
      })),
    [users]
  );

  const userColumns: TableColumn<UserRow>[] = useMemo(
    () => [
      { key: "EmployeeID",    label: "Employee ID",  type: "text" },
      { key: "Name",          label: "Name",         type: "text" },
      { key: "Role",          label: "Role",         type: "text" },
      { key: "Department",    label: "Department",   type: "text" },
      { key: "Status",        label: "Status",       type: "badge" },
      { key: "LastLogin",     label: "Last Login",   type: "text" },
    ],
    []
  );

  const handleViewUser = useCallback(
  (row: UserRow) => {
    navigate(`user-details/${row.id}`);     
  },
  [navigate]
);

  const handleEditUser = useCallback(
  (row: UserRow) => {
    navigate(`edit-user/${row.id}`);      
  },
  [navigate]
);

  const handleDeleteUser = useCallback(
    async (row: UserRow) => {
      if (!confirm(`Delete user "${row.Name}" (${row.EmployeeID})?`)) return;
      try {
        await dispatch(deleteUser(row.id)).unwrap();
        dispatch(fetchUserStats());
      } catch (err: any) {
        alert(err?.error || err?.message || "Failed to delete user.");
      }
    },
    [dispatch]
  );

  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) return;
    if (!confirm(`Delete ${selectedUsers.length} user(s)? This cannot be undone.`))
      return;

    try {
      await Promise.all(
        selectedUsers.map((u) => dispatch(deleteUser(u.id)).unwrap())
      );
      setSelectedUsers([]);
      dispatch(fetchUserStats());
    } catch (err: any) {
      alert(err?.error || err?.message || "Bulk delete failed.");
    }
  };

  const handleSelectionChange = useCallback((selected: UserRow[]) => {
    setSelectedUsers(selected);
  }, []);

    if (loading && userRows.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div>
      <p className="text-2xl font-bold text-gray-800 mb-8">User Management</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <Reusable_Stat
          title="Total Users"
          value={stats?.totalUsers ?? 0}
          icon={FaUsers}
        />
        <Reusable_Stat
          title="Active"
          value={stats?.activeUsers ?? 0}
          icon={FaUserCheck}
        />
        <Reusable_Stat
          title="Employees"
          value={stats?.employees ?? 0}
          icon={FaHospitalUser}
        />
        <Reusable_Stat
          title="Executives"
          value={stats?.executives ?? 0}
          icon={FaUserTie}
        />
      </div>

      <div className="flex justify-between items-center mb-4 px-1 mt-8 mb-8">
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">
          Users{" "}
          {loading && users.length === 0 && (
            <span className="text-sm text-gray-400 font-normal ml-2">
              loading…
            </span>
          )}
        </h2>

        <div className="flex items-center gap-2">
          <Reusable_Button
            onClick={() => navigate("add-user")}
            children="Add User"
            variant="primary"
            leftIcon={<FaUserPlus />}
          />

          <Reusable_Button
            children="Bulk Ops"
            variant="secondary"
            leftIcon={<SiDatabricks />}
          />
        </div>

        {selectedUsers.length > 0 && (
          <button
            className="flex items-center gap-2 bg-rose-50 text-rose-600 border border-rose-200 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-rose-600 hover:text-white transition-colors duration-200 shadow-sm cursor-pointer"
            onClick={handleBulkDelete}
          >
            <FiTrash2 size={16} />
            Delete {selectedUsers.length} Selected
          </button>
        )}
      </div>

      <Reusable_Table
        columns={userColumns}
        data={userRows}
        enableSelection={true}
        idKey="id"
        onSelectionChange={handleSelectionChange}
        actions={{
          showView: true,
          showEdit: true,
          showDelete: true,
          showReopen: false,
          onView: handleViewUser,
          onEdit: handleEditUser,
          onDelete: handleDeleteUser,
          onRowClick: handleViewUser,
        }}
        itemsPerPage={6}
        currentPage={currentPage}
        onPageChange={(page) => setCurrentPage(page)}
        showSearch={true}
        showFilters={true}
        showColumnControls={true}
        showExport={true}
        showPagination={true}
        showActions={true}
        filters={[
          {
            key: "Role",
            label: "Role",
            options: [
              "Employee",
              "Executive",
              "Deputy Manager",
              "Super Manager",
              "Admin",
            ],
          },
          {
            key: "Status",
            label: "Status",
            options: ["Active", "Inactive"],
          },
          {
            key: "Department",
            label: "Department",
            options: ["IT", "QA", "PRODUCTION", "FINANCE", "HR"],
          },
        ]}
      />
    </div>
  );
};

export default User_Management;