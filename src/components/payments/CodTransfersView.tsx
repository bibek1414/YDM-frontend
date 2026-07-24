"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/lib/auth-context";
import {
  useVendorCodPayments,
  useDeleteCodTransfer,
  useUpdateCodTransfer,
} from "./payments.queries";
import { CodPayment, getCodPaymentDetail } from "@/src/services/payments";
import { type ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { DataTable } from "@/components/ui/data-table";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  HelpCircle,
  Download,
  CalendarIcon,
  Plus,
  Eye,
  Trash2,
  Printer,
  Loader2,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { format } from "date-fns";
import { type DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

function formatCurrency(value: number | string | undefined | null) {
  const num = Number(value ?? 0);
  return `Rs. ${num.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function buildColumns(
  onPaymentClick: (id: number) => void,
  onPrintClick: (id: number) => void,
  onDeleteClick: (id: number) => void,
  isYdm: boolean,
  isVendor: boolean,
  onStatusChange: (id: number, status: string) => void,
  printingId?: number | null,
): ColumnDef<CodPayment>[] {
  return [
    {
      id: "sn",
      header: "S.N.",
      cell: ({ row }) => (
        <span className="text-gray-600 font-medium text-center block">
          {row.index + 1}
        </span>
      ),
      size: 50,
    },
    {
      accessorKey: "payment_number",
      header: "Payment Number",
      cell: ({ row }) => {
        const payment = row.original;
        return (
          <div
            onClick={() => onPaymentClick(payment.id)}
            className="font-semibold text-[#2e4a62] hover:underline cursor-pointer"
          >
            {payment.payment_number || "N/A"}
          </div>
        );
      },
    },
    {
      accessorKey: "transfer_date",
      header: "Transfer Date",
      cell: ({ getValue }) => (
        <div className="text-gray-600">{formatDate(getValue() as string)}</div>
      ),
    },
    {
      accessorKey: "order_count",
      header: "Order Count",
      cell: ({ getValue }) => (
        <div className="text-gray-700 font-medium text-center">
          {(getValue() as number) ?? 0}
        </div>
      ),
    },
    {
      accessorKey: "delivery_amount",
      header: "Delivery Amount",
      cell: ({ getValue }) => (
        <div className="text-gray-600 font-medium">
          {formatCurrency(getValue() as string)}
        </div>
      ),
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ getValue }) => (
        <div className="text-[#2e4a62] font-semibold">
          {formatCurrency(getValue() as string)}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: () => <div className="text-center">Status</div>,
      cell: ({ row, getValue }) => {
        const payment = row.original;
        const status = (getValue() as string) || "Pending";
        const isPaid =
          status.toLowerCase() === "paid" ||
          status.toLowerCase() === "completed";

        if (isVendor) {
          const selectValue = isPaid ? "Paid" : "Pending";
          return (
            <div
              className="flex justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <Select
                value={selectValue}
                onValueChange={(val) => onStatusChange(payment.id, val || "")}
              >
                <SelectTrigger className="w-[110px] h-7 text-xs border-gray-200">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          );
        }

        return (
          <div className="text-center">
            <span
              className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${
                isPaid
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-orange-50 text-orange-700 border border-orange-200"
              }`}
            >
              {status}
            </span>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-center">Actions</div>,
      cell: ({ row }) => {
        const payment = row.original;
        const isPrinting = printingId === payment.id;
        return (
          <div className="flex items-center justify-center gap-1.5">
            <button
              onClick={() => onPaymentClick(payment.id)}
              title="View Details"
              className="p-1.5 text-gray-600 bg-gray-50 border border-gray-200 rounded hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onPrintClick(payment.id)}
              disabled={isPrinting}
              title="Print Transfer"
              className="p-1.5 text-gray-600 bg-gray-50 border border-gray-200 rounded hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-50"
            >
              {isPrinting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#2e4a62]" />
              ) : (
                <Printer className="w-3.5 h-3.5" />
              )}
            </button>
            {isYdm && (
              <AlertDialog>
                <AlertDialogTrigger
                  render={
                    <button
                      title="Delete Transfer"
                      className="p-1.5 text-red-600 bg-red-50 border border-red-200 rounded hover:bg-red-100 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  }
                />
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      the COD Transfer {payment.payment_number}.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDeleteClick(payment.id)}
                      variant="destructive"
                    >
                      Yes, Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        );
      },
    },
  ];
}

export function CodTransfersView({
  userId: propUserId,
}: { userId?: string } = {}) {
  const { user } = useAuth();
  const router = useRouter();
  const userId = propUserId ?? user?.user_id;
  const isYdm = user?.role === "ydm";
  const isVendor = user?.role === "vendor";

  // Filter inputs (reactive)
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  // Automatically derived applied filters for transfers list
  const appliedFilters = {
    status: statusFilter === "all" ? undefined : statusFilter,
    start_date: dateRange?.from
      ? format(dateRange.from, "yyyy-MM-dd")
      : undefined,
    end_date: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
  };

  const { data, isLoading, isFetching } = useVendorCodPayments(
    userId,
    appliedFilters,
  );

  const [printingId, setPrintingId] = useState<number | null>(null);

  const deleteMutation = useDeleteCodTransfer();
  const updateMutation = useUpdateCodTransfer();

  const handlePaymentClick = (paymentId: number) => {
    if (isYdm) {
      router.push(`/dashboard/vendors/${userId}/payments/${paymentId}`);
    } else {
      router.push(`/dashboard/payments/${paymentId}`);
    }
  };

  const handleDeleteClick = (paymentId: number) => {
    deleteMutation.mutate(paymentId);
  };

  const handleStatusChange = (paymentId: number, status: string) => {
    updateMutation.mutate({ paymentId, status });
  };

  const handlePrintTransfer = async (paymentId: number) => {
    try {
      setPrintingId(paymentId);
      toast.info("Fetching transfer details for printing...");
      const detail = await getCodPaymentDetail(paymentId);
      const orders = detail.orders_detail ?? [];

      let totalCharge = 0;
      let totalCOD = 0;
      let totalNet = 0;

      orders.forEach((order) => {
        const statusLower = order.status?.toLowerCase() || "";
        const isCancelledStatus =
          statusLower === "cancelled" ||
          statusLower === "returning_to_vendor" ||
          statusLower === "returned_to_vendor";
        const charge = isCancelledStatus
          ? Number(order.ydm_cancelled_charge ?? 0)
          : Number(order.ydm_delivery_charge ?? order.delivery_charge ?? 0);
        const displayCOD = isCancelledStatus
          ? 0
          : Number(order.net_amount || 0) + charge;
        const net = Number(order.net_amount || 0);

        totalCharge += charge;
        totalCOD += displayCOD;
        totalNet += net;
      });

      const formatDateStr = (dateStr: string) => {
        if (!dateStr) return "N/A";
        return new Date(dateStr).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      };

      const formatCurrencyVal = (val: number) => {
        const num = Number(val || 0);
        const formatted = Math.abs(num).toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
        return num < 0 ? `- Rs. ${formatted}` : `Rs. ${formatted}`;
      };

      const tableRows = orders
        .map((order, idx) => {
          const statusLower = order.status?.toLowerCase() || "";
          const isCancelledStatus =
            statusLower === "cancelled" ||
            statusLower === "returning_to_vendor" ||
            statusLower === "returned_to_vendor";

          const charge = isCancelledStatus
            ? Number(order.ydm_cancelled_charge ?? 0)
            : Number(order.ydm_delivery_charge ?? order.delivery_charge ?? 0);

          const isRTV =
            statusLower === "returning_to_vendor" ||
            statusLower === "returned_to_vendor";
          const isCancelled = statusLower === "cancelled";
          const suffix = isRTV ? " - RTV" : isCancelled ? " - CANCELLED" : "";
          const displayOrderId = `${order.tracking_number}${suffix}`;
          const displayCOD = isCancelledStatus
            ? 0
            : Number(order.net_amount || 0) + charge;

          return `
            <tr>
              <td style="padding: 6px 8px; text-align: center; color: #4b5563;">${idx + 1}</td>
              <td style="padding: 6px 8px; font-weight: 600; color: #2e4a62;">${displayOrderId}</td>
              <td style="padding: 6px 8px; color: #1f2937;">${order.recipient_name || "N/A"}</td>
              <td style="padding: 6px 8px; color: #4b5563;">${order.payment_type || "N/A"}</td>
              <td style="padding: 6px 8px; text-align: right; color: #374151;">${formatCurrencyVal(displayCOD)}</td>
              <td style="padding: 6px 8px; text-align: right; color: #374151;">${formatCurrencyVal(charge)}</td>
              <td style="padding: 6px 8px; text-align: right; font-weight: 600; color: ${order.net_amount < 0 ? "#ef4444" : "#2e4a62"};">${formatCurrencyVal(order.net_amount)}</td>
              <td style="padding: 6px 8px; text-align: center;">
                <span class="status-badge">
                  ${(order.status || "").replace(/_/g, " ")}
                </span>
              </td>
            </tr>
          `;
        })
        .join("");

      const creatorName = `${detail.created_by_detail?.first_name || ""} ${detail.created_by_detail?.last_name || ""}`.trim();
      const userName = `${detail.user_detail?.first_name || ""} ${detail.user_detail?.last_name || ""}`.trim();

      const printHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>COD Transfer #${detail.payment_number}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 8mm;
    }
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    html, body {
      background: #ffffff;
      color: #1f2937;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 11px;
      line-height: 1.4;
    }
    body {
      padding: 4mm;
    }
    .printable-area {
      display: flex;
      flex-direction: column;
      gap: 16px;
      width: 100%;
    }
    .header-grid {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8px;
    }
    .left-header {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .company-title {
      font-size: 18px;
      font-weight: 800;
      color: #1f2937;
      text-transform: uppercase;
      letter-spacing: 0.025em;
    }
    .creator-name {
      font-size: 14px;
      font-weight: 700;
      color: #1f2937;
      margin-top: 2px;
    }
    .sub-info {
      font-size: 11px;
      color: #6b7280;
    }
    .right-header {
      display: flex;
      flex-direction: column;
      gap: 12px;
      text-align: right;
    }
    .transfer-title {
      font-size: 20px;
      font-weight: 900;
      color: #2e4a62;
      text-transform: uppercase;
      letter-spacing: -0.025em;
    }
    .payment-num {
      font-size: 15px;
      font-weight: 700;
      color: #6b7280;
      margin-top: 2px;
    }
    .transfer-date {
      font-size: 11px;
      color: #9ca3af;
      margin-top: 2px;
    }
    .billing-label {
      font-size: 10px;
      font-weight: 700;
      color: #9ca3af;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      display: block;
      margin-bottom: 2px;
    }
    .customer-name {
      font-size: 14px;
      font-weight: 700;
      color: #1f2937;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
      text-align: left;
    }
    thead tr {
      background-color: #f9fafb;
      border-top: 1px solid #d1d5db;
      border-bottom: 1px solid #d1d5db;
      color: #4b5563;
      font-weight: 700;
    }
    th {
      padding: 6px 8px;
    }
    tbody tr {
      border-bottom: 1px solid #f3f4f6;
    }
    td {
      padding: 6px 8px;
    }
    .status-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 1px 6px;
      border-radius: 4px;
      border: 1px solid #e5e7eb;
      background-color: #f9fafb;
      font-size: 9px;
      text-transform: uppercase;
      font-weight: 600;
      color: #4b5563;
    }
    .totals-row {
      border-top: 1px solid #d1d5db;
      border-bottom: 1px solid #d1d5db;
      font-weight: 700;
      background-color: #f9fafb;
    }
    .totals-row td {
      padding: 8px 8px;
    }
    @media print {
      body {
        padding: 0;
      }
      tr {
        page-break-inside: avoid;
        break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="printable-area">
    <div class="header-grid">
      <div class="left-header">
        <h3 class="company-title">YDM LOGISTICS</h3>
        ${creatorName ? `<h4 class="creator-name">${creatorName}</h4>` : ""}
        <p class="sub-info">${detail.created_by_detail?.address || "N/A"}</p>
        <p class="sub-info">Phone: ${detail.created_by_detail?.phone_number || "N/A"}</p>
        <p class="sub-info">Email: ${detail.created_by_detail?.email || "N/A"}</p>
      </div>

      <div class="right-header">
        <div>
          <h2 class="transfer-title">COD Transfer</h2>
          <p class="payment-num">#${detail.payment_number}</p>
          <p class="transfer-date">COD Transfer Date: ${formatDateStr(detail.created_at)}</p>
        </div>

        <div>
          <span class="billing-label">Billing Customer</span>
          <h4 class="customer-name">${userName || "N/A"}</h4>
          <p class="sub-info">${detail.user_detail?.address || "N/A"}</p>
          <p class="sub-info">Phone: ${detail.user_detail?.phone_number || "N/A"}</p>
          <p class="sub-info">Email: ${detail.user_detail?.email || "N/A"}</p>
        </div>
      </div>
    </div>

    <div>
      <table>
        <thead>
          <tr>
            <th style="text-align: center; width: 40px;">SN</th>
            <th>Order ID</th>
            <th>Customer Name</th>
            <th>Payment Type</th>
            <th style="text-align: right;">COD</th>
            <th style="text-align: right;">Delivery Charge</th>
            <th style="text-align: right;">Net</th>
            <th style="text-align: center;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
          <tr class="totals-row">
            <td colSpan="4" style="text-align: right; color: #374151;">Total</td>
            <td style="text-align: right; color: #111827;">${formatCurrencyVal(totalCOD)}</td>
            <td style="text-align: right; color: #111827;">${formatCurrencyVal(totalCharge)}</td>
            <td style="text-align: right; color: ${totalNet < 0 ? "#ef4444" : "#2e4a62"};">${formatCurrencyVal(totalNet)}</td>
            <td></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</body>
</html>
      `;

      const existingIframe = document.getElementById("cod-print-frame");
      if (existingIframe) {
        existingIframe.remove();
      }

      const iframe = document.createElement("iframe");
      iframe.id = "cod-print-frame";
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "0";
      iframe.style.visibility = "hidden";
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentWindow?.document;
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(printHtml);
        iframeDoc.close();

        setTimeout(() => {
          try {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
          } catch (e) {
            console.error(e);
          } finally {
            setTimeout(() => {
              if (document.body.contains(iframe)) {
                document.body.removeChild(iframe);
              }
            }, 1000);
          }
        }, 250);
      }
    } catch (err: any) {
      toast.error(
        "Failed to print transfer: " + (err?.message || "Unknown error"),
      );
    } finally {
      setPrintingId(null);
    }
  };

  const columns = buildColumns(
    handlePaymentClick,
    handlePrintTransfer,
    handleDeleteClick,
    isYdm,
    isVendor,
    handleStatusChange,
    printingId,
  );
  const codPayments = data?.results ?? [];

  const handleClearFilter = () => {
    setStatusFilter("all");
    setDateRange(undefined);
  };

  // Client-side CSV export
  const handleExportCSV = () => {
    if (!codPayments.length) return;

    // Create CSV header
    const headers = [
      "S.N.",
      "Payment Number",
      "Transfer Date",
      "Order Count",
      "Delivery Amount",
      "Amount",
      "Status",
    ];

    // Map rows
    const rows = codPayments.map((payment, idx) => {
      const paymentNum = payment.payment_number || "N/A";
      const transferDate = formatDate(payment.transfer_date);
      const orderCount = payment.order_count ?? 0;
      const deliveryAmount = Number(payment.delivery_amount || 0).toFixed(2);
      const amount = Number(payment.amount || 0).toFixed(2);
      const status = payment.status || "Pending";

      return [
        idx + 1,
        `"${paymentNum}"`,
        `"${transferDate}"`,
        orderCount,
        deliveryAmount,
        amount,
        `"${status}"`,
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `cod_transfers_vendor_${userId || "export"}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-6 bg-white p-6 md:p-8 rounded-sm border border-gray-200">
      {/* Card Title & Info Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-[#2e4a62] uppercase">
            COD Transfers
          </h3>
          <TooltipProvider delay={100}>
            <Tooltip>
              <TooltipTrigger
                render={
                  <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-pointer" />
                }
              />
              <TooltipContent>
                <p className="text-xs max-w-xs">
                  View and track bank/cash transfers for Cash on Delivery
                  balances.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Filter controls row */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Payment Status Buttons */}
          <div className="flex items-center gap-0.5 rounded-md p-0.5 bg-gray-50 h-8">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1 text-xs font-semibold rounded-xs transition-colors duration-150 ${
                statusFilter === "all"
                  ? "bg-[#2e4a62] text-white shadow-xs"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/50"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter("Pending")}
              className={`px-3 py-1 text-xs font-semibold rounded-xs transition-colors duration-150 ${
                statusFilter === "Pending"
                  ? "bg-[#2e4a62] text-white shadow-xs"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/50"
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setStatusFilter("Paid")}
              className={`px-3 py-1 text-xs font-semibold rounded-xs transition-colors duration-150 ${
                statusFilter === "Paid"
                  ? "bg-[#2e4a62] text-white shadow-xs"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/50"
              }`}
            >
              Paid
            </button>
          </div>

          {/* Date Range Picker */}
          <div className="w-[240px]">
            <Popover>
              <PopoverTrigger
                id="date-picker-range-cod"
                className={cn(
                  buttonVariants({
                    variant: "outline",
                    className:
                      "justify-start px-2.5 font-normal h-8 w-full rounded-xs text-xs text-gray-500 transition-colors bg-white hover:bg-white hover:text-gray-500",
                  }),
                  dateRange?.from ? "border-orange-400" : "border-gray-200",
                )}
              >
                <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} –{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Select Date Range</span>
                )}
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Clear button if filters applied */}
          {(statusFilter !== "all" || dateRange?.from || dateRange?.to) && (
            <button
              onClick={handleClearFilter}
              disabled={isFetching}
              className="text-xs text-gray-500 hover:text-gray-700 underline underline-offset-2"
            >
              Clear
            </button>
          )}

          <Button
            onClick={handleExportCSV}
            disabled={!codPayments.length}
            variant="outline"
            size="sm"
            className="h-8 text-xs border-gray-200 text-gray-700 hover:bg-gray-50 gap-1.5 rounded-full px-4"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </Button>

          {/* YDM Admin Create Option - Navigates to a separate dedicated page */}
          {isYdm && (
            <Button
              onClick={() =>
                router.push(`/dashboard/vendors/${userId}/payments/create`)
              }
              className="h-8 text-xs bg-[#e2722b] hover:bg-[#d0631c] text-white gap-1.5 rounded-full px-4 border-0"
            >
              <Plus className="w-3.5 h-3.5" />
              Create Transfer
            </Button>
          )}
        </div>
      </div>

      {/* DataTable */}
      <DataTable
        data={codPayments}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="No COD transfers available."
      />
    </div>
  );
}
