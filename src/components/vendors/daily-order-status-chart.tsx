"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { TooltipContentProps } from "recharts";
import type {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";
import { Skeleton } from "@/components/ui/skeleton";

const COLOR = "#9f86c0";

const formatChartDate = (dateStr: string) => {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
};

interface CustomTooltipProps extends Pick<
  TooltipContentProps<ValueType, NameType>,
  "active" | "payload" | "label"
> {
  color: string;
  valueLabel: string;
}

function CustomTooltip({
  active,
  payload,
  label,
  color,
  valueLabel,
}: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 px-3.5 py-2.5 shadow-sm">
      <p className="text-xs font-medium text-gray-400 mb-1.5">
        {label ? formatChartDate(String(label)) : ""}
      </p>

      <div className="flex items-center gap-2">
        <span
          className="w-2 h-2 rounded-full shrink-0"
          style={{ backgroundColor: color }}
        />

        <span className="text-sm font-semibold text-gray-900">
          {valueLabel}: {payload[0]?.value}
        </span>
      </div>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="flex flex-col justify-between h-full py-2">
      <div className="relative flex-1 flex flex-col justify-between">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-px w-full bg-gray-100" />
        ))}
      </div>
      <div className="flex justify-between mt-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-3 w-8 bg-gray-100" />
        ))}
      </div>
    </div>
  );
}

interface DailyOrderStatusChartProps {
  data?: {
    date: string;
    placed_count: number;
  }[];
  isLoading?: boolean;
}

export function DailyOrderStatusChart({
  data,
  isLoading,
}: DailyOrderStatusChartProps) {
  return (
    <div className="bg-white rounded-xs border border-gray-200 overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
        <span
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: COLOR }}
        />

        <h3 className="text-sm font-semibold text-gray-900">
          Daily Order Status
        </h3>
      </div>

      <div className="p-4 h-[300px] w-full">
        {isLoading ? (
          <ChartSkeleton />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data ?? []}
              margin={{ top: 20, right: 20, left: -20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="5 5" vertical stroke="#e5e7eb" />

              <XAxis
                dataKey="date"
                tickFormatter={formatChartDate}
                tick={{ fontSize: 10, fill: "#6b7280" }}
                tickMargin={8}
                axisLine={{ stroke: "#d1d5db" }}
                tickLine={{ stroke: "#d1d5db" }}
              />

              <YAxis
                tick={{ fontSize: 11, fill: "#6b7280" }}
                axisLine={{ stroke: "#d1d5db" }}
                tickLine={{ stroke: "#d1d5db" }}
              />

              <Tooltip
                cursor={{
                  stroke: "#d1d5db",
                  strokeDasharray: "4 4",
                }}
                content={(props) => (
                  <CustomTooltip {...props} color={COLOR} valueLabel="Placed" />
                )}
              />

              <Line
                type="monotone"
                dataKey="placed_count"
                stroke={COLOR}
                strokeWidth={2}
                dot={{
                  r: 4,
                  fill: "#fff",
                  stroke: COLOR,
                  strokeWidth: 1.5,
                }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
