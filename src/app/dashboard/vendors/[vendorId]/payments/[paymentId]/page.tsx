"use client";

import { useParams } from "next/navigation";
import RoleGuard from "@/src/components/guards/role-guard";
import { VendorNav } from "@/src/components/vendors/vendor-nav";
import { PaymentDetailsView } from "@/src/components/payments/PaymentDetailsView";

export default function VendorDetailPagePaymentDetail() {
  const params = useParams<{ vendorId: string; paymentId: string }>();
  const vendorId = params?.vendorId;
  const paymentId = params?.paymentId;

  if (!paymentId) return <div className="p-4">Invalid Payment ID</div>;

  return (
    <RoleGuard allowedRoles={["ydm"]} showUnauthorized={true}>
      <div className="flex flex-col w-full max-w-screen-xl mx-auto p-6 md:p-8 pt-4 pb-10 gap-4">
        <VendorNav vendorId={vendorId} />
        <PaymentDetailsView paymentId={paymentId} vendorId={vendorId} />
      </div>
    </RoleGuard>
  );
}
