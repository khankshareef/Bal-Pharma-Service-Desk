import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import Loader from "../../../component/loader/Loader";
import Reusable_Table, { type TableColumn } from "../../../component/table/Reusable_Table";

import type { AppDispatch, RootState } from "../../../store/store/Store";
import {
  fetchPriorities,
  fetchStatuses,
  type PriorityConfig,
  type StatusConfig,
} from "../../../store/super_admin/slice/configSlice";

const StatusPill = ({ active }: { active: boolean }) =>
  active ? (
    <span className="px-3 py-1 text-xs font-semibold bg-[#DCFCE7] text-[#166534] rounded-full">
      Active
    </span>
  ) : (
    <span className="px-3 py-1 text-xs font-semibold bg-[#FEF3C7] text-[#92400E] rounded-full">
      Inactive
    </span>
  );

interface PriorityRow {
  id: number;
  PriorityID: string;
  Name: string;
  Tickets: number;
  Status: React.ReactNode;
}

interface StatusRow {
  id: number;
  StatusID: string;
  Name: string;
  Tickets: number;
  Status: React.ReactNode;
}

const Config = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { priorities, statuses, loading } = useSelector(
    (s: RootState) => s.config
  );

  useEffect(() => {
    dispatch(fetchPriorities());
    dispatch(fetchStatuses());
  }, [dispatch]);

  const priorityData: PriorityRow[] = useMemo(
    () =>
      priorities.map((p: PriorityConfig) => ({
        id: p.id,
        PriorityID: p.priorityId,
        Name: p.name,
        Tickets: p.tickets,
        Status: <StatusPill active={p.active} />,
      })),
    [priorities]
  );

  const statusData: StatusRow[] = useMemo(
    () =>
      statuses.map((s: StatusConfig) => ({
        id: s.id,
        StatusID: s.statusId,
        Name: s.name,
        Tickets: s.tickets,
        Status: <StatusPill active={s.active} />,
      })),
    [statuses]
  );

  const priorityColumns: TableColumn<PriorityRow>[] = useMemo(
    () => [
      { key: "PriorityID", label: "Priority ID", type: "text" },
      { key: "Name",       label: "Name",        type: "text" },
      { key: "Tickets",    label: "Tickets",     type: "text" },
      { key: "Status",     label: "Status",      type: "text" },
    ],
    []
  );

  const statusColumns: TableColumn<StatusRow>[] = useMemo(
    () => [
      { key: "StatusID", label: "Status ID", type: "text" },
      { key: "Name",     label: "Name",      type: "text" },
      { key: "Tickets",  label: "Tickets",   type: "text" },
      { key: "Status",   label: "Status",    type: "text" },
    ],
    []
  );

  const handleEditPriority = (row: PriorityRow) =>
    navigate(`edit-priority/${row.id}`);

  const handleEditStatus = (row: StatusRow) =>
    navigate(`edit-status/${row.id}`);

  if (loading && priorities.length === 0 && statuses.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto font-sans">
      <div className="flex justify-between items-end mb-8">
        <h1 className="text-2xl font-bold text-[#002D5B]">
          Priority &amp; Status Configuration
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Priority Configuration
          </h2>

          {priorityData.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
              <p className="text-sm text-gray-500">No priorities configured.</p>
            </div>
          ) : (
            <Reusable_Table
              columns={priorityColumns}
              data={priorityData}
              idKey="id"
              showSearch={true}
              showFilters={true}
              showExport={true}
              showPagination={false}
              showActions={true}
              enableSelection={false}
              actions={{
                showView: false,
                showEdit: true,
                showDelete: false,
                showReopen: false,
                onEdit: handleEditPriority,
                onDelete: () => {},
                onReopen: () => {},
              }}
            />
          )}
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Status Configuration
          </h2>

          {statusData.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
              <p className="text-sm text-gray-500">No statuses configured.</p>
            </div>
          ) : (
            <Reusable_Table
              columns={statusColumns}
              data={statusData}
              idKey="id"
              showSearch={true}
              showFilters={true}
              showExport={true}
              showPagination={false}
              showActions={true}
              enableSelection={false}
              actions={{
                showView: false,
                showEdit: true,
                showDelete: false,
                showReopen: false,
                onEdit: handleEditStatus,
                onDelete: () => {},
                onReopen: () => {},
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Config;