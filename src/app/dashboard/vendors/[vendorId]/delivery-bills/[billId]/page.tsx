"use client";

import { useParams } from "next/navigation";
import RoleGuard from "@/src/components/guards/role-guard";
import { VendorNav } from "@/src/components/vendors/vendor-nav";
import { DeliveryBillDetailsView } from "@/src/components/delivery-bills/DeliveryBillDetailsView";

export default function VendorDetailDeliveryBillDetailPage() {
  const params = useParams<{ vendorId: string; billId: string }>();
  const vendorId = params?.vendorId;
  const billId = params?.billId;

  if (!billId) return <div className="p-4">Invalid Delivery Bill ID</div>;

  return (
    <RoleGuard allowedRoles={["ydm"]} showUnauthorized={true}>
      <div className="flex flex-col w-full max-w-screen-xl mx-auto p-6 md:p-8 pt-4 pb-10 gap-4">
        <VendorNav vendorId={vendorId} />
        <DeliveryBillDetailsView billId={billId} vendorId={vendorId} />
      </div>
    </RoleGuard>
  );
}
