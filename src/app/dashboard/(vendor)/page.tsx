"use client";

import { useAuth } from "@/src/lib/auth-context";
import { VendorsView } from "@/src/components/vendors/vendors.view";
import { VendorDashboardView } from "@/src/components/vendors/vendor-dashboard.view";
import { RiderDashboardView } from "@/src/components/riders/rider-dashboard.view";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const { user, isLoading } = useAuth();

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#e8611a]" />
      </div>
    );
  }

  const role = user.role;

  if (role === "vendor") {
    return <VendorDashboardView />;
  }

  if (role === "rider") {
    return <RiderDashboardView />;
  }

  // Default to ydm admin view
  return <VendorsView />;
}
