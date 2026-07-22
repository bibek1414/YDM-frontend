"use client";

import { useState } from "react";
import { useAuth } from "@/src/lib/auth-context";
import { useVendorPaymentOrders } from "./payments.queries";
import { PaymentOrder } from "@/src/services/payments";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  HelpCircle,
  Download,
  Coins,
  History,
  Activity,
  FileSpreadsheet,
  CalendarIcon,
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

function formatCurrency(value: number | string | undefined | null) {
  const num = Number(value ?? 0);
  return `Rs. ${num.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// Column definition generator
function buildColumns(): ColumnDef<PaymentOrder>[] {
  return [
    {
      id: "order_id",
      header: "Order ID",
      cell: ({ row }) => {
        const order = row.original;
        const displayId = order.tracking_number || `#${order.id}`;
        return (
          <div className="font-semibold text-[#2e4a62] hover:underline cursor-pointer">
            {displayId}
          </div>
        );
      },
    },
    {
      accessorKey: "recipient_name",
      header: "Receiver",
      cell: ({ getValue }) => (
        <div className="text-gray-700 font-medium">{getValue() as string || "N/A"}</div>
      ),
    },
    {
      accessorKey: "cod",
      header: "COD",
      cell: ({ getValue }) => (
        <div className="text-gray-700">{formatCurrency(getValue() as string)}</div>
      ),
    },
    {
      id: "charge",
      header: "Delivery Charge",
      cell: ({ row }) => {
        const order = row.original;
        const charge = order.ydm_cancellation_charge !== null 
          ? order.ydm_cancellation_charge 
          : (order.delivery_charge ?? 0);
        return <div className="text-gray-600">{formatCurrency(charge)}</div>;
      },
    },
    {
      accessorKey: "net_amount",
      header: "Net",
      cell: ({ getValue }) => (
        <div className="text-[#2e4a62] font-semibold">{formatCurrency(getValue() as number)}</div>
      ),
    },
    {
      id: "balance",
      header: "Balance",
      cell: ({ row }) => {
        const order = row.original;
        if (order.balance !== undefined) {
          return <div className="text-red-500 font-medium">{formatCurrency(order.balance)}</div>;
        }
        // Fallback calculation: if Paid/Completed, balance is 0, else net_amount
        const isPaid = order.payment_status?.toLowerCase() === "paid" || order.payment_status?.toLowerCase() === "completed";
        const val = isPaid ? 0 : order.net_amount;
        return <div className="text-red-500 font-medium">{formatCurrency(val)}</div>;
      },
    },
    {
      accessorKey: "payment_status",
      header: () => <div className="text-center">Payment Status</div>,
      cell: ({ getValue }) => {
        const status = (getValue() as string) || "Pending";
        const isPaid = status.toLowerCase() === "paid" || status.toLowerCase() === "completed";
        
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

export function PaymentsView({ userId: propUserId }: { userId?: string } = {}) {
  const { user } = useAuth();
  const userId = propUserId ?? user?.user_id;

  // Active tab state
  const [activeTab, setActiveTab] = useState<"order_wise" | "cod_transfers" | "change_logs">("order_wise");

  // Filter inputs (reactive)
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  // Automatically derived applied filters
  const appliedFilters = {
    status: statusFilter === "all" ? undefined : statusFilter,
    start_date: dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : undefined,
    end_date: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
  };

  const { data, isLoading, isFetching } = useVendorPaymentOrders(
    userId,
    activeTab === "order_wise" ? appliedFilters : {}
  );

  const columns = buildColumns();
  const paymentOrders = data?.results ?? [];

  const handleClearFilter = () => {
    setStatusFilter("all");
    setDateRange(undefined);
  };

  // Client-side CSV export
  const handleExportCSV = () => {
    if (!paymentOrders.length) return;

    // Create CSV header
    const headers = [
      "Order ID",
      "Receiver",
      "COD",
      "Delivery Charge",
      "Net",
      "Balance",
      "Payment Status",
    ];

    // Map rows
    const rows = paymentOrders.map((order) => {
      const displayId = order.tracking_number || `#${order.id}`;
      const receiver = order.recipient_name || "N/A";
      const cod = Number(order.cod || 0).toFixed(2);
      const charge = Number(
        order.ydm_cancellation_charge !== null
          ? order.ydm_cancellation_charge
          : (order.delivery_charge ?? 0)
      ).toFixed(2);
      const net = Number(order.net_amount || 0).toFixed(2);
      
      const isPaid = order.payment_status?.toLowerCase() === "paid" || order.payment_status?.toLowerCase() === "completed";
      const balance = Number(
        order.balance !== undefined
          ? order.balance
          : (isPaid ? 0 : order.net_amount)
      ).toFixed(2);
      
      const status = order.payment_status || "Pending";

      return [
        `"${displayId}"`,
        `"${receiver.replace(/"/g, '""')}"`,
        cod,
        charge,
        net,
        balance,
        `"${status}"`,
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `payment_report_vendor_${userId || "export"}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
          Order Wise Payments
        </button>

        <button
          onClick={() => setActiveTab("cod_transfers")}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all duration-150 ${
            activeTab === "cod_transfers"
              ? "border-orange-500 text-[#2e4a62]"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          <History className="w-3.5 h-3.5" />
          COD Transfers
        </button>

        <button
          onClick={() => setActiveTab("change_logs")}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all duration-150 ${
            activeTab === "change_logs"
              ? "border-orange-500 text-[#2e4a62]"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          Order Change Logs
          <span className="bg-green-100 text-green-700 text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase">
            NEW
          </span>
        </button>
      </div>

      {activeTab === "order_wise" && (
        <div className="flex flex-col gap-6 bg-white p-6 md:p-8 rounded-sm border border-gray-200">
          {/* Card Title & Info Button */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#2e4a62] uppercase">
                Order Payments
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
                      View cash on delivery, charges, net totals, and transfer balances for orders.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Filter controls row */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Payment Status Buttons */}
              <div className="flex items-center gap-0.5 border border-gray-200 rounded-md p-0.5 bg-gray-50 h-8">
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
                    id="date-picker-range"
                    className={cn(
                      buttonVariants({
                        variant: "outline",
                        className: "justify-start px-2.5 font-normal h-8 w-full rounded-xs text-xs text-gray-500 transition-colors bg-white hover:bg-white hover:text-gray-500",
                      }),
                      dateRange?.from ? "border-orange-400" : "border-gray-200"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>{format(dateRange.from, "LLL dd, y")} – {format(dateRange.to, "LLL dd, y")}</>
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
                disabled={!paymentOrders.length}
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
            data={paymentOrders}
            columns={columns}
            isLoading={isLoading}
            emptyMessage="No payment records available."
          />
        </div>
      )}

      {activeTab === "cod_transfers" && (
        <div className="bg-white p-12 rounded-sm border border-gray-200 text-center flex flex-col items-center justify-center gap-3">
          <FileSpreadsheet className="w-12 h-12 text-gray-300" />
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            COD Transfer History
          </h3>
          <p className="text-xs text-gray-500 max-w-sm">
            COD transfers detail log is currently being configured and will be available shortly.
          </p>
        </div>
      )}

      {activeTab === "change_logs" && (
        <div className="bg-white p-12 rounded-sm border border-gray-200 text-center flex flex-col items-center justify-center gap-3">
          <Activity className="w-12 h-12 text-gray-300" />
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Order Change History Logs
          </h3>
          <p className="text-xs text-gray-500 max-w-sm">
            Detailed logs showing modifications to orders, status shifts, and timeline events are under configuration.
          </p>
        </div>
      )}
    </div>
  );
}
