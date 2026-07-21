"use client";

import React from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type Table as TanstackTable,
  type RowData,
} from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DataTableProps<TData extends RowData> {
  /** Row data array */
  data: TData[];
  /** TanStack column definitions */
  columns: ColumnDef<TData>[];
  /** Show a loading state instead of data rows */
  isLoading?: boolean;
  /** Text shown when there are no rows */
  emptyMessage?: string;
  /** Optional click handler — adds cursor-pointer and hover styling */
  onRowClick?: (row: TData) => void;
  /** Initial page size (default: 10). Pass false to disable pagination. */
  defaultPageSize?: number | false;
  /** Global filter string (e.g. from a search input) */
  globalFilter?: string;
  /** Callback when global filter changes */
  onGlobalFilterChange?: (value: string) => void;
  /** Total number of pages for server-side pagination */
  pageCount?: number;
  /** Current pagination state for server-side pagination */
  pagination?: { pageIndex: number; pageSize: number };
  /** Callback when pagination changes for server-side pagination */
  onPaginationChange?: (updater: any) => void;
  /** Row selection state */
  rowSelection?: Record<string, boolean>;
  /** Callback for row selection change */
  onRowSelectionChange?: (updater: any) => void;
  /** Function to get a unique ID for each row */
  getRowId?: (row: TData) => string;
}

// ─── Pagination footer ────────────────────────────────────────────────────────

function DataTablePagination<TData>({
  table,
}: {
  table: TanstackTable<TData>;
}) {
  const { pageIndex, pageSize } = table.getState().pagination;
  const totalRows = table.getCoreRowModel().rows.length;
  const from = totalRows > 0 ? pageIndex * pageSize + 1 : 0;
  const to = Math.min((pageIndex + 1) * pageSize, totalRows);
  const pageCount = table.getPageCount() === 0 ? 1 : table.getPageCount();

  return (
    <div className="flex items-center justify-between mt-4">
      <div className="text-xs text-gray-500">
        Showing {from} to {to} of {totalRows} entries
      </div>

      <div className="flex items-center space-x-6 lg:space-x-8">
        {/* Rows per page */}
        <div className="flex items-center space-x-2">
          <p className="text-xs font-medium text-gray-500">Rows per page</p>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => table.setPageSize(Number(value))}
          >
            <SelectTrigger className="h-8 w-[70px] text-xs bg-white border-gray-200">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Page info */}
        <div className="flex w-[100px] items-center justify-center text-xs font-medium text-gray-500">
          Page {pageIndex + 1} of {pageCount}
        </div>

        {/* Navigation */}
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex bg-white"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0 bg-white"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0 bg-white"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex bg-white"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── TableRow ─────────────────────────────────────────────────────────────────

const TableRow = React.memo(function TableRow({ row, onRowClick, index, isSelected }: { row: any; onRowClick?: (row: any) => void; index: number; isSelected: boolean }) {
  return (
    <tr
      onClick={() => onRowClick?.(row.original)}
      className={[
        "border-b border-gray-200 last:border-0 transition-colors",
        index % 2 === 0 ? "bg-white" : "bg-gray-50/30",
        onRowClick ? "cursor-pointer hover:bg-gray-50" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {row.getVisibleCells().map((cell: any) => (
        <td
          key={cell.id}
          className={
            cell.column.id === "select" || cell.column.id === "tracking_code"
              ? "border-r border-gray-200 last:border-0 p-0 relative"
              : "p-3 border-r border-gray-200 last:border-0"
          }
        >
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </td>
      ))}
    </tr>
  );
}, (prev, next) => prev.row.id === next.row.id && prev.isSelected === next.isSelected && prev.row.original === next.row.original);

// ─── DataTable ────────────────────────────────────────────────────────────────

export function DataTable<TData extends RowData>({
  data,
  columns,
  isLoading = false,
  emptyMessage = "No data found.",
  onRowClick,
  defaultPageSize = 10,
  globalFilter,
  onGlobalFilterChange,
  pageCount,
  pagination,
  onPaginationChange,
  rowSelection,
  onRowSelectionChange,
  getRowId,
}: DataTableProps<TData>) {
  const hasPagination = defaultPageSize !== false;
  const isServerSidePagination = pageCount !== undefined;

  const state: any = {};
  if (globalFilter !== undefined) state.globalFilter = globalFilter;
  if (pagination !== undefined) state.pagination = pagination;
  if (rowSelection !== undefined) state.rowSelection = rowSelection;

  const table = useReactTable({
    data,
    columns,
    state: Object.keys(state).length > 0 ? state : undefined,
    onGlobalFilterChange,
    initialState: {
      ...(!pagination && { pagination: { pageSize: hasPagination ? defaultPageSize : data.length } }),
    },
    getCoreRowModel: getCoreRowModel(),
    ...(hasPagination && !isServerSidePagination && { getPaginationRowModel: getPaginationRowModel() }),
    ...(onGlobalFilterChange && { getFilteredRowModel: getFilteredRowModel() }),
    ...(isServerSidePagination && {
      manualPagination: true,
      pageCount,
      onPaginationChange,
    }),
    ...(onRowSelectionChange && { onRowSelectionChange }),
    ...(getRowId && { getRowId }),
  });

  return (
    <>
      <div className="overflow-x-auto border border-gray-200 rounded-xs">
        <table className="w-full text-xs text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="p-3 font-semibold text-gray-600 border-r border-gray-200 last:border-0"
                    style={{
                      width:
                        header.getSize() !== 150 ? header.getSize() : "auto",
                    }}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody>
            {isLoading ? (
              Array.from({ length: table.getState().pagination.pageSize }).map((_, rowIndex) => (
                <tr key={rowIndex} className="border-b border-gray-200 last:border-0">
                  {columns.map((_, cellIndex) => (
                    <td key={cellIndex} className="p-3 border-r border-gray-200 last:border-0">
                      <Skeleton className="h-13 w-full bg-gray-100" />
                    </td>
                  ))}
                </tr>
              ))
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="p-6 text-center text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row, i) => (
                <TableRow
                  key={row.id}
                  row={row}
                  index={i}
                  isSelected={row.getIsSelected()}
                  onRowClick={onRowClick}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {hasPagination && <DataTablePagination table={table} />}
    </>
  );
}
