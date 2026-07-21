import { Navbar } from "../dashboard-layout/navbar";
import { TrackOrderNavbar } from "./track-order-navbar";
import { TrackOrderFooter } from "./track-order-footer";
import { TrackOrderBanner } from "./track-order-banner";

interface TrackOrderLayoutProps {
    children: React.ReactNode;
}

export default function TrackOrderLayout({ children }: TrackOrderLayoutProps) {
    return (
        <div className="min-h-screen flex flex-col bg-white">
            <TrackOrderNavbar />
            <TrackOrderBanner />
            <main className="flex-1 flex flex-col min-w-0">
                {children}
            </main>
            <TrackOrderFooter />
        </div>
    );
}
