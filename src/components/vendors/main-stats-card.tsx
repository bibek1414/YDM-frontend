import { VendorCompleteStat } from "@/src/services/vendors";
import { Skeleton } from "@/components/ui/skeleton";

const ROW_COUNT = 6; // 5 stat rows + last COD payment row

export function MainStatsCard({
  data,
  isLoading,
}: {
  data?: VendorCompleteStat;
  isLoading?: boolean;
}) {
  const formatAmount = (amt: number) => amt.toLocaleString("en-IN");

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const rows = [
    {
      label: "Total orders",
      value: data?.overall_statistics.total_order.nos ?? 0,
    },
    {
      label: "Total COD",
      value: `Rs. ${data ? formatAmount(data.overall_statistics.total_cod.amount) : "0"
        }`,
    },
    {
      label: "Pending RTV",
      value: data?.overall_statistics.total_rtv.nos ?? 0,
    },
    {
      label: "Total delivery charge",
      value: `Rs. ${data
          ? formatAmount(data.overall_statistics.total_delivery_charge.amount)
          : "0"
        }`,
    },
    {
      label: "Total pending COD",
      value: `Rs. ${data
          ? formatAmount(data.overall_statistics.total_pending_cod.amount)
          : "0"
        }`,
    },
  ];

  return (
    <div className="bg-white rounded-xs border border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Overview</h3>

      <div className="divide-y divide-gray-100">
        {isLoading ? (
          Array.from({ length: ROW_COUNT }).map((_, idx) => (
            <div
              key={idx}
              className="flex justify-between items-center py-2.5 first:pt-0 last:pb-0"
            >
              <Skeleton className="h-4 w-28 bg-gray-100" />
              <Skeleton className="h-4 w-16 bg-gray-100" />
            </div>
          ))
        ) : (
          <>
            {rows.map((row, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center py-2.5 first:pt-0"
              >
                <span className="text-sm text-gray-500">{row.label}</span>

                <span className="text-sm font-semibold text-gray-900 tabular-nums">
                  {row.value}
                </span>
              </div>
            ))}

            <div className="flex justify-between items-start py-2.5 last:pb-0 gap-4">
              <span className="text-sm text-gray-500 shrink-0">Last COD payment</span>
              <span className="text-sm font-medium text-gray-700 text-right">
                {data?.overall_statistics.last_cod_payment ? (
                  <>
                    <div>
                      Rs. {formatAmount(data.overall_statistics.last_cod_payment.amount)}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5 font-normal">
                      ({formatDate(data.overall_statistics.last_cod_payment.date)})
                    </div>
                  </>
                ) : (
                  "—"
                )}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
