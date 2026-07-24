"use client";

import { useParams } from "next/navigation";
import RoleGuard from "@/src/components/guards/role-guard";
import { DeliveryBillDetailsView } from "@/src/components/delivery-bills/DeliveryBillDetailsView";

export default function VendorDeliveryBillDetailPage() {
  const params = useParams<{ billId: string }>();
  const billId = params?.billId;

  if (!billId) return <div className="p-4">Invalid Delivery Bill ID</div>;

  return (
    <RoleGuard allowedRoles={["vendor", "ydm"]} showUnauthorized={true}>
      <div className="flex flex-col w-full max-w-screen-xl mx-auto p-2 pt-4">
        <DeliveryBillDetailsView billId={billId} />
      </div>
    </RoleGuard>
  );
}
