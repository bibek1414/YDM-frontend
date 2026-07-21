"use client";

import {
  useRiderPackageStats,
  useRiderCommissionStats,
  useRiderDailyStats,
} from "@/src/hooks/use-rider";
import { RiderPackageStats } from "@/src/components/riders/rider-package-stats";
import { RiderCommissionStats } from "@/src/components/riders/rider-commission-stats";
import { RiderDailyOrderStatusChart } from "@/src/components/riders/rider-daily-order-status-chart";

interface RiderDetailDashboardViewProps {
  riderId: string;
}

export function RiderDetailDashboardView({
  riderId,
}: RiderDetailDashboardViewProps) {
  const {
    data: pkgStats,
    isLoading: isPkgLoading,
    isError: isPkgError,
    error: pkgError,
    refetch: refetchPkg,
  } = useRiderPackageStats(undefined, undefined, true, riderId);

  const {
    data: commStats,
    isLoading: isCommLoading,
    isError: isCommError,
    error: commError,
    refetch: refetchComm,
  } = useRiderCommissionStats(undefined, undefined, true, riderId);

  const { data: dailyStats, isLoading: isDailyLoading } = useRiderDailyStats(
    true,
    riderId,
  );

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
      {/* Package Delivery Stats */}
      <div className="flex flex-col gap-3 bg-white p-6 rounded-sm border border-gray-200">
        <h2 className="text-sm font-bold text-[#2e4a62] inline-block pb-2 -mb-[11px] w-fit">
          Package Delivery
        </h2>
        <div className="pt-4">
          <RiderPackageStats
            data={pkgStats}
            isLoading={isPkgLoading}
            isError={isPkgError}
            error={pkgError}
            onRetry={refetchPkg}
          />
        </div>
      </div>

      {/* Daily Order Status Chart */}
      <RiderDailyOrderStatusChart
        data={dailyStats}
        isLoading={isDailyLoading}
      />

      {/* Commission Earnings Stats */}
      <div className="flex flex-col gap-3 bg-white p-6 rounded-sm border border-gray-200">
        <h2 className="text-sm font-bold text-[#2e4a62] inline-block pb-2 -mb-[11px] w-fit">
          Commission & Earnings
        </h2>
        <div className="pt-4">
          <RiderCommissionStats
            data={commStats}
            isLoading={isCommLoading}
            isError={isCommError}
            error={commError}
            onRetry={refetchComm}
          />
        </div>
      </div>
    </div>
  );
}
