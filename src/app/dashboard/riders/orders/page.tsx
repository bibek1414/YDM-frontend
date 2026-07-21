"use client";

import RoleGuard from "@/src/components/guards/role-guard";
import { RiderDashboardView } from "@/src/components/riders/rider-all-orders";

export default function RiderOrdersPage() {
  return (
    <RoleGuard allowedRoles={["rider"]} showUnauthorized={true}>
      <RiderDashboardView />
    </RoleGuard>
  );
}
