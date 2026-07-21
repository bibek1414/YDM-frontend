import { FolderCog, Target, Truck, LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface SummaryCardProps {
  title: string;
  items: {
    status: string;
    nos: number;
    amount: string | number;
  }[];
  isLoading?: boolean;
}

interface CardConfig {
  icon: LucideIcon;
  accent: string;
  iconBg: string;
  iconText: string;
}

const CARD_CONFIG: Record<string, CardConfig> = {
  "orders processing": {
    icon: FolderCog,
    accent: "bg-blue-300",
    iconBg: "bg-blue-50",
    iconText: "text-blue-600",
  },
  "orders dispatched": {
    icon: Truck,
    accent: "bg-amber-300",
    iconBg: "bg-amber-50",
    iconText: "text-amber-600",
  },
  "orders status": {
    icon: Target,
    accent: "bg-emerald-300",
    iconBg: "bg-emerald-50",
    iconText: "text-emerald-600",
  },
};

// Number of skeleton rows shown while loading, before we know how many
// status rows the real data will have.
const SKELETON_ROW_COUNT = 3;

export function SummaryCard({ title, items, isLoading }: SummaryCardProps) {
  const config =
    CARD_CONFIG[title.toLowerCase()] ?? CARD_CONFIG["orders processing"];
  const Icon = config.icon;
  const totalNos = items.reduce((sum, item) => sum + item.nos, 0);

  return (
    <div className="bg-white rounded-xs border border-gray-200 overflow-hidden">
      {/* Color-coded accent bar identifies the card type at a glance */}
      <div className={`h-1 w-full ${config.accent}`} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          </div>
          {isLoading ? (
            <Skeleton className="h-3 w-12 bg-gray-100" />
          ) : (
            <span className="text-xs font-medium text-gray-400">
              {totalNos} total
            </span>
          )}
        </div>

        {/* Rows */}
        <div className="divide-y divide-gray-100">
          {isLoading
            ? Array.from({ length: SKELETON_ROW_COUNT }).map((_, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 first:pt-0 last:pb-0"
              >
                <Skeleton className="h-4 w-20 bg-gray-100" />
                <div className="flex items-center gap-5">
                  <Skeleton className="h-4 w-6 bg-gray-100" />
                  <Skeleton className="h-4 w-16 bg-gray-100" />
                </div>
              </div>
            ))
            : items.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 first:pt-0 last:pb-0"
              >
                <span className="text-sm text-gray-500">{item.status}</span>
                <div className="flex items-center gap-5">
                  <span className="text-sm font-semibold text-gray-900 tabular-nums w-6 text-right">
                    {item.nos}
                  </span>
                  <span className="text-sm font-medium text-gray-700 tabular-nums w-35 text-right">
                    Rs. {item.amount}
                  </span>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
