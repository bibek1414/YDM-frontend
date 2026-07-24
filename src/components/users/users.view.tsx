"use client";

import { useState, useCallback } from "react";
import {
  Search,
  Trash2,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { type ColumnDef } from "@tanstack/react-table";
import { useUsers, useDeleteUser, USERS_QUERY_KEYS } from "@/src/hooks/use-users";
import type { User, UserRole } from "@/src/services/users";
import { CreateUserDialog } from "@/src/components/users/create-user-dialog";
import { EditUserDialog } from "@/src/components/users/edit-user-dialog";
import { ChangePasswordDialog } from "@/src/components/users/change-password-dialog";
import { useQueryClient } from "@tanstack/react-query";

// ─── Role config ──────────────────────────────────────────────────────────────

type Tab = "all" | UserRole;

const TABS: { value: Tab; label: string }[] = [
  { value: "all", label: "All Users" },
  { value: "vendor", label: "Vendors" },
  { value: "YDM_Rider", label: "Riders" },
  { value: "ydm", label: "YDM" },
];

const ROLE_BADGE: Record<string, { label: string; className: string }> = {
  vendor: {
    label: "Vendor",
    className: "bg-blue-50 text-blue-700",
  },
  YDM_Rider: {
    label: "Rider",
    className: "bg-orange-50 text-orange-700",
  },
  ydm: {
    label: "YDM",
    className: "bg-purple-50 text-purple-700",
  },
};

// ─── Columns ──────────────────────────────────────────────────────────────────

function buildColumns(
  onDelete: (user: User) => void,
  isDeleting: boolean
): ColumnDef<User>[] {
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
      header: "Name",
      cell: ({ row }) => {
        const { first_name, last_name, username } = row.original;
        const name =
          first_name || last_name
            ? `${first_name} ${last_name}`.trim()
            : username;
        return <span className="font-medium text-sm text-gray-900">{name}</span>;
      },
    },
    {
      id: "contact",
      header: "Contact",
      cell: ({ row }) => {
        const { email, phone_number } = row.original;
        return (
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5 text-xs text-blue-600">
              <Mail className="w-3 h-3" />
              {email}
            </div>
            {phone_number && (
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Phone className="w-3 h-3 text-gray-400" />
                {phone_number}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ getValue }) => {
        const role = getValue() as string;
        const badge = ROLE_BADGE[role] ?? {
          label: role,
          className: "bg-gray-100 text-gray-600",
        };
        return (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-xs text-[11px] font-medium ${badge.className}`}
          >
            {badge.label}
          </span>
        );
      },
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
      header: "Joined",
      cell: ({ getValue }) => (
        <span className="text-xs text-gray-400">
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
      cell: ({ row }) => (
        <div
          className="flex items-center gap-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          <EditUserDialog user={row.original} />
          <ChangePasswordDialog user={row.original} />
          <Button
            variant="destructive"
            size="icon-xs"
            onClick={() => onDelete(row.original)}
            disabled={isDeleting}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      ),
    },
  ];
}

// ─── Inner table per-tab ──────────────────────────────────────────────────────

function UserTable({
  role,
  search,
}: {
  role: Tab;
  search: string;
}) {
  const queryClient = useQueryClient();
  const deleteUser = useDeleteUser();

  const params =
    role === "all"
      ? { search: search || undefined }
      : { role: role as UserRole, search: search || undefined };

  const { data, isLoading, isError } = useUsers(params);

  function handleDelete(user: User) {
    const name =
      user.first_name || user.last_name
        ? `${user.first_name} ${user.last_name}`.trim()
        : user.username;
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    deleteUser.mutate(user.id, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEYS.lists() });
      },
    });
  }

  const columns = buildColumns(handleDelete, deleteUser.isPending);

  if (isError) {
    return (
      <div className="bg-red-50 text-red-500 p-4 rounded border border-red-200 text-sm">
        Failed to load users. Please try again.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400">
          {data?.count ?? 0} user{(data?.count ?? 0) !== 1 ? "s" : ""}
        </span>
      </div>
      <DataTable
        data={data?.results ?? []}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="No users found."
      />
    </div>
  );
}

// ─── Main View ────────────────────────────────────────────────────────────────

export function UsersView() {
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    clearTimeout((handleSearch as any)._t);
    (handleSearch as any)._t = setTimeout(() => setDebouncedSearch(value), 400);
  }, []);

  // Derive the default role for "Create User" from the active tab
  const dialogRole: UserRole =
    activeTab === "vendor"
      ? "vendor"
      : activeTab === "YDM_Rider"
        ? "YDM_Rider"
        : activeTab === "ydm"
          ? "ydm"
          : "vendor"; // fallback for "all" tab

  return (
    <div className="flex flex-col gap-6 w-full max-w-screen-xl mx-auto px-6 py-8 pb-20">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-gray-100 flex items-center justify-center">
            <Users className="w-4 h-4 text-gray-600" />
          </div>
          <div>
            <h1 className="text-2xl font-medium text-black">User Management</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Create and manage all platform users
            </p>
          </div>
        </div>
        <CreateUserDialog
          defaultRole={dialogRole}
          roleLocked={activeTab !== "all"}
          triggerLabel={
            activeTab === "all"
              ? "Create User"
              : activeTab === "YDM_Rider"
                ? "Create Rider"
                : activeTab === "vendor"
                  ? "Create Vendor"
                  : "Create YDM User"
          }
        />
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search by name, email, phone…"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:border-gray-400"
        />
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as Tab)}
      >
        <TabsList variant="line">
          {TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {TABS.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            <UserTable role={tab.value} search={debouncedSearch} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
