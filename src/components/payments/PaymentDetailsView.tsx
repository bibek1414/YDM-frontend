"use client";

import { useCodPaymentDetail } from "./payments.queries";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Download, Printer } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

function formatCurrency(value: number | string | undefined | null) {
  const num = Number(value ?? 0);
  const formatted = Math.abs(num).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return num < 0 ? `- Rs. ${formatted}` : `Rs. ${formatted}`;
}

function formatDate(dateStr: string) {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

interface PaymentDetailsViewProps {
  paymentId: string | number;
  vendorId?: string | number;
}

export function PaymentDetailsView({
  paymentId,
  vendorId,
}: PaymentDetailsViewProps) {
  const router = useRouter();
  const {
    data: detail,
    isLoading,
    isError,
    error,
  } = useCodPaymentDetail(paymentId);

  const orders = detail?.orders_detail ?? [];

  const handleBack = () => {
    if (vendorId) {
      router.push(`/dashboard/vendors/${vendorId}/payments?tab=cod_transfers`);
    } else {
      router.push(`/dashboard/payments?tab=cod_transfers`);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // CSV Export for associated orders
  const handleExportCSV = () => {
    if (!orders.length || !detail) return;

    const headers = [
      "Tracking Number",
      "Sender Name",
      "Sender Phone",
      "Recipient Name",
      "Recipient Phone",
      "Recipient Address",
      "Recipient City",
      "Recipient District",
      "COD Amount",
      "Delivery Charge",
      "Net Amount",
      "Payment Type",
      "Status",
    ];

    const rows = orders.map((order) => {
      const statusLower = order.status?.toLowerCase() || "";
      const isCancelledStatus =
        statusLower === "cancelled" ||
        statusLower === "returning_to_vendor" ||
        statusLower === "returned_to_vendor";
      const charge = isCancelledStatus
        ? (order.ydm_cancelled_charge ?? "0.00")
        : (order.ydm_delivery_charge ?? order.delivery_charge ?? "0.00");

      return [
        `"${order.tracking_number}"`,
        `"${(order.sender_name || "").replace(/"/g, '""')}"`,
        `"${order.sender_phone || ""}"`,
        `"${(order.recipient_name || "").replace(/"/g, '""')}"`,
        `"${order.recipient_phone || ""}"`,
        `"${(order.recipient_address || "").replace(/"/g, '""')}"`,
        `"${order.recipient_city || ""}"`,
        `"${order.recipient_district || ""}"`,
        Number(order.cod_amount || 0).toFixed(2),
        Number(charge || 0).toFixed(2),
        Number(order.net_amount || 0).toFixed(2),
        `"${order.payment_type || ""}"`,
        `"${order.status || ""}"`,
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `orders_report_${detail.payment_number || `payment_${paymentId}`}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
        <p className="text-sm text-gray-500">Loading payment details...</p>
      </div>
    );
  }

  if (isError || !detail) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-4 text-center">
        <p className="text-red-500 font-semibold">
          Error loading payment details
        </p>
        <p className="text-xs text-gray-500 max-w-sm">
          {error instanceof Error
            ? error.message
            : "The requested payment could not be fetched."}
        </p>
        <Button onClick={handleBack} variant="outline" size="sm">
          Go Back
        </Button>
      </div>
    );
  }

  // Calculate totals
  const totalCharge = orders.reduce((sum, order) => {
    const statusLower = order.status?.toLowerCase() || "";
    const isCancelledStatus =
      statusLower === "cancelled" ||
      statusLower === "returning_to_vendor" ||
      statusLower === "returned_to_vendor";
    const charge = isCancelledStatus
      ? Number(order.ydm_cancelled_charge ?? 0)
      : Number(order.ydm_delivery_charge ?? order.delivery_charge ?? 0);
    return sum + charge;
  }, 0);

  const totalCOD = orders.reduce((sum, order) => {
    const statusLower = order.status?.toLowerCase() || "";
    const isCancelledStatus =
      statusLower === "cancelled" ||
      statusLower === "returning_to_vendor" ||
      statusLower === "returned_to_vendor";
    const charge = isCancelledStatus
      ? Number(order.ydm_cancelled_charge ?? 0)
      : Number(order.ydm_delivery_charge ?? order.delivery_charge ?? 0);
    const displayCOD = isCancelledStatus ? 0 : order.net_amount + charge;
    return sum + displayCOD;
  }, 0);

  const totalNet = orders.reduce(
    (sum, order) => sum + Number(order.net_amount || 0),
    0,
  );

  return (
    <div className="flex flex-col gap-6 w-full max-w-screen-xl mx-auto p-4 md:p-8 pt-4 pb-10">
      {/* Top Header Buttons (Hidden on Print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBack}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-700 font-normal border border-gray-200 rounded hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Payments
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handlePrint}
            variant="outline"
            size="sm"
            className="h-9 text-xs border-gray-200 text-gray-700 hover:bg-gray-50 gap-1.5 rounded-full px-4"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Transfer
          </Button>
          <Button
            onClick={handleExportCSV}
            variant="outline"
            size="sm"
            className="h-9 text-xs border-gray-200 text-gray-700 hover:bg-gray-50 gap-1.5 rounded-full px-4"
          >
            <Download className="w-3.5 h-3.5" />
            Export Orders to CSV
          </Button>
        </div>
      </div>

      {/* Main Print Container Sheet */}
      <div className="bg-white p-6 md:p-10 rounded-lg border border-gray-200 flex flex-col gap-8">
        {/* Top Header Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Left Side: YDM Details */}
          <div className="flex flex-col gap-1 text-sm text-gray-600">
            <h3 className="text-xl font-bold text-gray-800 uppercase tracking-wide">
              YDM LOGISTICS
            </h3>
            <h4 className="font-bold text-gray-800 text-base">
              {detail.created_by_detail.first_name}{" "}
              {detail.created_by_detail.last_name}
            </h4>
            <p className="text-xs text-gray-500 mt-0.5">
              {detail.created_by_detail.address || "N/A"}
            </p>
            <p className="text-xs text-gray-500">
              Phone: {detail.created_by_detail.phone_number}
            </p>
            <p className="text-xs text-gray-500">
              Email: {detail.created_by_detail.email}
            </p>
          </div>

          {/* Right Side: Transfer & Billing info */}
          <div className="flex flex-col gap-6 md:text-right">
            <div>
              <h2 className="text-2xl font-black text-[#2e4a62] tracking-tight uppercase">
                COD Transfer
              </h2>
              <p className="text-lg font-bold text-gray-500 mt-1">
                #{detail.payment_number}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                COD Transfer Date: {formatDate(detail.created_at)}
              </p>
            </div>

            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                Billing Customer
              </span>
              <h4 className="font-bold text-gray-800 text-base">
                {detail.user_detail.first_name} {detail.user_detail.last_name}
              </h4>
              <p className="text-xs text-gray-500 mt-0.5">
                {detail.user_detail.address || "N/A"}
              </p>
              <p className="text-xs text-gray-500">
                Phone: {detail.user_detail.phone_number}
              </p>
              <p className="text-xs text-gray-500">
                Email: {detail.user_detail.email}
              </p>
            </div>
          </div>
        </div>

        {/* Orders Table Section */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-t border-b border-gray-300 bg-gray-50 text-gray-500 font-semibold">
                <th className="py-2.5 px-3 text-center w-12">SN</th>
                <th className="py-2.5 px-3">Order ID</th>
                <th className="py-2.5 px-3">Customer Name</th>
                <th className="py-2.5 px-3">Payment Type</th>
                <th className="py-2.5 px-3 text-right">COD</th>
                <th className="py-2.5 px-3 text-right"> Delivery Charge</th>
                <th className="py-2.5 px-3 text-right">Net</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, idx) => {
                const statusLower = order.status?.toLowerCase() || "";
                const isCancelledStatus =
                  statusLower === "cancelled" ||
                  statusLower === "returning_to_vendor" ||
                  statusLower === "returned_to_vendor";

                const charge = isCancelledStatus
                  ? Number(order.ydm_cancelled_charge ?? 0)
                  : Number(
                      order.ydm_delivery_charge ?? order.delivery_charge ?? 0,
                    );

                // Append suffix depending on status
                const isRTV =
                  statusLower === "returning_to_vendor" ||
                  statusLower === "returned_to_vendor";
                const isCancelled = statusLower === "cancelled";
                const suffix = isRTV
                  ? " - RTV"
                  : isCancelled
                    ? " - CANCELLED"
                    : "";
                const displayOrderId = `${order.tracking_number}${suffix}`;

                const displayCOD = isCancelledStatus
                  ? 0
                  : Number(order.net_amount || 0) + charge;

                return (
                  <tr
                    key={order.tracking_number}
                    className="border-b border-gray-100 hover:bg-gray-50/50"
                  >
                    <td className="py-3 px-3 text-center text-gray-500">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-3 font-semibold text-[#2e4a62]">
                      {displayOrderId}
                    </td>
                    <td className="py-3 px-3 text-gray-800">
                      {order.recipient_name}
                    </td>
                    <td className="py-3 px-3 text-gray-600">
                      {order.payment_type}
                    </td>
                    <td className="py-3 px-3 text-right text-gray-700">
                      {displayCOD.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-right text-gray-700">
                      {Number(charge).toFixed(2)}
                    </td>
                    <td
                      className={cn(
                        "py-3 px-3 text-right font-semibold",
                        order.net_amount < 0
                          ? "text-red-500"
                          : "text-[#2e4a62]",
                      )}
                    >
                      {Number(order.net_amount || 0).toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="inline-flex items-center justify-center px-2 py-0.5 rounded border border-gray-200 bg-gray-50 text-[10px] uppercase font-semibold text-gray-600">
                        {order.status.replace(/_/g, " ")}
                      </span>
                    </td>
                  </tr>
                );
              })}

              {/* Totals Row */}
              <tr className="border-t border-b border-gray-300 font-semibold bg-gray-50">
                <td colSpan={4} className="py-3 px-3 text-right text-gray-700">
                  Total
                </td>
                <td className="py-3 px-3 text-right text-gray-900">
                  {totalCOD.toFixed(2)}
                </td>
                <td className="py-3 px-3 text-right text-gray-900">
                  {totalCharge.toFixed(2)}
                </td>
                <td
                  className={cn(
                    "py-3 px-3 text-right",
                    totalNet < 0 ? "text-red-500" : "text-[#2e4a62]",
                  )}
                >
                  {totalNet.toFixed(2)}
                </td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
