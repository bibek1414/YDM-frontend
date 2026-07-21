"use client";

import { useParams, useRouter } from "next/navigation";
import RoleGuard from "@/src/components/guards/role-guard";
import { VendorDashboardView } from "@/src/components/vendors/vendor-dashboard.view";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VendorNav } from "@/src/components/vendors/vendor-nav";

export default function VendorDetailPage() {
  const { vendorId } = useParams<{ vendorId: string }>();
  const router = useRouter();

  return (
    <RoleGuard allowedRoles={["ydm"]} showUnauthorized={true}>
      <div className="flex flex-col w-full max-w-screen-xl mx-auto p-6 md:p-8 pt-4 pb-10 gap-4">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/dashboard/vendors")}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-700 font-normal border border-gray-200 rounded hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Vendors
          </Button>
        </div>
        <VendorNav vendorId={vendorId} />
        <VendorDashboardView userId={vendorId} />
      </div>
    </RoleGuard>
  );
}
