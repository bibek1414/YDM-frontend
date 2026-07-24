"use client";

import { useParams } from "next/navigation";
import RoleGuard from "@/src/components/guards/role-guard";
import { VendorHeader } from "@/src/components/vendors/vendor-header";
import { VendorNav } from "@/src/components/vendors/vendor-nav";
import { DeliveryBillsView } from "@/src/components/delivery-bills/DeliveryBillsView";

export default function VendorDetailDeliveryBillsPage() {
  const { vendorId } = useParams<{ vendorId: string }>();

  return (
    <RoleGuard allowedRoles={["ydm"]} showUnauthorized={true}>
      <div className="flex flex-col w-full max-w-screen-xl mx-auto p-6 md:p-8 pt-4 pb-10 gap-4">
        <VendorHeader vendorId={vendorId} />
        <VendorNav vendorId={vendorId} />
        <DeliveryBillsView userId={vendorId} />
      </div>
    </RoleGuard>
  );
}
