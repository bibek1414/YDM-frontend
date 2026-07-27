"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import RoleGuard from "@/src/components/guards/role-guard";
import InvoiceCreateView from "@/src/components/invoices/invoice/invoice-create-view";
import { ChevronLeft } from "lucide-react";
import { VendorNav } from "@/src/components/vendors/vendor-nav";

export default function InvoiceCreatePage() {
  const { vendorId } = useParams<{ vendorId: string }>();

  return (
    <RoleGuard allowedRoles={["ydm"]} showUnauthorized={true}>
      <div className="flex flex-col w-full max-w-screen-xl mx-auto p-6 md:p-8 pt-4 pb-10 gap-4">
        <div className="flex items-center">
          <Link
            href={`/dashboard/vendors/${vendorId}/invoice`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-700 font-normal border border-gray-200 rounded hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Invoices
          </Link>
        </div>
        <VendorNav vendorId={vendorId} />
        <InvoiceCreateView />
      </div>
    </RoleGuard>
  );
}
