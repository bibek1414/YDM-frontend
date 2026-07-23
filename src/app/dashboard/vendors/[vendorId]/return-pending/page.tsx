"use client";

import { useParams } from "next/navigation";
import RoleGuard from "@/src/components/guards/role-guard";
import { VendorNav } from "@/src/components/vendors/vendor-nav";
import { VendorHeader } from "@/src/components/vendors/vendor-header";

function ReturnPendingContent() {
  return (
    <div className="flex flex-col gap-6 w-full bg-white p-6 md:p-8 rounded-sm border border-gray-200">
      <div className="pb-2">
        <h2 className="text-sm font-bold text-[#2e4a62] uppercase border-b-2 border-orange-400 inline-block pb-2 -mb-[2.5px]">
          Return Pending
        </h2>
      </div>
      <p className="text-sm text-gray-500">No return pending orders.</p>
    </div>
  );
}

export default function VendorDetailPageReturnPending() {
  const { vendorId } = useParams<{ vendorId: string }>();

  return (
    <RoleGuard allowedRoles={["ydm"]} showUnauthorized={true}>
      <div className="flex flex-col w-full max-w-screen-xl mx-auto p-6 md:p-8 pt-4 pb-10 gap-4">
        <VendorHeader vendorId={vendorId} />
        <VendorNav vendorId={vendorId} />
        <ReturnPendingContent />
      </div>
    </RoleGuard>
  );
}
