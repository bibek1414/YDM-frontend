"use client";

import { useAuth } from "@/src/lib/auth-context";
import { VendorNav } from "@/src/components/vendors/vendor-nav";

export default function VendorGroupLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  if (user?.role === "vendor") {
    return (
      <div className="flex flex-col w-full max-w-screen-xl mx-auto p-6 md:p-8 pt-4 pb-10">
        <VendorNav />
        {children}
      </div>
    );
  }

  // Riders and ydm admin: no vendor nav, just pass through to their own views
  return <>{children}</>;
}
