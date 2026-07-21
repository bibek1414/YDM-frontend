"use client";

import { useState } from "react";
import {
  Trash2,
  Phone,
  Mail,
  Search,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import RoleGuard from "@/src/components/guards/role-guard";
import { useRouter } from "next/navigation";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { useRiders } from "@/src/hooks/use-rider";
import type { Rider } from "@/src/types/rider";
import { CreateUserDialog } from "@/src/components/users/create-user-dialog";
import { EditUserDialog } from "@/src/components/users/edit-user-dialog";
import { useDeleteUser } from "@/src/hooks/use-users";
import { useQueryClient } from "@tanstack/react-query";
import { RIDER_QUERY_KEYS } from "@/src/hooks/use-rider";
import type { User } from "@/src/services/users";

function RidersTable() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const router = useRouter();
  const queryClient = useQueryClient();
  const deleteUser = useDeleteUser();

  const { data, isLoading, isError } = useRiders(
    debouncedSearch ? { search: debouncedSearch } : undefined
  );

  const riders = data?.results ?? [];

  // Debounce search input
  function handleSearch(value: string) {
    setSearch(value);
    clearTimeout((handleSearch as any)._timer);
    (handleSearch as any)._timer = setTimeout(() => setDebouncedSearch(value), 400);
  }

  function handleDelete(rider: Rider) {
    if (!confirm(`Delete rider "${rider.first_name} ${rider.last_name}"? This cannot be undone.`))
      return;
    deleteUser.mutate(rider.id, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: RIDER_QUERY_KEYS.all });
      },
    });
  }

  const columns: ColumnDef<Rider>[] = [
    {
      id: "sn",
      header: "S.N.",
      cell: ({ row }) => (
        <span className="text-gray-400 text-xs">{row.index + 1}</span>
      ),
      size: 50,
    },
    {
      id: "name",
      header: "Rider Name",
      cell: ({ row }) => {
        const { first_name, last_name, username } = row.original;
        const name =
          first_name || last_name
            ? `${first_name} ${last_name}`.trim()
            : username;
        return (
          <span className="text-[#e8611a] font-medium text-sm">{name}</span>
        );
      },
    },
    {
      accessorKey: "phone_number",
      header: "Phone",
      cell: ({ getValue }) => (
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <Phone className="w-3 h-3 text-gray-400" />
          {(getValue() as string) || "—"}
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ getValue }) => (
        <div className="flex items-center gap-1.5 text-xs text-[#3b82f6]">
          <Mail className="w-3 h-3" />
          {getValue() as string}
        </div>
      ),
    },
    {
      accessorKey: "address",
      header: "Address",
      cell: ({ getValue }) => (
        <span className="text-xs text-gray-600">{(getValue() as string) || "—"}</span>
      ),
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ getValue }) => {
        const active = getValue() as boolean;
        return active ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-[11px] font-medium bg-green-50 text-green-700">
            <CheckCircle className="w-2.5 h-2.5" /> Active
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-[11px] font-medium bg-gray-100 text-gray-500">
            <XCircle className="w-2.5 h-2.5" /> Inactive
          </span>
        );
      },
    },
    {
      accessorKey: "date_joined",
      header: "Joined On",
      cell: ({ getValue }) => (
        <span className="text-xs text-gray-500">
          {new Date(getValue() as string).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        // Cast Rider → User shape for the edit dialog (same fields)
        const userShape: User = {
          id: row.original.id,
          username: row.original.username,
          email: row.original.email,
          first_name: row.original.first_name,
          last_name: row.original.last_name,
          phone_number: row.original.phone_number,
          address: row.original.address,
          role: row.original.role,
          is_active: row.original.is_active,
          date_joined: row.original.date_joined,
        };
        return (
          <div
            className="flex items-center gap-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            <EditUserDialog user={userShape} />
            <Button
              variant="destructive"
              size="icon-xs"
              onClick={() => handleDelete(row.original)}
              disabled={deleteUser.isPending}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        );
      },
    },
  ];

  if (isError) {
    return (
      <div className="bg-red-50 text-red-500 p-4 rounded border border-red-200 text-sm">
        Failed to load riders. Please try again.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-screen-xl mx-auto px-6 py-8 pb-20">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-medium text-black">
            Riders Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            View, search, and manage all YDM Riders
          </p>
        </div>
        <CreateUserDialog
          defaultRole="YDM_Rider"
          roleLocked
          triggerLabel="Create Rider"
        />
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search by name, phone, email…"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:border-gray-400"
        />
      </div>

      {/* Count badge */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400">
          {data?.count ?? 0} rider{(data?.count ?? 0) !== 1 ? "s" : ""} total
        </span>
      </div>

      {/* Table */}
      <DataTable
        data={riders}
        columns={columns}
        isLoading={isLoading}
        onRowClick={(rider) => router.push(`/dashboard/riders/${rider.id}`)}
        emptyMessage="No riders found."
      />
    </div>
  );
}

export default function RidersPage() {
  return (
    <RoleGuard allowedRoles={["ydm", "vendor"]} showUnauthorized={true}>
      <RidersTable />
    </RoleGuard>
  );
}
