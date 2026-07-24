"use client";

import { useState, Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "@/src/lib/auth-context";
import {
  useVendorDeliveryBills,
  useVendorDeliveryBillOrders,
  useDeleteDeliveryBill,
  useUpdateDeliveryBill,
} from "./delivery-bills.queries";
import {
  DeliveryBill,
  getDeliveryBillDetail,
} from "@/src/services/delivery-bills";
import { PaymentOrder } from "@/src/services/payments";
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
  Coins,
  History,
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
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getOrderStatusBadgeClass(status: string) {
  switch (status?.toUpperCase()) {
    case "DELIVERED":
      return "bg-green-50 text-green-700 border-green-200";
    case "CANCELLED":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-gray-50 text-gray-600 border-gray-200";
  }
}

// Columns for Order Wise Delivery Bills tab
function buildOrderWiseColumns(): ColumnDef<PaymentOrder>[] {
  return [
    {
      id: "order_id",
      header: "Order ID",
      cell: ({ row }) => {
        const order = row.original;
        const displayId = order.tracking_number || `#${order.id}`;
        return (
          <div className="font-semibold text-[#2e4a62]">
            {displayId}
          </div>
        );
      },
    },
    {
      accessorKey: "recipient_name",
      header: "Receiver",
      cell: ({ getValue }) => (
        <div className="text-gray-700 font-medium">
          {(getValue() as string) || "N/A"}
        </div>
      ),
    },
    {
      accessorKey: "cod",
      header: "COD",
      cell: ({ getValue }) => (
        <div className="text-gray-700">
          {formatCurrency(getValue() as string)}
        </div>
      ),
    },
    {
      id: "charge",
      header: "Delivery Charge",
      cell: ({ row }) => {
        const order = row.original;
        const charge =
          order.ydm_cancellation_charge !== null &&
          order.ydm_cancellation_charge !== undefined
            ? order.ydm_cancellation_charge
            : (order.delivery_charge ?? 0);
        return <div className="text-gray-600">{formatCurrency(charge)}</div>;
      },
    },
    {
      accessorKey: "status",
      header: () => <div className="text-center">Order Status</div>,
      cell: ({ getValue }) => {
        const status = (getValue() as string) || "N/A";
        return (
          <div className="text-center">
            <span
              className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[9px] uppercase font-bold tracking-wider border ${getOrderStatusBadgeClass(
                status,
              )}`}
            >
              {status.replace(/_/g, " ")}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "payment_status",
      header: () => <div className="text-center">Payment Status</div>,
      cell: ({ getValue }) => {
        const status = (getValue() as string) || "Pending";
        const isPaid =
          status.toLowerCase() === "paid" ||
          status.toLowerCase() === "completed";
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
  ];
}

// Columns for Delivery Bills list tab
function buildDeliveryBillColumns(
  onBillClick: (id: number) => void,
  onPrintClick: (id: number) => void,
  onDeleteClick: (id: number) => void,
  isYdm: boolean,
  isVendor: boolean,
  onStatusChange: (id: number, status: string) => void,
  printingId?: number | null,
): ColumnDef<DeliveryBill>[] {
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
      accessorKey: "bill_number",
      header: "Bill Number",
      cell: ({ row }) => {
        const bill = row.original;
        return (
          <div
            onClick={() => onBillClick(bill.id)}
            className="font-semibold text-[#2e4a62] hover:underline cursor-pointer"
          >
            {bill.bill_number || "N/A"}
          </div>
        );
      },
    },
    {
      accessorKey: "transfer_date",
      header: "Date",
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
        <div className="text-[#2e4a62] font-semibold">
          {formatCurrency(getValue() as string)}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: () => <div className="text-center">Status</div>,
      cell: ({ row, getValue }) => {
        const bill = row.original;
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
                onValueChange={(val) => onStatusChange(bill.id, val || "")}
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
        const bill = row.original;
        const isPrinting = printingId === bill.id;
        return (
          <div className="flex items-center justify-center gap-1.5">
            <button
              onClick={() => onBillClick(bill.id)}
              title="View Details"
              className="p-1.5 text-gray-600 bg-gray-50 border border-gray-200 rounded hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onPrintClick(bill.id)}
              disabled={isPrinting}
              title="Print Delivery Bill"
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
                      title="Delete Bill"
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
                      the Delivery Bill {bill.bill_number}.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDeleteClick(bill.id)}
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

function DeliveryBillsContent({
  userId: propUserId,
}: { userId?: string } = {}) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const userId = propUserId ?? user?.user_id;
  const isYdm = user?.role === "ydm";
  const isVendor = user?.role === "vendor";

  // Active tab state from URL params
  const activeTab =
    (searchParams.get("tab") as "order_wise" | "delivery_bills") || "order_wise";

  const setActiveTab = (tab: "order_wise" | "delivery_bills") => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Filter inputs (reactive)
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  // Derived applied filters
  const appliedFilters = {
    status: statusFilter === "all" ? undefined : statusFilter,
    start_date: dateRange?.from
      ? format(dateRange.from, "yyyy-MM-dd")
      : undefined,
    end_date: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
  };

  // Queries for delivery bills list vs order wise delivery bills
  const { data: billsData, isLoading: isLoadingBills, isFetching: isFetchingBills } =
    useVendorDeliveryBills(
      userId,
      activeTab === "delivery_bills" ? appliedFilters : {},
    );

  const { data: ordersData, isLoading: isLoadingOrders, isFetching: isFetchingOrders } =
    useVendorDeliveryBillOrders(
      userId,
      activeTab === "order_wise" ? appliedFilters : {},
    );

  const [printingId, setPrintingId] = useState<number | null>(null);

  const deleteMutation = useDeleteDeliveryBill();
  const updateMutation = useUpdateDeliveryBill();

  const handleBillClick = (billId: number) => {
    if (isYdm) {
      router.push(`/dashboard/vendors/${userId}/delivery-bills/${billId}`);
    } else {
      router.push(`/dashboard/delivery-bills/${billId}`);
    }
  };

  const handleDeleteClick = (billId: number) => {
    deleteMutation.mutate(billId);
  };

  const handleStatusChange = (billId: number, status: string) => {
    updateMutation.mutate({ billId, status });
  };

  const handlePrintDeliveryBill = async (billId: number) => {
    try {
      setPrintingId(billId);
      toast.info("Fetching delivery bill details for printing...");
      const detail = await getDeliveryBillDetail(billId);
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
              <td style="padding: 6px 8px; text-align: right; color: #374151;">${formatCurrencyVal(charge)}</td>
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
  <title>Delivery Bill #${detail.bill_number}</title>
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
          <h2 class="transfer-title">Delivery Bill</h2>
          <p class="payment-num">#${detail.bill_number}</p>
          <p class="transfer-date">Bill Date: ${formatDateStr(detail.created_at)}</p>
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
            <th style="text-align: right;">Delivery Charge</th>
            <th style="text-align: center;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
          <tr class="totals-row">
            <td colSpan="4" style="text-align: right; color: #374151;">Total Delivery Charge</td>
            <td style="text-align: right; color: #111827;">${formatCurrencyVal(totalCharge)}</td>
            <td></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</body>
</html>
      `;

      const existingIframe = document.getElementById("delivery-bill-print-frame");
      if (existingIframe) {
        existingIframe.remove();
      }

      const iframe = document.createElement("iframe");
      iframe.id = "delivery-bill-print-frame";
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
        "Failed to print delivery bill: " + (err?.message || "Unknown error"),
      );
    } finally {
      setPrintingId(null);
    }
  };

  const deliveryBills = billsData?.results ?? [];
  const billOrders = ordersData?.results ?? [];

  const handleClearFilter = () => {
    setStatusFilter("all");
    setDateRange(undefined);
  };

  // Client-side CSV export
  const handleExportCSV = () => {
    if (activeTab === "order_wise") {
      if (!billOrders.length) return;
      const headers = [
        "Order ID",
        "Receiver",
        "COD",
        "Delivery Charge",
        "Order Status",
        "Payment Status",
      ];
      const rows = billOrders.map((order) => {
        const displayId = order.tracking_number || `#${order.id}`;
        const receiver = order.recipient_name || "N/A";
        const cod = Number(order.cod || 0).toFixed(2);
        const charge = Number(
          order.ydm_cancellation_charge !== null &&
          order.ydm_cancellation_charge !== undefined
            ? order.ydm_cancellation_charge
            : (order.delivery_charge ?? 0),
        ).toFixed(2);
        const orderStatus = order.status
          ? order.status.replace(/_/g, " ")
          : "N/A";
        const paymentStatus = order.payment_status || "Pending";

        return [
          `"${displayId}"`,
          `"${receiver.replace(/"/g, '""')}"`,
          cod,
          charge,
          `"${orderStatus}"`,
          `"${paymentStatus}"`,
        ].join(",");
      });

      const csvContent = [headers.join(","), ...rows].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `order_wise_delivery_bills_${userId || "export"}.csv`,
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      if (!deliveryBills.length) return;
      const headers = [
        "S.N.",
        "Bill Number",
        "Date",
        "Order Count",
        "Delivery Amount",
        "Status",
      ];
      const rows = deliveryBills.map((bill, idx) => {
        const billNum = bill.bill_number || "N/A";
        const transferDate = formatDate(bill.transfer_date);
        const orderCount = bill.order_count ?? 0;
        const deliveryAmount = Number(bill.delivery_amount || 0).toFixed(2);
        const status = bill.status || "Pending";

        return [
          idx + 1,
          `"${billNum}"`,
          `"${transferDate}"`,
          orderCount,
          deliveryAmount,
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
        `delivery_bills_vendor_${userId || "export"}.csv`,
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const deliveryBillColumns = buildDeliveryBillColumns(
    handleBillClick,
    handlePrintDeliveryBill,
    handleDeleteClick,
    isYdm,
    isVendor,
    handleStatusChange,
    printingId,
  );

  const orderWiseColumns = buildOrderWiseColumns();

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Top Tabs Subnavigation */}
      <div className="flex items-center border-b border-gray-200">
        <button
          onClick={() => setActiveTab("order_wise")}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all duration-150 ${
            activeTab === "order_wise"
              ? "border-orange-500 text-[#2e4a62]"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          <Coins className="w-3.5 h-3.5" />
          Order Wise Delivery Bills
        </button>

        <button
          onClick={() => setActiveTab("delivery_bills")}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all duration-150 ${
            activeTab === "delivery_bills"
              ? "border-orange-500 text-[#2e4a62]"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          <History className="w-3.5 h-3.5" />
          Delivery Bills
        </button>
      </div>

      {activeTab === "order_wise" && (
        <div className="flex flex-col gap-6 bg-white p-6 md:p-8 rounded-sm border border-gray-200">
          {/* Card Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#2e4a62] uppercase">
                Order Delivery Bills
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
                      View order wise delivery charges, net totals, and delivery bill status.
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
                    id="date-picker-range-delivery-orders"
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

              {/* Clear button */}
              {(statusFilter !== "all" || dateRange?.from || dateRange?.to) && (
                <button
                  onClick={handleClearFilter}
                  disabled={isFetchingOrders}
                  className="text-xs text-gray-500 hover:text-gray-700 underline underline-offset-2"
                >
                  Clear
                </button>
              )}

              <Button
                onClick={handleExportCSV}
                disabled={!billOrders.length}
                variant="outline"
                size="sm"
                className="h-8 text-xs border-gray-200 text-gray-700 hover:bg-gray-50 gap-1.5 rounded-full px-4"
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </Button>
            </div>
          </div>

          {/* DataTable */}
          <DataTable
            data={billOrders}
            columns={orderWiseColumns}
            isLoading={isLoadingOrders}
            emptyMessage="No delivery bill order records available."
          />
        </div>
      )}

      {activeTab === "delivery_bills" && (
        <div className="flex flex-col gap-6 bg-white p-6 md:p-8 rounded-sm border border-gray-200">
          {/* Header section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#2e4a62] uppercase">
                Delivery Bills
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
                      View and track delivery charge bills for vendors.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Filter controls row */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Status Buttons */}
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
                    id="date-picker-range-delivery-bill"
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

              {/* Clear button */}
              {(statusFilter !== "all" || dateRange?.from || dateRange?.to) && (
                <button
                  onClick={handleClearFilter}
                  disabled={isFetchingBills}
                  className="text-xs text-gray-500 hover:text-gray-700 underline underline-offset-2"
                >
                  Clear
                </button>
              )}

              <Button
                onClick={handleExportCSV}
                disabled={!deliveryBills.length}
                variant="outline"
                size="sm"
                className="h-8 text-xs border-gray-200 text-gray-700 hover:bg-gray-50 gap-1.5 rounded-full px-4"
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </Button>

              {/* YDM Admin Create Option */}
              {isYdm && (
                <Button
                  onClick={() =>
                    router.push(
                      `/dashboard/vendors/${userId}/delivery-bills/create`,
                    )
                  }
                  className="h-8 text-xs bg-[#e2722b] hover:bg-[#d0631c] text-white gap-1.5 rounded-full px-4 border-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Create Delivery Bill
                </Button>
              )}
            </div>
          </div>

          {/* DataTable */}
          <DataTable
            data={deliveryBills}
            columns={deliveryBillColumns}
            isLoading={isLoadingBills}
            emptyMessage="No delivery bills available."
          />
        </div>
      )}
    </div>
  );
}

export function DeliveryBillsView(props: { userId?: string }) {
  return (
    <Suspense
      fallback={
        <div className="p-4 text-xs text-gray-500">
          Loading delivery bills...
        </div>
      }
    >
      <DeliveryBillsContent {...props} />
    </Suspense>
  );
}
