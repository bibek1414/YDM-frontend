"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUnpaidOrders, useCreateCodTransfer } from "./payments.queries";
import { PaymentOrder } from "@/src/services/payments";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Loader2,
  CalendarIcon,
  Plus,
} from "lucide-react";
import { format } from "date-fns";
import { type DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

function formatCurrency(value: number | string | undefined | null) {
  const num = Number(value ?? 0);
  return `Rs. ${num.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

interface CreateTransferViewProps {
  userId: string;
}

export function CreateTransferView({ userId }: CreateTransferViewProps) {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  // Track selected orders in a map to preserve selections across different pages
  const [selectedOrders, setSelectedOrders] = useState<
    Record<number, PaymentOrder>
  >({});

  // Debounce search query to prevent API spamming
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 450);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Derived applied filters for unpaid orders (search + dates)
  const appliedFilters = {
    start_date: dateRange?.from
      ? format(dateRange.from, "yyyy-MM-dd")
      : undefined,
    end_date: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
  };

  // Reset page to 1 on date range changes
  useEffect(() => {
    setPage(1);
  }, [dateRange]);

  // Trigger unpaid orders list query (we pass debounced search and dates to the backend API)
  const {
    data: unpaidData,
    isLoading: isLoadingUnpaid,
    isFetching,
  } = useUnpaidOrders(
    userId,
    page,
    debouncedSearch,
    appliedFilters.start_date,
    appliedFilters.end_date,
  );

  const createCodTransferMutation = useCreateCodTransfer();

  const unpaidOrders = unpaidData?.results ?? [];
  const totalCount = unpaidData?.count ?? 0;
  const totalPages = Math.ceil(totalCount / 20) || 1;

  const selectedOrdersList = Object.values(selectedOrders);
  const selectedIds = Object.keys(selectedOrders).map(Number);
  const totalSelectedAmount = selectedOrdersList.reduce(
    (sum, order) => sum + Number(order.net_amount || 0),
    0,
  );

  const handleToggleOrder = (order: PaymentOrder) => {
    setSelectedOrders((prev) => {
      const copy = { ...prev };
      if (copy[order.id]) {
        delete copy[order.id];
      } else {
        copy[order.id] = order;
      }
      return copy;
    });
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setDebouncedSearch("");
    setDateRange(undefined);
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Back button and page title row */}
      <div className="flex items-center justify-between pb-2 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/dashboard/vendors/${userId}/payments`)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-700 font-normal border border-gray-200 rounded hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Payments
          </Button>
          <h2 className="text-sm font-bold text-[#2e4a62] uppercase border-b-2 border-orange-400 inline-block pb-2 -mb-[11px]">
            Create COD Transfer
          </h2>
        </div>
      </div>

      {/* Main Grid: Left for table, Right for transaction summary sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Column: List and Filters Card */}
        <div className="lg:col-span-3 flex flex-col gap-6 bg-white p-6 md:p-8 rounded-sm border border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100">
            <h3 className="text-sm font-bold text-[#2e4a62] uppercase">
              Select Unpaid Orders
            </h3>

            {/* Filter controls row */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Search input */}
              <div className="relative w-[220px]">
                <span className="absolute inset-y-0 left-0 flex items-center pl-2.5">
                  <Search className="h-3.5 w-3.5 text-gray-400" />
                </span>
                <input
                  type="text"
                  placeholder="Search by Order ID or Receiver..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-8 pl-8 pr-3 border border-gray-200 rounded-md text-xs text-gray-600 bg-white focus:outline-none focus:ring-1 focus:ring-[#2e4a62]"
                />
              </div>

              {/* Date Range Picker */}
              <div className="w-[240px]">
                <Popover>
                  <PopoverTrigger
                    id="date-picker-range-unpaid"
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

              {/* Clear filters trigger */}
              {(searchQuery || dateRange?.from || dateRange?.to) && (
                <button
                  onClick={handleClearFilters}
                  className="text-xs text-gray-500 hover:text-gray-700 underline underline-offset-2"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {isLoadingUnpaid ? (
            <div className="flex flex-col items-center justify-center py-20 gap-2 text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin text-[#2e4a62]" />
              <p className="text-xs">Fetching unpaid orders...</p>
            </div>
          ) : unpaidOrders.length === 0 ? (
            <div className="text-center py-16 text-gray-500 text-xs">
              No unpaid orders match the query criteria.
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="overflow-x-auto border border-gray-200 rounded-xs">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="p-3 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={
                            unpaidOrders.length > 0 &&
                            unpaidOrders.every((o) => !!selectedOrders[o.id])
                          }
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setSelectedOrders((prev) => {
                              const copy = { ...prev };
                              unpaidOrders.forEach((order) => {
                                if (checked) {
                                  copy[order.id] = order;
                                } else {
                                  delete copy[order.id];
                                }
                              });
                              return copy;
                            });
                          }}
                          className="rounded-sm border-gray-300 text-[#2e4a62] focus:ring-[#2e4a62] cursor-pointer"
                        />
                      </th>
                      <th className="p-3 font-semibold text-gray-600">
                        Order ID
                      </th>
                      <th className="p-3 font-semibold text-gray-600">
                        Receiver
                      </th>
                      <th className="p-3 font-semibold text-gray-600">COD</th>
                      <th className="p-3 font-semibold text-gray-600">
                        Delivery Charge
                      </th>
                      <th className="p-3 font-semibold text-gray-600">Net</th>
                      <th className="p-3 font-semibold text-gray-600">
                        Balance
                      </th>
                      <th className="p-3 font-semibold text-gray-600 text-center">
                        Order Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {unpaidOrders.map((order, idx) => {
                      const displayId = order.tracking_number || `#${order.id}`;
                      const isSelected = !!selectedOrders[order.id];

                      const charge = order.delivery_charge;

                      const isPaid =
                        order.payment_status?.toLowerCase() === "paid" ||
                        order.payment_status?.toLowerCase() === "completed";
                      const balance = isPaid ? 0 : order.net_amount;

                      return (
                        <tr
                          key={order.id}
                          onClick={() => handleToggleOrder(order)}
                          className={[
                            "border-b border-gray-200 last:border-0 transition-colors cursor-pointer",
                            isSelected
                              ? "bg-orange-50/20"
                              : idx % 2 === 0
                                ? "bg-white"
                                : "bg-gray-50/30",
                          ].join(" ")}
                        >
                          <td
                            className="p-3 text-center"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleOrder(order)}
                              className="rounded-sm border-gray-300 text-[#2e4a62] focus:ring-[#2e4a62] cursor-pointer"
                            />
                          </td>
                          <td className="p-3 font-semibold text-[#2e4a62]">
                            {displayId}
                          </td>
                          <td className="p-3 text-gray-700 font-medium">
                            {order.recipient_name || "N/A"}
                          </td>
                          <td className="p-3 text-gray-600">
                            {formatCurrency(order.cod)}
                          </td>
                          <td className="p-3 text-gray-600">
                            {formatCurrency(charge)}
                          </td>
                          <td className="p-3 font-semibold text-gray-700">
                            {formatCurrency(order.net_amount)}
                          </td>
                          <td className="p-3 font-semibold text-red-500">
                            {formatCurrency(balance)}
                          </td>
                          <td className="p-3 text-center">
                            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[9px] uppercase font-bold tracking-wider bg-orange-50 text-orange-700 border border-orange-200">
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-2">
                  <div className="text-xs text-gray-500">
                    Showing {(page - 1) * 20 + 1} to{" "}
                    {Math.min(page * 20, totalCount)} of {totalCount} entries
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      className="h-8 w-8 p-0 bg-white"
                      onClick={() => setPage((p) => Math.max(p - 1, 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-xs text-gray-500 font-medium">
                      Page {page} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      className="h-8 w-8 p-0 bg-white"
                      onClick={() =>
                        setPage((p) => Math.min(p + 1, totalPages))
                      }
                      disabled={page === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Transaction Sidebar Card */}
        <div className="bg-white p-6 rounded-sm border border-gray-200 flex flex-col gap-5 sticky top-20">
          <h3 className="text-xs font-bold text-[#2e4a62] uppercase border-b border-gray-100 pb-2.5">
            Transfer Summary
          </h3>

          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Selected Vendor ID:</span>
              <span className="font-semibold text-gray-800">#{userId}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Orders count:</span>
              <span className="font-semibold text-gray-800">
                {selectedIds.length} orders
              </span>
            </div>
            <div className="flex flex-col gap-1 border-t border-gray-100 pt-3 mt-1">
              <span className="text-[10px] uppercase font-bold text-gray-400">
                Total Transfer Amount
              </span>
              <span className="text-xl font-bold text-[#2e4a62]">
                {formatCurrency(totalSelectedAmount)}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-2 border-t border-gray-100 mt-2">
            <Button
              onClick={() => {
                if (selectedIds.length === 0) return;
                createCodTransferMutation.mutate(
                  {
                    user: Number(userId),
                    orders: selectedIds,
                    total_amount: Number(totalSelectedAmount.toFixed(2)),
                  },
                  {
                    onSuccess: () => {
                      router.push(`/dashboard/vendors/${userId}/payments`);
                    },
                  },
                );
              }}
              disabled={
                selectedIds.length === 0 || createCodTransferMutation.isPending
              }
              className="w-full bg-[#e2722b] hover:bg-[#d0631c] text-white flex items-center justify-center gap-1.5 h-10 text-xs font-semibold rounded-md border-0"
            >
              {createCodTransferMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating Transfer...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Create Transfer
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                router.push(`/dashboard/vendors/${userId}/payments`)
              }
              className="w-full h-10 text-xs text-red-600 hover:text-red-700 font-semibold border border-red-200 hover:border-red-300 hover:bg-red-50/50 rounded-md transition-colors bg-white"
              disabled={createCodTransferMutation.isPending}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
