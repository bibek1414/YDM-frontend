"use client";

import RoleGuard from "@/src/components/guards/role-guard";
import { InvoicesView } from "@/src/components/invoices/invoices.view";

export default function VendorInvoicePage() {
  return (
    <RoleGuard allowedRoles={["vendor", "ydm"]} showUnauthorized={true}>
      <InvoicesView />
    </RoleGuard>
  );
}
