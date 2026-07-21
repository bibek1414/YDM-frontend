"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import RoleGuard from "@/src/components/guards/role-guard";
import { RiderPayoutView } from "@/src/components/riders/rider-payout.view";
import { RiderNav } from "@/src/components/riders/rider-nav";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RiderPayoutPageProps {
  params: Promise<{ id: string }>;
}

export default function RiderPayoutPage({ params }: RiderPayoutPageProps) {
  const unwrappedParams = use(params);
  const router = useRouter();

  return (
    <RoleGuard allowedRoles={["ydm", "vendor"]} showUnauthorized={true}>
      <div className="flex flex-col w-full max-w-7xl mx-auto p-6 md:p-8 pt-4 pb-10 gap-4">
        <div className="flex items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/dashboard/riders")}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-700 font-normal border border-gray-200 rounded hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Riders
          </Button>
        </div>
        <RiderNav riderId={unwrappedParams.id} />
        <RiderPayoutView riderId={unwrappedParams.id} />
      </div>
    </RoleGuard>
  );
}
