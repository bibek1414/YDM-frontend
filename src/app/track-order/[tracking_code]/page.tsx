import { OrderDetailsView } from "@/src/components/orders/order-details/order-details.view";

interface PageProps {
  params: Promise<{ tracking_code: string }>;
}

export default async function TrackOrderDetailsPage({ params }: PageProps) {
  const resolvedParams = await params;
  const trackingCode = decodeURIComponent(resolvedParams.tracking_code);

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col">
      <main className="flex-grow">
        <div className="px-4 py-8">
          <OrderDetailsView trackingNumber={trackingCode} />
        </div>
      </main>
    </div>
  );
}
