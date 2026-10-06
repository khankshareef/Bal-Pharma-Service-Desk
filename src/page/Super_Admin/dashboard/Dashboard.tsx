import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { FaUserShield } from "react-icons/fa";
import {
  FiBriefcase,
  FiMapPin,
  FiTrendingUp,
  FiUserCheck,
  FiUsers,
} from "react-icons/fi";

import Reusable_Stat from "../../../component/stats/Reusable_Stat";
import type { AppDispatch, RootState } from "../../../store/store/Store";
import { fetchSuperManagerDashboard } from "../../../store/super_admin/slice/superManagerDashboardSlice";
import SuperAdmin_DashboardChart from "./SuperAdmin_DashboardChart";

const Dashboard = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data } = useSelector((s: RootState) => s.superManagerDashboard);

  useEffect(() => {
    dispatch(fetchSuperManagerDashboard());
  }, [dispatch]);

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
        <Reusable_Stat
          title="Total Users"
          value={String(data?.totalUsers ?? 0)}
          icon={FiUsers}
          subText={data?.totalUsersHint ?? "—"}
          subIcon={FiTrendingUp}
          subTextColor="blue"
        />
        <Reusable_Stat
          title="Active"
          value={String(data?.activeUsers ?? 0)}
          icon={FiUserCheck}
          subText={data?.activeUsersHint ?? "—"}
          subTextColor="green"
        />
        <Reusable_Stat
          title="Employees"
          value={String(data?.employees ?? 0)}
          icon={FiBriefcase}
          subText={data?.employeesHint ?? "—"}
          subTextColor="gray"
        />
        <Reusable_Stat
          title="Executives"
          value={String(data?.executives ?? 0)}
          icon={FaUserShield}
          subText={data?.executivesHint ?? "—"}
          subTextColor="gray"
        />
        <Reusable_Stat
          title="Locations"
          value={String(data?.locations ?? 0)}
          icon={FiMapPin}
          subText={data?.locationsHint ?? "—"}
          subTextColor="gray"
        />
      </div>

      <div className="mt-6">
        <SuperAdmin_DashboardChart />
      </div>
    </div>
  );
};

export default Dashboard;