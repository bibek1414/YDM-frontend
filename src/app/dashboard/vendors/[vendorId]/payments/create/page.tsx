"use client";

import { useParams } from "next/navigation";
import RoleGuard from "@/src/components/guards/role-guard";
import { CreateTransferView } from "@/src/components/payments/CreateTransferView";

export default function VendorDetailPageCreateTransfer() {
  const { vendorId } = useParams<{ vendorId: string }>();

  return (
    <RoleGuard allowedRoles={["ydm"]} showUnauthorized={true}>
      <div className="flex flex-col w-full max-w-screen-xl mx-auto p-6 md:p-8 pt-4 pb-10 gap-4">
        <CreateTransferView userId={vendorId} />
      </div>
    </RoleGuard>
  );
}
