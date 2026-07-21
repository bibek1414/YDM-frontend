"use client";

import { SummaryCard } from "@/src/components/dashboard/summary-card";
import {
  useVendorDashboardStats,
  useVendorDashboardPlacedStats,
  useVendorDashboardDeliveredStats,
  useVendorDashboardCompleteStats,
} from "./vendors.queries";
import { useAuth } from "@/src/lib/auth-context";
import { VendorStatsCards } from "./vendor-stats-cards";
import { DailyOrderStatusChart } from "./daily-order-status-chart";
import { OrdersDeliveredChart } from "./orders-delivered-chart";

interface VendorDashboardViewProps {
  /** Pass the vendor's user_id when viewing as admin; omit for the vendor's own view. */
  userId?: string;
}

export function VendorDashboardView({
  userId: propUserId,
}: VendorDashboardViewProps = {}) {
  const { user } = useAuth();
  const userId = propUserId ?? user?.user_id;

  const { data: stats, isLoading: statsLoading } =
    useVendorDashboardStats(userId);
  const { data: placedStats, isLoading: placedLoading } =
    useVendorDashboardPlacedStats(userId);
  const { data: deliveredStats, isLoading: deliveredLoading } =
    useVendorDashboardDeliveredStats(userId);
  const { data: completeStats, isLoading: completeLoading } =
    useVendorDashboardCompleteStats(userId);

  const formatAmount = (amt: number) => amt.toLocaleString("en-IN");

  return (
    <div className="flex flex-col gap-6">
      {/* Top Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Order Processing Card */}
        <SummaryCard
          title="Orders Processing"
          isLoading={statsLoading}
          items={
            stats?.order_processing.map((i) => ({
              status: i.status,
              nos: i.nos,
              amount: formatAmount(i.amount),
            })) || [
              { status: "Order Placed", nos: 0, amount: "0" },
              { status: "Order Verified", nos: 0, amount: "0" },
              { status: "Received At Office", nos: 0, amount: "0" },
            ]
          }
        />

        {/* Order Dispatched Card */}
        <SummaryCard
          title="Orders Dispatched"
          isLoading={statsLoading}
          items={
            stats?.order_dispatched.map((i) => ({
              status: i.status,
              nos: i.nos,
              amount: formatAmount(i.amount),
            })) || [
              { status: "Out For Delivery", nos: 0, amount: "0" },
              { status: "Ready for Dispatch", nos: 0, amount: "0" },
              { status: "Order Dispatched", nos: 0, amount: "0" },
              { status: "Rescheduled", nos: 0, amount: "0" },
            ]
          }
        />

        {/* Order Status Card */}
        <SummaryCard
          title="Orders Status"
          isLoading={statsLoading}
          items={
            stats?.order_status.map((i) => ({
              status: i.status,
              nos: i.nos,
              amount: formatAmount(i.amount),
            })) || [
              { status: "Delivered", nos: 0, amount: "0" },
              { status: "Cancelled", nos: 0, amount: "0" },
              { status: "Returning to Vendor", nos: 0, amount: "0" },
              { status: "Returned to Vendor", nos: 0, amount: "0" },
              { status: "On Hold", nos: 0, amount: "0" },
            ]
          }
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Left Column — Charts */}
        <div className="flex-1 flex flex-col gap-6">
          <DailyOrderStatusChart data={placedStats} isLoading={placedLoading} />
          <OrdersDeliveredChart
            data={deliveredStats}
            isLoading={deliveredLoading}
          />
        </div>

        {/* Right Column — Stats */}
        <div className="w-full lg:w-72 flex flex-col gap-3 shrink-0">
          <VendorStatsCards data={completeStats} isLoading={completeLoading} />
        </div>
      </div>
    </div>
  );
}
