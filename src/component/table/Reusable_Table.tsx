import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { BsSearch } from "react-icons/bs";
import { FaUserCheck } from "react-icons/fa6";
import {
  FiCheck,
  FiChevronLeft,
  FiChevronRight,
  FiColumns,
  FiDownload,
  FiEdit,
  FiEye,
  FiFile,
  FiFileText,
  FiFilter,
  FiGrid,
  FiMoreVertical,
  FiRefreshCcw,
  FiSearch,
  FiTrash2,
  FiX,
} from "react-icons/fi";

import * as XLSX from "xlsx";

export type ColumnType = "text" | "badge" | "sla" | "date";

export interface TableColumn<T = any> {
  key: keyof T | string;
  label: string;
  type?: ColumnType;
}

export interface TableFilter {
  key: string;
  label: string;
  options: string[];
}

type ActionFlag<T> = boolean | ((row: T) => boolean);

export interface TableActions<T = any> {
  showView?: ActionFlag<T>;
  showEdit?: ActionFlag<T>;
  showDelete?: ActionFlag<T>;
  showReopen?: ActionFlag<T>;
  showInvestigation?: ActionFlag<T>;
  showOpenQueue?: ActionFlag<T>;

  showAssign?: ActionFlag<T>;

  onView?: (row: T) => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  onReopen?: (row: T) => void;
  onInvestigation?: (row: T) => void;
  onOpenQueue?: (row: T) => void;

  onAssign?: (row: T) => void;

  onRowClick?: (row: T) => void;
}

interface ReusableTableProps<T = any> {
  columns: TableColumn<T>[];
  data: T[];
  actions?: TableActions<T>;
  tableName?: string;
  filters?: TableFilter[];
  enableSelection?: boolean;
  idKey?: keyof T;
  onSelectionChange?: (selectedRows: T[]) => void;
  itemsPerPage?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  showSearch?: boolean;
  showFilters?: boolean;
  showColumnControls?: boolean;
  showExport?: boolean;
  showPagination?: boolean;
  showActions?: boolean;
  maxHeight?: string;
  hideScrollbar?: boolean;
}

const getBadgeStyle = (value: string) => {
  const lowerVal = value?.toString().toLowerCase() || "";
  if (["high", "breached"].includes(lowerVal))
    return "bg-red-50 text-red-600 border-red-100";
  if (["medium", "open", "pending"].includes(lowerVal))
    return "bg-amber-50 text-amber-600 border-amber-100";
  if (["resolved", "active", "on track", "completed"].includes(lowerVal))
    return "bg-emerald-50 text-emerald-600 border-emerald-100";
  return "bg-gray-50 text-gray-600 border-gray-200";
};

const evaluateFlag = <T,>(flag: ActionFlag<T> | undefined, row: T): boolean => {
  if (typeof flag === "function") return flag(row);
  return Boolean(flag);
};

const Reusable_Table = <T extends Record<string, any>>({
  columns,
  data,
  actions,
  tableName = "Data_Export",
  filters = [],

  enableSelection = false,
  idKey = "id" as keyof T,
  onSelectionChange,

  itemsPerPage = 6,
  currentPage = 1,
  onPageChange,

  showSearch = true,
  showFilters = true,
  showColumnControls = true,
  showExport = true,
  showPagination = true,
  showActions = true,

  maxHeight = "380px",
  hideScrollbar = false,
}: ReusableTableProps<T>) => {
  const hasActions =
    actions &&
    showActions &&
    (actions.showView ||
      actions.showEdit ||
      actions.showDelete ||
      actions.showReopen ||
      actions.showInvestigation ||
      actions.showAssign ||
      actions.showOpenQueue);

  const [globalSearch, setGlobalSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    columns.map((c) => c.key as string)
  );
  const [isColumnDropdownOpen, setIsColumnDropdownOpen] = useState(false);
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const [pageSize, setPageSize] = useState(itemsPerPage);
  const [openDropdownId, setOpenDropdownId] = useState<any>(null);
  const [selectedRowIds, setSelectedRowIds] = useState<Set<any>>(new Set());

  const tableContainerRef = useRef<HTMLDivElement>(null);

  const filteredData = useMemo(() => {
    return data.filter((row) => {
      const matchesSearch =
        !globalSearch.trim() ||
        visibleColumns.some((colKey) =>
          String(row[colKey] || "")
            .toLowerCase()
            .includes(globalSearch.toLowerCase())
        );

      const matchesFilters = Object.entries(activeFilters).every(([key, val]) => {
        if (!val) return true;
        return String(row[key] || "").toLowerCase() === val.toLowerCase();
      });

      return matchesSearch && matchesFilters;
    });
  }, [data, globalSearch, visibleColumns, activeFilters]);

  const calculatedTotalPages = Math.max(
    1,
    Math.ceil(filteredData.length / pageSize)
  );
  const safeCurrentPage = Math.min(currentPage, calculatedTotalPages);
  const displayData = filteredData.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize
  );

  useEffect(() => {
    if (onSelectionChange) {
      const selectedData = data.filter((row) => selectedRowIds.has(row[idKey]));
      onSelectionChange(selectedData);
    }
  }, [selectedRowIds, data, idKey, onSelectionChange]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const pageIds = displayData.map((row) => row[idKey]);
      setSelectedRowIds((prev) => new Set([...prev, ...pageIds]));
    } else {
      const pageIds = displayData.map((row) => row[idKey]);
      setSelectedRowIds((prev) => {
        const next = new Set(prev);
        pageIds.forEach((id) => next.delete(id));
        return next;
      });
    }
  };

  const handleSelectRow = (rowId: any) => {
    const newSelected = new Set(selectedRowIds);
    if (newSelected.has(rowId)) newSelected.delete(rowId);
    else newSelected.add(rowId);
    setSelectedRowIds(newSelected);
  };

  const isAllCurrentPageSelected =
    displayData.length > 0 &&
    displayData.every((row) => selectedRowIds.has(row[idKey]));

  const getExportData = () => {
    const dataToExport =
      selectedRowIds.size > 0
        ? filteredData.filter((row) => selectedRowIds.has(row[idKey]))
        : filteredData;
    return dataToExport.map((row) => {
      const obj: any = {};
      visibleColumns.forEach((colKey) => {
        const colDef = columns.find((c) => c.key === colKey);
        if (colDef) obj[colDef.label] = row[colKey];
      });
      return obj;
    });
  };

  const handleExportCSV = () => {
    const ws = XLSX.utils.json_to_sheet(getExportData());
    const csvOutput = XLSX.utils.sheet_to_csv(ws);
    const link = document.createElement("a");
    link.href = URL.createObjectURL(
      new Blob([csvOutput], { type: "text/csv;charset=utf-8;" })
    );
    link.download = `${tableName}.csv`;
    link.click();
    setIsExportDropdownOpen(false);
  };

  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(getExportData());
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, `${tableName}.xlsx`);
    setIsExportDropdownOpen(false);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const tableColumns = visibleColumns.map(
      (colKey) => columns.find((c) => c.key === colKey)?.label || ""
    );
    const tableRows = getExportData().map((row) =>
      Object.values(row).map((value) => String(value ?? ""))
    );
    autoTable(doc, {
      head: [tableColumns],
      body: tableRows,
      theme: "grid",
      headStyles: { fillColor: [0, 61, 140] },
    });
    doc.save(`${tableName}.pdf`);
    setIsExportDropdownOpen(false);
  };

  const handleRowClick = (row: T, e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.closest("button") ||
      target.closest("input[type='checkbox']") ||
      target.closest(".action-dropdown")
    ) {
      return;
    }
    if (actions?.onRowClick) {
      actions.onRowClick(row);
    }
  };

  const scrollbarStyles = hideScrollbar
    ? {
        scrollbarWidth: "none" as const,
        msOverflowStyle: "none" as const,
        "&::-webkit-scrollbar": {
          display: "none",
        },
      }
    : {};

  return (
    <div className="w-full">
      {(openDropdownId || isColumnDropdownOpen || isExportDropdownOpen) && (
        <div
          className="fixed inset-0 z-[50]"
          onClick={() => {
            setOpenDropdownId(null);
            setIsColumnDropdownOpen(false);
            setIsExportDropdownOpen(false);
          }}
        />
      )}

      {(showSearch || showFilters || showColumnControls || showExport) && (
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex flex-wrap items-center gap-3">
            {showSearch && (
              <div className="relative">
                <FiSearch
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Search..."
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 text-[13px] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003D8C]/20 bg-gray-50/50 text-gray-700 w-[200px] sm:w-[260px]"
                />
              </div>
            )}

            {showFilters && filters.length > 0 && (
              <div className="flex items-center gap-2">
                <FiFilter className="text-gray-400" size={16} />
                {filters.map((filter) => (
                  <select
                    key={filter.key}
                    value={activeFilters[filter.key] || ""}
                    onChange={(e) => {
                      setActiveFilters((prev) => ({
                        ...prev,
                        [filter.key]: e.target.value,
                      }));
                      onPageChange?.(1);
                    }}
                    className="px-3 py-1.5 text-[13px] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003D8C]/20 bg-gray-50/50 text-gray-700 cursor-pointer min-w-[140px]"
                  >
                    <option value="">All {filter.label}</option>
                    {filter.options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {showColumnControls && (
              <div
                className={`relative ${
                  isColumnDropdownOpen ? "z-[60]" : "z-10"
                }`}
              >
                <button
                  onClick={() => setIsColumnDropdownOpen(!isColumnDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 text-[13px] font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-[#003D8C] transition-colors shadow-sm cursor-pointer"
                >
                  <FiColumns size={15} /> Columns
                </button>
                {isColumnDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-gray-100 rounded-lg shadow-xl py-2 z-50">
                    <div className="px-3 pb-2 mb-2 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      Show / Hide Columns
                    </div>
                    {columns.map((col) => (
                      <label
                        key={col.key as string}
                        className="flex items-center gap-3 px-4 py-2 w-full text-[13px] text-gray-700 hover:bg-gray-100 cursor-pointer select-none"
                      >
                        <input
                          type="checkbox"
                          className="accent-[#003D8C] w-3.5 h-3.5 cursor-pointer pointer-events-auto"
                          checked={visibleColumns.includes(col.key as string)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setVisibleColumns([
                                ...visibleColumns,
                                col.key as string,
                              ]);
                            } else if (visibleColumns.length > 1) {
                              setVisibleColumns(
                                visibleColumns.filter((k) => k !== col.key)
                              );
                            }
                          }}
                        />
                        {col.label}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}

            {showExport && (
              <div
                className={`relative ${
                  isExportDropdownOpen ? "z-[60]" : "z-10"
                }`}
              >
                <button
                  onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
                  className="flex items-center gap-2 px-4 py-2 text-[13px] font-semibold text-white bg-[#003D8C] border border-[#003D8C] rounded-lg hover:bg-[#002f6c] transition-colors shadow-sm cursor-pointer"
                >
                  <FiDownload size={15} /> Export
                </button>
                {isExportDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-40 bg-white border border-gray-100 rounded-lg shadow-xl py-1.5 z-50">
                    <button
                      type="button"
                      onClick={handleExportCSV}
                      className="flex items-center gap-3 px-4 py-2 w-full text-left text-[13px] font-medium text-gray-700 hover:bg-gray-100 hover:text-[#003D8C] cursor-pointer transition-colors"
                    >
                      <FiFileText size={15} /> CSV
                    </button>
                    <button
                      type="button"
                      onClick={handleExportExcel}
                      className="flex items-center gap-3 px-4 py-2 w-full text-left text-[13px] font-medium text-gray-700 hover:bg-gray-100 hover:text-[#003D8C] cursor-pointer transition-colors"
                    >
                      <FiGrid size={15} /> Excel
                    </button>
                    <button
                      type="button"
                      onClick={handleExportPDF}
                      className="flex items-center gap-3 px-4 py-2 w-full text-left text-[13px] font-medium text-gray-700 hover:bg-gray-100 hover:text-[#003D8C] cursor-pointer transition-colors"
                    >
                      <FiFile size={15} /> PDF
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <div
        ref={tableContainerRef}
        className="relative overflow-auto border border-gray-200 rounded-xl shadow-sm"
        style={{
          maxHeight,
          ...scrollbarStyles,
        }}
      >
        <table className="w-full border-collapse text-sm">
          <thead className="bg-white sticky top-0 z-30">
            <tr>
              {enableSelection && (
                <th className="sticky left-0 top-0 z-40 bg-white border-b border-r border-gray-200 py-3 px-4 w-10 text-center shadow-[1px_0_0_0_#f3f4f6]">
                  <input
                    type="checkbox"
                    className="w-3.5 h-3.5 cursor-pointer accent-[#003D8C] rounded border-gray-300 focus:ring-[#003D8C]"
                    checked={isAllCurrentPageSelected}
                    onChange={handleSelectAll}
                  />
                </th>
              )}

              {columns
                .filter((c) => visibleColumns.includes(c.key as string))
                .map((col, index) => (
                  <th
                    key={index}
                    className="sticky top-0 z-30 bg-white border-b border-gray-200 py-3 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap text-left"
                  >
                    {col.label}
                  </th>
                ))}

              {hasActions && (
                <th className="sticky right-0 top-0 z-40 bg-white border-b border-l border-gray-200 py-3 px-2 w-14 text-[11px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap text-center shadow-[-1px_0_0_0_#f3f4f6]">
                  Actions
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {displayData.length === 0 ? (
              <tr>
                <td
                  colSpan={
                    visibleColumns.length +
                    (hasActions ? 1 : 0) +
                    (enableSelection ? 1 : 0)
                  }
                  className="py-12 text-center text-gray-400 text-[13px]"
                >
                  No matching records found.
                </td>
              </tr>
            ) : (
              displayData.map((row, rowIndex) => {
                const rowId = row[idKey] || rowIndex;
                const isSelected = selectedRowIds.has(rowId);
                const isDropdownOpen = openDropdownId === rowId;
                const isNearBottom =
                  rowIndex > 3 && rowIndex >= displayData.length - 2;

                const canView = evaluateFlag(actions?.showView, row);
                const canEdit = evaluateFlag(actions?.showEdit, row);
                const canDelete = evaluateFlag(actions?.showDelete, row);
                const canReopen = evaluateFlag(actions?.showReopen, row);
                const canInvestigate = evaluateFlag(
                  actions?.showInvestigation,
                  row
                );
                const canAssign = evaluateFlag(actions?.showAssign, row);
                const canOpenQueue = evaluateFlag(actions?.showOpenQueue, row);

                const hasAnyRowAction =
                  canView ||
                  canEdit ||
                  canDelete ||
                  canReopen ||
                  canInvestigate ||
                  canAssign ||
                  canOpenQueue;

                return (
                  <tr
                    key={rowIndex}
                    onClick={(e) => handleRowClick(row, e)}
                    className={`transition-colors duration-150 group hover:bg-gray-50/70 cursor-pointer ${
                      isSelected ? "bg-[#003D8C]/5" : "bg-white"
                    } ${
                      isDropdownOpen ? "relative z-[60]" : "relative z-10"
                    }`}
                  >
                    {enableSelection && (
                      <td className="sticky left-0 z-20 bg-inherit border-b border-r border-gray-100 py-3 px-4 text-center w-10 shadow-[1px_0_0_0_#f3f4f6]">
                        <input
                          type="checkbox"
                          className="w-3.5 h-3.5 cursor-pointer accent-[#003D8C] rounded border-gray-300 focus:ring-[#003D8C]"
                          checked={isSelected}
                          onChange={() => handleSelectRow(rowId)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                    )}

                    {columns
                      .filter((c) => visibleColumns.includes(c.key as string))
                      .map((col, colIndex) => {
                        const cellValue = row[col.key as keyof T];
                        return (
                          <td
                            key={colIndex}
                            className="border-b border-gray-100 py-3 px-4 text-[13px] whitespace-nowrap"
                          >
                            {col.type === "badge" ? (
                              <span
                                className={`inline-flex px-2 py-0.5 rounded-[4px] border text-[11px] font-semibold tracking-wide ${getBadgeStyle(
                                  cellValue
                                )}`}
                              >
                                {cellValue}
                              </span>
                            ) : col.type === "sla" ? (
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] border text-[11px] font-semibold tracking-wide ${getBadgeStyle(
                                  cellValue
                                )}`}
                              >
                                {cellValue?.toString().toLowerCase() ===
                                "breached" ? (
                                  <FiX size={12} strokeWidth={3} />
                                ) : (
                                  <FiCheck size={12} strokeWidth={3} />
                                )}
                                {cellValue}
                              </span>
                            ) : (
                              <span className="text-gray-700">{cellValue}</span>
                            )}
                          </td>
                        );
                      })}

                    {hasActions && (
                      <td
                        className={`sticky right-0 ${
                          isDropdownOpen ? "z-[65]" : "z-20"
                        } bg-inherit border-b border-l border-gray-100 py-3 px-2 w-14 whitespace-nowrap text-center shadow-[-1px_0_0_0_#f3f4f6]`}
                      >
                        {hasAnyRowAction && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenDropdownId(
                                isDropdownOpen ? null : rowId
                              );
                            }}
                            className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                              isDropdownOpen
                                ? "text-[#003D8C] bg-blue-50"
                                : "text-gray-400 hover:text-[#003D8C] hover:bg-gray-100"
                            }`}
                          >
                            <FiMoreVertical size={16} />
                          </button>
                        )}

                        {isDropdownOpen && (
                          <div
                            className={`absolute right-10 w-40 bg-white border border-gray-100 rounded-lg shadow-xl py-1.5 z-[70] flex flex-col text-left animate-in fade-in zoom-in-95 duration-100 action-dropdown ${
                              isNearBottom ? "bottom-8 mb-1" : "top-8 mt-1"
                            }`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {canView && (
                              <button
                                type="button"
                                onClick={() => {
                                  actions?.onView?.(row);
                                  setOpenDropdownId(null);
                                }}
                                className="flex items-center gap-2.5 px-4 py-2 text-[13px] font-medium text-gray-700 bg-transparent hover:bg-gray-100 hover:text-[#003D8C] cursor-pointer transition-colors w-full text-left"
                              >
                                <FiEye size={14} /> View
                              </button>
                            )}

                            {canEdit && (
                              <button
                                type="button"
                                onClick={() => {
                                  actions?.onEdit?.(row);
                                  setOpenDropdownId(null);
                                }}
                                className="flex items-center gap-2.5 px-4 py-2 text-[13px] font-medium text-gray-700 bg-transparent hover:bg-gray-100 hover:text-[#003D8C] cursor-pointer transition-colors w-full text-left"
                              >
                                <FiEdit size={14} /> Edit
                              </button>
                            )}

                            {canReopen && (
                              <button
                                type="button"
                                onClick={() => {
                                  actions?.onReopen?.(row);
                                  setOpenDropdownId(null);
                                }}
                                className="flex items-center gap-2.5 px-4 py-2 text-[13px] font-medium text-amber-600 bg-transparent hover:bg-amber-50 cursor-pointer transition-colors w-full text-left"
                              >
                                <FiRefreshCcw size={14} /> Reopen
                              </button>
                            )}

                            {canInvestigate && (
                              <button
                                type="button"
                                onClick={() => {
                                  actions?.onInvestigation?.(row);
                                  setOpenDropdownId(null);
                                }}
                                className="flex items-center gap-2.5 px-4 py-2 text-[13px] font-medium text-amber-600 bg-transparent hover:bg-amber-50 cursor-pointer transition-colors w-full text-left"
                              >
                                <BsSearch size={14} /> Investigation
                              </button>
                            )}

                            {canAssign && (
                              <button
                                type="button"
                                onClick={() => {
                                  actions?.onAssign?.(row);
                                  setOpenDropdownId(null);
                                }}
                                className="flex items-center gap-2.5 px-4 py-2 text-[13px] font-medium text-green-600 bg-transparent hover:bg-green-50 cursor-pointer transition-colors w-full text-left"
                              >
                                <FaUserCheck size={14} /> Assign
                              </button>
                            )}

                            {canOpenQueue && (
                              <button
                                type="button"
                                onClick={() => {
                                  actions?.onOpenQueue?.(row);
                                  setOpenDropdownId(null);
                                }}
                                className="flex items-center gap-2.5 px-4 py-2 text-[13px] font-medium text-green-600 bg-transparent hover:bg-green-50 cursor-pointer transition-colors w-full text-left"
                              >
                                <FaUserCheck size={14} /> Open Queue
                              </button>
                            )}

                            {canDelete && (
                              <>
                                {(canView ||
                                  canEdit ||
                                  canReopen ||
                                  canInvestigate ||
                                  canAssign) && (
                                  <div className="h-px bg-gray-100 my-1 w-full" />
                                )}
                                <button
                                  type="button"
                                  onClick={() => {
                                    actions?.onDelete?.(row);
                                    setOpenDropdownId(null);
                                  }}
                                  className="flex items-center gap-2.5 px-4 py-2 text-[13px] font-medium text-red-600 bg-transparent hover:bg-red-50 cursor-pointer transition-colors w-full text-left"
                                >
                                  <FiTrash2 size={14} /> Delete
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {showPagination && calculatedTotalPages > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-4 mt-4">
          <div className="flex items-center gap-4">
            <span className="text-[12px] text-gray-500">
              Showing{" "}
              <strong className="text-gray-700">
                {displayData.length === 0
                  ? 0
                  : (safeCurrentPage - 1) * pageSize + 1}
              </strong>{" "}
              to{" "}
              <strong className="text-gray-700">
                {Math.min(safeCurrentPage * pageSize, filteredData.length)}
              </strong>{" "}
              of{" "}
              <strong className="text-gray-700">{filteredData.length}</strong>
            </span>

            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                onPageChange?.(1);
              }}
              className="text-[12px] font-medium border border-gray-200 rounded-md px-2 py-1 text-gray-600 focus:outline-none focus:border-[#003D8C] cursor-pointer bg-white shadow-sm"
            >
              {[6, 10, 20, 50, 100].map((size) => (
                <option key={size} value={size}>
                  Show {size}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onPageChange?.(safeCurrentPage - 1)}
              disabled={safeCurrentPage === 1}
              className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-all"
            >
              <FiChevronLeft size={16} />
            </button>

            {Array.from({ length: calculatedTotalPages }, (_, i) => i + 1).map(
              (page) => (
                <button
                  key={page}
                  onClick={() => onPageChange?.(page)}
                  className={`w-7 h-7 flex items-center justify-center rounded-[4px] text-[13px] font-medium cursor-pointer transition-all ${
                    safeCurrentPage === page
                      ? "bg-[#003D8C] text-white shadow-sm shadow-[#003D8C]/20"
                      : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                  }`}
                >
                  {page}
                </button>
              )
            )}

            <button
              onClick={() => onPageChange?.(safeCurrentPage + 1)}
              disabled={safeCurrentPage === calculatedTotalPages}
              className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-all"
            >
              <FiChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reusable_Table;