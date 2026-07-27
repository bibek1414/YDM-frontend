"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useVendor } from "./vendors.queries";

interface VendorHeaderProps {
  vendorId: string;
}

export function VendorHeader({ vendorId }: VendorHeaderProps) {
  const { data: vendor, isLoading } = useVendor(vendorId);

  const vendorName = vendor
    ? `${vendor.first_name || ""} ${vendor.last_name || ""}`.trim() || vendor.username
    : "Vendor Details";

  return (
    <div className="grid grid-cols-3 items-center w-full mb-2">
      <div className="flex justify-start">
        <Link
          href="/dashboard/vendors"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-700 font-normal border border-gray-200 rounded hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Vendors
        </Link>
      </div>
      <div className="flex justify-center text-center">
        {isLoading ? (
          <div className="h-5 w-32 bg-gray-150 animate-pulse rounded" />
        ) : (
          <h2 className="text-sm md:text-base font-bold text-[#2e4a62]">
            {vendorName}
          </h2>
        )}
      </div>
      <div className="flex justify-end" />
    </div>
  );
}
