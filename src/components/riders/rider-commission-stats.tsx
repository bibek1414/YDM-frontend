import { Skeleton } from "@/components/ui/skeleton";
import type { RiderCommissionStats as RiderCommissionStatsType } from "@/src/types/rider";

interface RiderCommissionStatsProps {
  data?: RiderCommissionStatsType;
  isLoading: boolean;
  isError: boolean;
  error?: Error | null;
  onRetry?: () => void;
}

export function RiderCommissionStats({
  data,
  isLoading,
  isError,
  error,
  onRetry,
}: RiderCommissionStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 border border-red-200 rounded-lg bg-red-50/20 text-center">
        <p className="text-sm text-red-600">Failed to load commission stats</p>
        {error?.message && (
          <p className="text-xs text-gray-500 mt-1">{error.message}</p>
        )}
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-2 text-xs text-gray-600 hover:text-gray-900 underline"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  const stats = data || {
    lifetime_commission_earned: 0,
    lifetime_commission_paid: 0,
    remaining_balance: 0,
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString(undefined, {
      minimumFractionDigits: 1,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="p-4 border border-gray-200 rounded-lg">
        <div className="text-xs text-gray-500 font-medium">
          Remaining Balance
        </div>
        <div className="text-xl font-bold text-gray-900 mt-1">
          Rs. {formatCurrency(stats.remaining_balance)}
        </div>
      </div>

      <div className="p-4 border border-gray-200 rounded-lg">
        <div className="text-xs text-gray-500 font-medium">Lifetime Earned</div>
        <div className="text-xl font-bold text-gray-900 mt-1">
          Rs. {formatCurrency(stats.lifetime_commission_earned)}
        </div>
      </div>

      <div className="p-4 border border-gray-200 rounded-lg">
        <div className="text-xs text-gray-500 font-medium">Lifetime Paid</div>
        <div className="text-xl font-bold text-gray-900 mt-1">
          Rs. {formatCurrency(stats.lifetime_commission_paid)}
        </div>
      </div>
    </div>
  );
}
