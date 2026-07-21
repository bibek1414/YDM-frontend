import { VendorCompleteStat } from "@/src/services/vendors";
import { Skeleton } from "@/components/ui/skeleton";

const ROW_COUNT = 5;

export function TodaysStatsCard({
  data,
  isLoading,
}: {
  data?: VendorCompleteStat;
  isLoading?: boolean;
}) {
  const rows = [
    {
      label: "Today's orders",
      value: data?.todays_statistics.todays_orders ?? 0,
    },
    {
      label: "Today's delivery",
      value: data?.todays_statistics.todays_delivery ?? 0,
    },
    {
      label: "Today's rescheduled",
      value: data?.todays_statistics.todays_rescheduled ?? 0,
    },
    {
      label: "Today's cancellation",
      value: data?.todays_statistics.todays_cancellation ?? 0,
    },
    { label: "Open tickets", value: 0 },
  ];

  return (
    <div className="bg-white rounded-xs border border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Today</h3>
      <div className="divide-y divide-gray-100">
        {isLoading
          ? Array.from({ length: ROW_COUNT }).map((_, idx) => (
            <div
              key={idx}
              className="flex justify-between items-center py-2.5 first:pt-0 last:pb-0"
            >
              <Skeleton className="h-4 w-32 bg-gray-100" />
              <Skeleton className="h-4 w-8 bg-gray-100" />
            </div>
          ))
          : rows.map((row, idx) => (
            <div
              key={idx}
              className="flex justify-between items-center py-2.5 first:pt-0 last:pb-0"
            >
              <span className="text-sm text-gray-500">{row.label}</span>
              <span className="text-sm font-semibold text-gray-900 tabular-nums">
                {row.value}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}
