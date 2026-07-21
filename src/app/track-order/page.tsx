import { redirect } from "next/navigation";

export default async function TrackOrderPage(props: { searchParams: Promise<{ tracking_code?: string }> }) {
    const searchParams = await props.searchParams;
    const trackingCode = searchParams.tracking_code;

    if (trackingCode) {
        redirect(`/track-order/${encodeURIComponent(trackingCode)}`);
    }

    return (
        <div className="min-h-screen bg-[#f8f9fa] flex flex-col">
            <main className="flex-grow">
                {/* ORDER DETAILS OR PLACEHOLDER */}
                <div className="px-4 py-8">
                    <div className="text-center text-gray-500 py-12">
                        Please enter a tracking code above to view order details.
                    </div>
                </div>
            </main>
        </div>
    );
}
