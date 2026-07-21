import TrackOrderLayout from "@/components/layout/track-order-layout/track-order-layout";

interface DashboardLayoutPageProps {
  children: React.ReactNode;
}

export default function DashboardLayoutPage({
  children,
}: DashboardLayoutPageProps) {
  return <TrackOrderLayout>{children}</TrackOrderLayout>;
}
