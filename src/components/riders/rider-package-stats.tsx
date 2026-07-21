import { Skeleton } from "@/components/ui/skeleton";
import type { RiderPackageStats as RiderPackageStatsType } from "@/src/types/rider";

interface RiderPackageStatsProps {
  data?: RiderPackageStatsType;
  isLoading: boolean;
  isError: boolean;
  error?: Error | null;
  onRetry?: () => void;
}

export function RiderPackageStats({
  data,
  isLoading,
  isError,
  error,
  onRetry,
}: RiderPackageStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 border border-red-200 rounded-lg bg-red-50/20 text-center">
        <p className="text-sm text-red-600">Failed to load delivery stats</p>
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
    packages_assigned: 0,
    packages_delivered: 0,
    total_packages_delivered_lifetime: 0,
    total_packages_cancelled_lifetime: 0,
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div className="p-4 border border-gray-200 rounded-lg">
        <div className="text-xs text-gray-500 font-medium">Assigned</div>
        <div className="text-xl font-bold text-gray-900 mt-1">
          {stats.packages_assigned}
        </div>
      </div>

      <div className="p-4 border border-gray-200 rounded-lg">
        <div className="text-xs text-gray-500 font-medium">Delivered</div>
        <div className="text-xl font-bold text-gray-900 mt-1">
          {stats.packages_delivered}
        </div>
      </div>

      <div className="p-4 border border-gray-200 rounded-lg">
        <div className="text-xs text-gray-500 font-medium">
          Lifetime Delivered
        </div>
        <div className="text-xl font-bold text-gray-900 mt-1">
          {stats.total_packages_delivered_lifetime}
        </div>
      </div>

      <div className="p-4 border border-gray-200 rounded-lg">
        <div className="text-xs text-gray-500 font-medium">
          Lifetime Cancelled
        </div>
        <div className="text-xl font-bold text-gray-900 mt-1">
          {stats.total_packages_cancelled_lifetime}
        </div>
      </div>
    </div>
  );
}
