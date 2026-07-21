"use client";

import { useState } from "react";
import {
  useRiderCommissionStats,
  useRiderCommissionPayments,
} from "@/src/hooks/use-rider";
import { RiderCommissionStats } from "@/src/components/riders/rider-commission-stats";
import { RiderPaymentHistory } from "@/src/components/riders/rider-payment-history";

interface RiderPayoutViewProps {
  riderId: string;
}

export function RiderPayoutView({ riderId }: RiderPayoutViewProps) {
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const {
    data: commStats,
    isLoading: isLoadingStats,
    isError: isErrorStats,
    error: errorStats,
    refetch: refetchStats,
  } = useRiderCommissionStats(undefined, undefined, true, riderId);

  const {
    data: paymentsData,
    isLoading: isLoadingPayments,
    isError: isErrorPayments,
    error: errorPayments,
    refetch: refetchPayments,
  } = useRiderCommissionPayments(page, PAGE_SIZE, true, riderId);

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
      {/* Commission Stats Cards */}
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-gray-900">
          Commission Summary
        </h2>
        <RiderCommissionStats
          data={commStats}
          isLoading={isLoadingStats}
          isError={isErrorStats}
          error={errorStats}
          onRetry={refetchStats}
        />
      </div>

      {/* Payout History Section */}
      <div className="flex flex-col gap-4 bg-white p-6 md:p-8 rounded-sm border border-gray-200">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <h2 className="text-sm font-bold text-[#2e4a62] uppercase border-b-2 border-orange-400 inline-block pb-2 -mb-[11px] w-fit">
            Payout History
          </h2>
        </div>

        <RiderPaymentHistory
          data={paymentsData}
          isLoading={isLoadingPayments}
          isError={isErrorPayments}
          error={errorPayments}
          page={page}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
          onRetry={refetchPayments}
        />
      </div>
    </div>
  );
}
