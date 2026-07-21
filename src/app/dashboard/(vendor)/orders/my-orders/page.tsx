"use client";

import RoleGuard from "@/src/components/guards/role-guard";
import { MyOrdersView } from "@/src/components/orders/my-orders.view";

export default function VendorMyOrdersPage() {
  return (
    <RoleGuard allowedRoles={["vendor", "ydm"]} showUnauthorized={true}>
      <MyOrdersView />
    </RoleGuard>
  );
}

