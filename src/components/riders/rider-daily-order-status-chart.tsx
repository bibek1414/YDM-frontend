"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { TooltipContentProps } from "recharts";
import type {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";
import { Skeleton } from "@/components/ui/skeleton";
import type { RiderDailyStat } from "@/src/types/rider";

const DELIVERED_COLOR = "#82ca9d";
const RETURNED_COLOR = "#e2722b";

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

type CustomTooltipProps = Pick<
  TooltipContentProps<ValueType, NameType>,
  "active" | "payload" | "label"
>;

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 px-3.5 py-2.5 shadow-sm space-y-1.5">
      <p className="text-xs font-medium text-gray-400">
        {label ? formatChartDate(String(label)) : ""}
      </p>

      {payload.map((entry) => (
        <div key={String(entry.dataKey)} className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs font-semibold text-gray-800">
            {entry.name}: {entry.value}
          </span>
        </div>
      ))}
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

interface RiderDailyOrderStatusChartProps {
  data?: RiderDailyStat[];
  isLoading?: boolean;
}

export function RiderDailyOrderStatusChart({
  data,
  isLoading,
}: RiderDailyOrderStatusChartProps) {
  // Sort data chronologically by date
  const sortedData = data
    ? [...data].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      )
    : [];

  return (
    <div className="bg-white rounded-xs border border-gray-200 overflow-hidden w-full">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-[#2e4a62]">
          Daily Order Status
        </h3>
      </div>

      <div className="p-4 h-[300px] w-full">
        {isLoading ? (
          <ChartSkeleton />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={sortedData}
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
                allowDecimals={false}
              />

              <Tooltip
                cursor={{
                  stroke: "#d1d5db",
                  strokeDasharray: "4 4",
                }}
                content={(props) => <CustomTooltip {...props} />}
              />

              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: "10px", fontSize: "11px" }}
              />

              <Line
                name="Delivered"
                type="monotone"
                dataKey="delivered_count"
                stroke={DELIVERED_COLOR}
                strokeWidth={2}
                dot={{
                  r: 4,
                  fill: "#fff",
                  stroke: DELIVERED_COLOR,
                  strokeWidth: 1.5,
                }}
                activeDot={{ r: 6 }}
              />

              <Line
                name="Returned"
                type="monotone"
                dataKey="returned_count"
                stroke={RETURNED_COLOR}
                strokeWidth={2}
                dot={{
                  r: 4,
                  fill: "#fff",
                  stroke: RETURNED_COLOR,
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
