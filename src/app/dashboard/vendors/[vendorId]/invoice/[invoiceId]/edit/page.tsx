"use client";

import { useParams, useRouter } from "next/navigation";
import RoleGuard from "@/src/components/guards/role-guard";
import { useGetInvoiceById } from "@/src/components/invoices/invoices.queries";
import InvoiceCreateView from "@/src/components/invoices/invoice/invoice-create-view";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VendorNav } from "@/src/components/vendors/vendor-nav";

export default function InvoiceEditPage() {
  const params = useParams<{ vendorId: string; invoiceId: string }>();
  const vendorId = params?.vendorId;
  const invoiceId = Number(params?.invoiceId);
  const router = useRouter();

  const {
    data: invoice,
    isLoading,
    isError,
    error,
  } = useGetInvoiceById(invoiceId);

  if (!invoiceId || isNaN(invoiceId)) {
    return <div className="p-4 text-red-600">Invalid invoice id</div>;
  }

  if (isLoading) return <div className="p-4">Loading...</div>;
  if (isError)
    return <div className="p-4 text-red-600">{(error as Error)?.message}</div>;

  return (
    <RoleGuard allowedRoles={["ydm"]} showUnauthorized={true}>
      <div className="flex flex-col w-full max-w-screen-xl mx-auto p-6 md:p-8 pt-4 pb-10 gap-4">
        <div className="flex items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/dashboard/vendors/${vendorId}/invoice`)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-700 font-normal border border-gray-200 rounded hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Invoices
          </Button>
        </div>
        <VendorNav vendorId={vendorId} />
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <InvoiceCreateView mode="edit" initialInvoice={invoice as any} />
      </div>
    </RoleGuard>
  );
}
