"use client";

import { useParams } from "next/navigation";
import RoleGuard from "@/src/components/guards/role-guard";
import { InvoicesView } from "@/src/components/invoices/invoices.view";
import { VendorNav } from "@/src/components/vendors/vendor-nav";
import { VendorHeader } from "@/src/components/vendors/vendor-header";

export default function VendorDetailPageInvoice() {
  const { vendorId } = useParams<{ vendorId: string }>();

  return (
    <RoleGuard allowedRoles={["ydm"]} showUnauthorized={true}>
      <div className="flex flex-col w-full max-w-screen-xl mx-auto p-6 md:p-8 pt-4 pb-10 gap-4">
        <VendorHeader vendorId={vendorId} />
        <VendorNav vendorId={vendorId} />
        <InvoicesView userId={vendorId} />
      </div>
    </RoleGuard>
  );
}
