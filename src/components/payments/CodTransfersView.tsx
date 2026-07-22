"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/lib/auth-context";
import { useVendorCodPayments } from "./payments.queries";
import { CodPayment } from "@/src/services/payments";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  HelpCircle,
  Download,
  CalendarIcon,
  Plus,
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

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function buildColumns(): ColumnDef<CodPayment>[] {
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
      cell: ({ getValue }) => (
        <div className="font-semibold text-[#2e4a62] hover:underline cursor-pointer">
          {getValue() as string || "N/A"}
        </div>
      ),
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
        <div className="text-gray-700 font-medium text-center">{getValue() as number ?? 0}</div>
      ),
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ getValue }) => (
        <div className="text-[#2e4a62] font-semibold">{formatCurrency(getValue() as string)}</div>
      ),
    },
    {
      accessorKey: "status",
      header: () => <div className="text-center">Status</div>,
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

export function CodTransfersView({ userId: propUserId }: { userId?: string } = {}) {
  const { user } = useAuth();
  const router = useRouter();
  const userId = propUserId ?? user?.user_id;
  const isYdm = user?.role === "ydm";

  // Filter inputs (reactive)
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  // Automatically derived applied filters for transfers list
  const appliedFilters = {
    status: statusFilter === "all" ? undefined : statusFilter,
    start_date: dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : undefined,
    end_date: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
  };

  const { data, isLoading, isFetching } = useVendorCodPayments(userId, appliedFilters);

  const columns = buildColumns();
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
      "Amount",
      "Status",
    ];

    // Map rows
    const rows = codPayments.map((payment, idx) => {
      const paymentNum = payment.payment_number || "N/A";
      const transferDate = formatDate(payment.transfer_date);
      const orderCount = payment.order_count ?? 0;
      const amount = Number(payment.amount || 0).toFixed(2);
      const status = payment.status || "Pending";

      return [
        idx + 1,
        `"${paymentNum}"`,
        `"${transferDate}"`,
        orderCount,
        amount,
        `"${status}"`,
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `cod_transfers_vendor_${userId || "export"}.csv`);
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
                  View and track bank/cash transfers for Cash on Delivery balances.
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
              onClick={() => router.push(`/dashboard/vendors/${userId}/payments/create`)}
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
