import { FaUserShield } from "react-icons/fa";
import {
  FiBriefcase,
  FiMapPin,
  FiTrendingUp,
  FiUserCheck,
  FiUsers
} from "react-icons/fi";
import Reusable_Stat from "../../../component/stats/Reusable_Stat";
import DepAdmin_DashboardChart from "./DepAdmin_DashboardChart";

const Dashboard = () => {
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
        <Reusable_Stat
          title="Total Users"
          value="52"
          icon={FiUsers}
          subText="+3 this month"
          subIcon={FiTrendingUp}
          subTextColor="blue"
        />
        <Reusable_Stat
          title="Active"
          value="48"
          icon={FiUserCheck}
          subText="92% active"
          subTextColor="green"
        />
        <Reusable_Stat
          title="Employees"
          value="36"
          icon={FiBriefcase}
          subText="69% of users"
          subTextColor="gray"
        />
        <Reusable_Stat
          title="Executives"
          value="14"
          icon={FaUserShield}
          subText="27% of users"
          subTextColor="gray"
        />
        <Reusable_Stat
          title="Locations"
          value="8"
          icon={FiMapPin}
          subText="Across 8 locations"
          subTextColor="gray"
        />
      </div>

      <div className="mt-6">
        <DepAdmin_DashboardChart />
      </div>

    </div>
  );
};

export default Dashboard;