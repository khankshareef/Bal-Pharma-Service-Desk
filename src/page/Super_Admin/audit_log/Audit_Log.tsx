import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import Loader from "../../../component/loader/Loader";
import Reusable_Table, { type TableColumn } from "../../../component/table/Reusable_Table";
import type { AppDispatch, RootState } from "../../../store/store/Store";
import {
  fetchAuditLog,
  type AuditRow,
} from "../../../store/super_admin/slice/auditLogSlice";

const Audit_Log = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [currentPage, setCurrentPage] = useState(1);

  const { data, loading } = useSelector((s: RootState) => s.auditLog);

  useEffect(() => {
    dispatch(fetchAuditLog());
  }, [dispatch]);

  const auditColumns: TableColumn<AuditRow>[] = useMemo(
    () => [
      { key: "timestamp", label: "Timestamp", type: "text" },
      { key: "user",      label: "User",      type: "text" },
      { key: "action",    label: "Action",    type: "text" },
      { key: "type",      label: "Type",      type: "badge" },
      { key: "unit",      label: "Unit",      type: "badge" },
      { key: "details",   label: "Details",   type: "text" },
    ],
    []
  );

  return (
    <div className="max-w-full font-sans">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#002D5B]">Audit Log</h1>
        </div>
      </div>

      {loading && data.length === 0 ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <Loader />
        </div>
      ) : data.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-500 font-medium">No audit entries yet.</p>
        </div>
      ) : (
        <Reusable_Table
          columns={auditColumns}
          data={data}
          idKey="id"
          itemsPerPage={10}
          currentPage={currentPage}
          onPageChange={(page) => setCurrentPage(page)}
          showSearch={true}
          showFilters={true}
          showColumnControls={true}
          showExport={true}
          showPagination={true}
          showActions={false}
          enableSelection={false}
          filters={[
            {
              key: "type",
              label: "All Types",
              options: ["Admin", "Security", "User", "System"],
            },
            {
              key: "unit",
              label: "All Units",
              options: ["All", "Unit 2", "Unit 3"],
            },
          ]}
        />
      )}
    </div>
  );
};

export default Audit_Log;