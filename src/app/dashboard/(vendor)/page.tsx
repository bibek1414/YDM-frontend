"use client";

import { useAuth } from "@/src/lib/auth-context";
import { VendorsView } from "@/src/components/vendors/vendors.view";
import { VendorDashboardView } from "@/src/components/vendors/vendor-dashboard.view";
import { RiderDashboardView } from "@/src/components/riders/rider-dashboard.view";
import { MyOrdersView } from "@/src/components/orders/my-orders.view";
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

  if (role === "ydm") {
    return (
      <div className="flex flex-col w-full max-w-screen-xl mx-auto p-6 md:p-8 pt-4 pb-10 gap-4">
        <MyOrdersView isAllVendors={true} title="All Orders" />
      </div>
    );
  }

  // Default to ydm admin view
  return <VendorsView />;
}
