"use client";

import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function TrackOrderBanner() {
  const [trackingCode, setTrackingCode] = useState("");
  const router = useRouter();

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingCode.trim()) {
      router.push(
        `/track-order/${encodeURIComponent(trackingCode.trim())}`,
      );
    }
  };

  return (
    <div className="bg-orange-400 overflow-clip relative border-b border-white/10">
      {/* Background decorations - hidden on mobile for performance */}
      <div className="hidden md:block absolute -left-60 -top-60 inset-0 z-3 w-full h-full">
        <div className="w-200 h-200 bg-orange-500 shadow-sm rotate-[40deg]" />
      </div>
      <div className="hidden md:block absolute -left-40 -top-60 inset-0 z-2 w-full h-full">
        <div className="w-200 h-200 bg-gradient-to-tr bg-orange-300 via-orange-300 to-orange-500 shadow-lg rotate-[40deg]" />
      </div>

      <div className="relative mx-auto z-10 max-w-screen-xl px-4 sm:px-6 py-8 sm:py-12 md:py-16 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
        {/* Title Section - Stacked on mobile */}
        <div className="flex items-center gap-3 sm:gap-4 w-full md:w-auto justify-center md:justify-start">
          <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center shrink-0">
            <Package className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <div>
            <p className="font-medium text-white uppercase italic text-xl sm:text-2xl md:text-3xl text-center md:text-left">
              Track your Parcel
            </p>
          </div>
        </div>

        {/* Form - Full width on mobile */}
        <form
          onSubmit={handleTrack}
          className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto md:max-w-md flex-1"
        >
          <input
            type="text"
            placeholder="Tracking Code"
            value={trackingCode}
            onChange={(e) => setTrackingCode(e.target.value)}
            className="w-full sm:flex-1 bg-white text-gray-800 text-sm px-4 py-2.5 rounded border-0 focus:outline-none shadow-lg focus:ring-2 focus:ring-orange-400"
          />
          <Button
            type="submit"
            variant="secondary"
            size="lg"
            className="w-full sm:w-auto shadow-sm text-sm sm:text-base"
          >
            TRACK ORDER
          </Button>
        </form>
      </div>
    </div>
  );
}
