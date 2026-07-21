import { VendorCompleteStat } from "@/src/services/vendors";
import { MainStatsCard } from "./main-stats-card";
import { TodaysStatsCard } from "./todays-stats-card";
import { DeliveryPerformanceCard } from "./delivery-performance-card";

interface VendorStatsCardsProps {
  data?: VendorCompleteStat;
  isLoading?: boolean;
}

export function VendorStatsCards({ data, isLoading }: VendorStatsCardsProps) {
  return (
    <>
      <MainStatsCard data={data} isLoading={isLoading} />
      <TodaysStatsCard data={data} isLoading={isLoading} />
      <DeliveryPerformanceCard data={data} isLoading={isLoading} />
    </>
  );
}
