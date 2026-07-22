"use client";

import { useParams } from "next/navigation";
import RoleGuard from "@/src/components/guards/role-guard";
import { PaymentDetailsView } from "@/src/components/payments/PaymentDetailsView";

export default function VendorPaymentDetailPage() {
  const params = useParams<{ paymentId: string }>();
  const paymentId = params?.paymentId;

  if (!paymentId) return <div className="p-4">Invalid Payment ID</div>;

  return (
    <RoleGuard allowedRoles={["vendor", "ydm"]} showUnauthorized={true}>
      <div className="flex flex-col w-full max-w-screen-xl mx-auto p-2 pt-4">
        <PaymentDetailsView paymentId={paymentId} />
      </div>
    </RoleGuard>
  );
}
