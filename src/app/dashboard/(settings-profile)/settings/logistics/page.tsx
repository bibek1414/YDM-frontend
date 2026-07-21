"use client";

import { useAuth } from "@/src/lib/auth-context";
import { LogisticsSettingsView } from "@/src/components/logistics/logistics-settings.view";
import { Loader2 } from "lucide-react";

export default function LogisticsSettingsPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-6 h-6 animate-spin text-[#e8611a]" />
      </div>
    );
  }

  if (user?.role !== "ydm") {
    return (
      <div className="rounded-md border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
        You do not have permission to view this page.
      </div>
    );
  }

  return <LogisticsSettingsView />;
}
