"use client";

import { BarChart2, ClipboardList, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { useVendors } from "./vendors.queries";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { CreateUserDialog } from "@/src/components/users/create-user-dialog";

type Vendor = NonNullable<ReturnType<typeof useVendors>["data"]>["results"][number];

function buildColumns(router: AppRouterInstance): ColumnDef<Vendor>[] {
  return [
    {
      id: "sn",
      header: "S.N.",
      cell: ({ row }) => (
        <span className="text-gray-500 text-xs">{row.index + 1}</span>
      ),
      size: 50,
    },
    {
      id: "name",
      header: "Vendor Name",
      cell: ({ row }) => {
        const { first_name, last_name, username, new_order_count } = row.original;
        const displayName =
          first_name || last_name
            ? `${first_name} ${last_name}`.trim()
            : username;
        return (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-black font-medium">{displayName}</span>
            {new_order_count > 0 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-xs text-xs font-normal text-white bg-orange-500">
                {new_order_count} New Orders
              </span>
            )}
          </div>
        );
      },
    },
    {
      id: "contact",
      header: "Contact",
      cell: ({ row }) => {
        const { email, phone_number } = row.original;
        return (
          <div className="flex flex-col gap-1 text-xs">
            <span className="text-gray-700">{email}</span>
            {phone_number && (
              <span className="text-gray-400">{phone_number}</span>
            )}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const { id } = row.original;
        return (
          <div
            className="flex items-center gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => router.push(`/dashboard/vendors/${id}`)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-700 font-normal border border-gray-200 rounded hover:bg-gray-50 transition-colors"
            >
              <BarChart2 className="h-3.5 w-3.5 text-gray-400" />
              Analytics
            </button>
            <button
              type="button"
              onClick={() => router.push(`/dashboard/vendors/${id}`)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-700 font-normal border border-gray-200 rounded hover:bg-gray-50 transition-colors"
            >
              <ClipboardList className="h-3.5 w-3.5 text-gray-400" />
              Orders
            </button>
          </div>
        );
      },
    },
  ];
}

export function VendorsView() {
  const router = useRouter();
  const columns = buildColumns(router);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [hasNewOrder, setHasNewOrder] = useState<boolean | undefined>(undefined);

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    clearTimeout((handleSearch as any)._t);
    (handleSearch as any)._t = setTimeout(() => {
      setDebouncedSearch(value);
    }, 400);
  }, []);

  const { data, isLoading, isError } = useVendors({
    search: debouncedSearch || undefined,
    has_new_order: hasNewOrder,
  });

  if (isError) {
    return (
      <div className="p-6 md:px-8 md:py-6 max-w-screen-xl mx-auto w-full">
        <div className="bg-red-50 text-red-500 p-4 rounded border border-red-200">
          Failed to load vendors. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:px-8 md:py-6 max-w-screen-xl mx-auto w-full">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl text-black font-medium">Vendors</h1>
            <span className="text-sm text-gray-500 font-light border border-gray-200 rounded px-2.5 py-1">
              {data?.count ?? 0} Total
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <CreateUserDialog
            defaultRole="vendor"
            roleLocked
            triggerLabel="Create Vendor"
          />
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="relative w-full sm:max-w-xs md:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name, email, or username..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xs focus:outline-none focus:ring-1 focus:ring-[#e8611a] focus:border-[#e8611a] bg-white text-gray-900 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            onClick={() => setHasNewOrder(undefined)}
            variant={`${hasNewOrder === undefined ? "secondary" : "outline"}`}
          >
            All Vendors
          </Button>
          <Button
            type="button"
            onClick={() => setHasNewOrder(true)}
            variant={`${hasNewOrder === true ? "secondary" : "outline"}`}
          >
            New Orders
          </Button>
        </div>
      </div>

      <DataTable
        data={data?.results ?? []}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="No vendors found."
        onRowClick={(vendor) => router.push(`/dashboard/vendors/${vendor.id}`)}
      />
    </div>
  );
}
