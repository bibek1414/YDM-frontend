"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Package,
  MapPin,
  Phone,
  Navigation,
  Search,
  Copy,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  X,
  User,
  ShoppingBag,
  Loader2,
  CheckCircle2,
  Check,
  UserCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import DateRangePicker from "@/components/ui/date-range-picker";
import { useAuth } from "@/src/lib/auth-context";
import {
  useRiderPackageStats,
  useRiderCommissionStats,
  useRiderOrders,
  useRiderCommissionPayments,
} from "@/src/hooks/use-rider";
import {
  useUpdateRiderOrderStatus,
  useVerifyRiderOrder,
  useAllOrders,
  useAssignRider,
} from "@/src/components/orders/orders.queries";
import { RiderPackageStats } from "@/src/components/riders/rider-package-stats";
import { RiderCommissionStats } from "@/src/components/riders/rider-commission-stats";
import { RiderPaymentHistory } from "@/src/components/riders/rider-payment-history";
import { Order } from "@/src/services/orders";

// Status Update Form Component
function StatusUpdateForm({ order }: { order: Order }) {
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [statusComment, setStatusComment] = useState("");
  const { mutate: updateStatus, isPending: isUpdating } =
    useUpdateRiderOrderStatus();

  const allowedStatuses = [
    {
      value: "DELIVERED",
      label: "Delivered",
      color: "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50",
    },
    {
      value: "RESCHEDULED",
      label: "Reschedule",
      color: "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50",
    },
    {
      value: "ON_HOLD",
      label: "On Hold",
      color: "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50",
    },
    {
      value: "CANCELLED",
      label: "Cancel",
      color: "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50",
    },
  ];

  const isDelivered = selectedStatus === "DELIVERED";

  return (
    <>
      <div className="bg-gray-50/50 p-2.5 border-t border-gray-100">
        <p className="text-[10px] font-semibold text-gray-400 uppercase mb-2">
          Update Status
        </p>
        <div className="grid grid-cols-2 gap-2">
          {allowedStatuses.map((s) => (
            <button
              key={s.value}
              onClick={() => setSelectedStatus(s.value)}
              className={`py-1.5 px-2 rounded-md text-xs font-medium transition-colors shadow-2xs ${s.color}`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedStatus && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setSelectedStatus(null);
                setStatusComment("");
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-900">
                  Confirm{" "}
                  {
                    allowedStatuses.find((x) => x.value === selectedStatus)
                      ?.label
                  }
                </p>
                <button
                  onClick={() => {
                    setSelectedStatus(null);
                    setStatusComment("");
                  }}
                  className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="px-4 py-4 space-y-3">
                {isDelivered ? (
                  <p className="text-xs text-gray-500">
                    Are you sure you want to mark this order as{" "}
                    <span className="font-semibold text-gray-700">
                      Delivered
                    </span>
                    ?
                  </p>
                ) : (
                  <>
                    <p className="text-xs text-gray-500">
                      Add an optional comment for this status update.
                    </p>
                    <input
                      type="text"
                      placeholder="Comment..."
                      value={statusComment}
                      onChange={(e) => setStatusComment(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-gray-400"
                    />
                  </>
                )}
              </div>
              <div className="px-4 py-3 border-t border-gray-100 flex gap-2 justify-end bg-gray-50/50">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedStatus(null);
                    setStatusComment("");
                  }}
                  className="h-8 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  className="h-8 text-xs bg-gray-900 text-white hover:bg-gray-800"
                  disabled={isUpdating}
                  onClick={() => {
                    updateStatus(
                      {
                        trackingNumber: order.tracking_number,
                        payload: {
                          status: selectedStatus,
                          ...(isDelivered
                            ? {}
                            : { comment: statusComment || undefined }),
                        },
                      },
                      {
                        onSuccess: () => {
                          toast.success("Order status updated");
                          setSelectedStatus(null);
                          setStatusComment("");
                        },
                        onError: () => toast.error("Failed to update status."),
                      },
                    );
                  }}
                >
                  {isUpdating ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                  ) : null}
                  Confirm
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

export function RiderDashboardView() {
  const { user } = useAuth();

  // Tab state
  const [activeTab, setActiveTab] = useState<"today" | "all" | "commission">(
    "all",
  );

  useEffect(() => {
    const savedTab = localStorage.getItem("rider_dashboard_active_tab");
    if (
      savedTab &&
      (savedTab === "today" || savedTab === "all" || savedTab === "commission")
    ) {
      setActiveTab(savedTab);
    }
  }, []);

  const handleTabChange = (tab: "today" | "all" | "commission") => {
    setActiveTab(tab);
    localStorage.setItem("rider_dashboard_active_tab", tab);
  };

  // Date range for "all" tab
  const [dateRange, setDateRange] = useState<
    { from?: Date; to?: Date } | undefined
  >(undefined);

  // Compute date filters
  let startDate: string | undefined;
  let endDate: string | undefined;

  if (activeTab === "today") {
    const today = format(new Date(), "yyyy-MM-dd");
    startDate = today;
    endDate = today;
  } else if (activeTab === "all") {
    startDate = dateRange?.from
      ? format(dateRange.from, "yyyy-MM-dd")
      : undefined;
    endDate = dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined;
  }

  // Order pagination & filters
  const [ordersPage, setOrdersPage] = useState(1);
  const ORDERS_PAGE_SIZE = 10;
  const [ordersStatus, setOrdersStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setOrdersPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Reset page when status changes
  useEffect(() => {
    setOrdersPage(1);
  }, [ordersStatus, activeTab]);

  // Only send date filters to stats when explicitly set via date range picker
  const statsStartDate =
    activeTab === "all" && dateRange?.from
      ? format(dateRange.from, "yyyy-MM-dd")
      : undefined;
  const statsEndDate =
    activeTab === "all" && dateRange?.to
      ? format(dateRange.to, "yyyy-MM-dd")
      : undefined;

  // Fetch package stats
  const {
    data: packageData,
    isLoading: isPackageLoading,
    isError: isPackageError,
    error: packageError,
    refetch: refetchPackages,
  } = useRiderPackageStats(
    statsStartDate,
    statsEndDate,
    activeTab !== "commission",
  );

  // Fetch commission stats
  const {
    data: commissionData,
    isLoading: isCommissionLoading,
    isError: isCommissionError,
    error: commissionError,
    refetch: refetchCommission,
  } = useRiderCommissionStats(
    statsStartDate,
    statsEndDate,
    activeTab === "commission",
  );

  // Fetch orders
  const statusParam = ordersStatus === "all" ? undefined : ordersStatus;
  const isAllTab = activeTab === "all";
  const isTodayTab = activeTab === "today";

  // Today's orders query (rider-specific)
  const {
    data: todayOrdersData,
    isLoading: isTodayOrdersLoading,
    isFetching: isTodayOrdersFetching,
    isError: isTodayOrdersError,
    error: todayOrdersError,
    refetch: refetchTodayOrders,
  } = useRiderOrders(
    ordersPage,
    ORDERS_PAGE_SIZE,
    undefined,
    undefined,
    undefined,
    undefined,
    isTodayTab,
  );

  // All orders query (system-wide)
  const {
    data: allOrdersData,
    isLoading: isAllOrdersLoading,
    isFetching: isAllOrdersFetching,
    isError: isAllOrdersError,
    error: allOrdersError,
    refetch: refetchAllOrders,
  } = useAllOrders(
    ordersPage,
    ORDERS_PAGE_SIZE,
    startDate,
    endDate,
    statusParam,
    debouncedSearch,
    isAllTab,
  );

  const ordersData = isAllTab ? allOrdersData : todayOrdersData;
  const isOrdersLoading = isAllTab ? isAllOrdersLoading : isTodayOrdersLoading;
  const isOrdersFetching = isAllTab
    ? isAllOrdersFetching
    : isTodayOrdersFetching;
  const isOrdersError = isAllTab ? isAllOrdersError : isTodayOrdersError;
  const ordersError = isAllTab ? allOrdersError : todayOrdersError;
  const refetchOrders = isAllTab ? refetchAllOrders : refetchTodayOrders;

  // Fetch payment history
  const [paymentsPage, setPaymentsPage] = useState(1);
  const PAYMENTS_PAGE_SIZE = 10;

  const {
    data: paymentsData,
    isLoading: isPaymentsLoading,
    isError: isPaymentsError,
    error: paymentsError,
    refetch: refetchPayments,
  } = useRiderCommissionPayments(
    paymentsPage,
    PAYMENTS_PAGE_SIZE,
    activeTab === "commission",
  );

  // Payout dialog

  // Verify order modal
  const [verifyingOrder, setVerifyingOrder] = useState<Order | null>(null);
  const [deliveryLocationType, setDeliveryLocationType] = useState<string>("");
  const [assigningTrackingNum, setAssigningTrackingNum] = useState<
    string | null
  >(null);
  const { mutate: verifyOrder, isPending: isVerifying } = useVerifyRiderOrder();
  const { mutate: assignRiderMutate } = useAssignRider();

  const handleSelfAssign = (trackingNumber: string) => {
    if (!user?.user_id) {
      toast.error("User not found");
      return;
    }
    setAssigningTrackingNum(trackingNumber);
    assignRiderMutate(
      {
        order_ids: [trackingNumber],
        rider_id: user.user_id,
      },
      {
        onSuccess: () => {
          toast.success("Order self-assigned successfully");
          setAssigningTrackingNum(null);
        },
        onError: (err: any) => {
          toast.error(err?.message || "Failed to assign order");
          setAssigningTrackingNum(null);
        },
      },
    );
  };

  // Helper functions
  const capitalize = (s: string) =>
    s ? s.replace(/\b\w/g, (c) => c.toUpperCase()) : "";

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied: ${text}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ORDER_PLACED":
        return (
          <Badge
            variant="outline"
            className="bg-amber-50/50 text-amber-700 border-amber-200 font-medium"
          >
            Placed
          </Badge>
        );
      case "ORDER_DISPATCHED":
        return (
          <Badge
            variant="outline"
            className="bg-blue-50/50 text-blue-700 border-blue-200 font-medium"
          >
            Dispatched
          </Badge>
        );
      case "OUT_FOR_DELIVERY":
        return (
          <Badge
            variant="outline"
            className="bg-indigo-50/50 text-indigo-700 border-indigo-200 font-medium"
          >
            Out for delivery
          </Badge>
        );
      case "RESCHEDULED":
        return (
          <Badge
            variant="outline"
            className="bg-purple-50/50 text-purple-700 border-purple-200 font-medium"
          >
            Rescheduled
          </Badge>
        );
      case "ON_HOLD":
        return (
          <Badge
            variant="outline"
            className="bg-slate-100 text-slate-700 border-slate-200 font-medium"
          >
            On hold
          </Badge>
        );
      case "IN_TRANSIT":
        return (
          <Badge
            variant="outline"
            className="bg-slate-50 text-slate-700 border-slate-200 font-medium"
          >
            In transit
          </Badge>
        );
      case "DELIVERED":
        return (
          <Badge
            variant="outline"
            className="bg-emerald-50/50 text-emerald-700 border-emerald-200 font-medium"
          >
            Delivered
          </Badge>
        );
      case "CANCELLED":
        return (
          <Badge
            variant="outline"
            className="bg-rose-50/50 text-rose-700 border-rose-200 font-medium"
          >
            Cancelled
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="font-medium">
            {capitalize(status.replace(/_/g, " "))}
          </Badge>
        );
    }
  };

  const displayName = capitalize(
    user?.first_name ? `${user.first_name} ${user.last_name || ""}` : "Rider",
  );

  const totalPages = ordersData?.count
    ? Math.ceil(ordersData.count / ORDERS_PAGE_SIZE)
    : 0;
  const hasNext = !!ordersData?.next;
  const hasPrev = !!ordersData?.previous;

  // Handle retry
  const handleRetry = () => {
    refetchPackages();
    refetchCommission();
    refetchOrders();
    refetchPayments();
  };

  const isLoading = isPackageLoading || isCommissionLoading || isOrdersLoading;

  return (
    <div className="flex flex-col gap-6 w-full max-w-screen-xl mx-auto pb-20 p-4 md:p-6 lg:p-8 bg-gray-50/30 min-h-screen">
      {/* Header */}
      <div className="flex flex-col gap-1 md:flex-row md:justify-between md:items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Welcome back, {displayName}
          </h1>
          <p className="text-xs text-gray-500 font-normal">
            Manage and track your delivery assignments here.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 border-b border-gray-200 overflow-x-auto scrollbar-none whitespace-nowrap -mx-4 px-4 sm:mx-0 sm:px-0">
        <button
          onClick={() => {
            handleTabChange("all");
            setOrdersPage(1);
            setPaymentsPage(1);
            refetchAllOrders();
            refetchPackages();
          }}
          className={`pb-2 px-1 border-b-2 font-medium text-sm transition-colors focus:outline-none cursor-pointer ${
            activeTab === "all"
              ? "border-black text-black font-bold"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          All Orders
        </button>
        <button
          onClick={() => {
            handleTabChange("today");
            setOrdersPage(1);
            setPaymentsPage(1);
            refetchTodayOrders();
            refetchPackages();
          }}
          className={`pb-2 px-1 border-b-2 font-medium text-sm transition-colors focus:outline-none cursor-pointer ${
            activeTab === "today"
              ? "border-black text-black font-bold"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Today's Orders
        </button>
        <button
          onClick={() => {
            handleTabChange("commission");
            setOrdersPage(1);
            setPaymentsPage(1);
            refetchCommission();
            refetchPayments();
          }}
          className={`pb-2 px-1 border-b-2 font-medium text-sm transition-colors focus:outline-none cursor-pointer ${
            activeTab === "commission"
              ? "border-black text-black font-bold"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Commission Tracking
        </button>
      </div>

      {/* Commission Tracking Tab */}
      {activeTab === "commission" && (
        <div className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">
              Financial Performance
            </h2>
            <RiderCommissionStats
              data={commissionData}
              isLoading={isCommissionLoading}
              isError={isCommissionError}
              error={commissionError}
              onRetry={refetchCommission}
            />
          </div>

          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <h2 className="text-lg font-bold text-gray-900">
                Paid Commission History
              </h2>
            </div>

            <RiderPaymentHistory
              data={paymentsData}
              isLoading={isPaymentsLoading}
              isError={isPaymentsError}
              error={paymentsError}
              page={paymentsPage}
              pageSize={PAYMENTS_PAGE_SIZE}
              onPageChange={setPaymentsPage}
              onRetry={refetchPayments}
            />
          </div>
        </div>
      )}

      {/* Today's Orders / All Orders Tab */}
      {(activeTab === "today" || activeTab === "all") && (
        <div className="space-y-6">
          {activeTab === "today" && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">
                Delivery Performance
              </h2>
              <RiderPackageStats
                data={packageData}
                isLoading={isPackageLoading}
                isError={isPackageError}
                error={packageError}
                onRetry={refetchPackages}
              />
            </div>
          )}

          {/* All Orders filter bar */}
          {activeTab === "all" && (
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border border-gray-200 rounded-lg bg-gray-50/50">
              <div className="text-sm font-medium text-gray-700">
                Filter Orders
              </div>
              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full md:w-auto">
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <DateRangePicker
                    value={dateRange}
                    onChange={setDateRange}
                    className="flex-1 w-full"
                  />
                  {dateRange?.from && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setDateRange(undefined);
                        setOrdersPage(1);
                      }}
                      className="h-10 text-gray-600 border-gray-200 hover:bg-gray-50 shrink-0"
                    >
                      Clear
                    </Button>
                  )}
                </div>

                <div className="relative w-full md:w-48">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search orders..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-md bg-white focus:bg-white focus:outline-none focus:border-gray-400 transition-all text-gray-800 font-light h-10"
                  />
                </div>

                <div className="relative w-full md:w-48">
                  <select
                    value={ordersStatus}
                    onChange={(e) => setOrdersStatus(e.target.value)}
                    className="w-full h-10 pl-3 pr-10 border border-gray-200 rounded-md bg-white text-sm font-medium text-gray-700 focus:outline-none focus:border-black cursor-pointer appearance-none"
                  >
                    <option value="all">All Orders</option>
                    <option value="ORDER_DISPATCHED">Dispatched</option>
                    <option value="OUT_FOR_DELIVERY">Out For Delivery</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="RESCHEDULED">Rescheduled</option>
                    <option value="ON_HOLD">On Hold</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          )}

          {/* Orders List */}
          <div className="space-y-4 pt-4">
            <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">
              All Orders
            </h2>

            {isOrdersLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((n) => (
                  <Skeleton key={n} className="h-48 rounded-lg" />
                ))}
              </div>
            ) : isOrdersError ? (
              <div className="p-8 border border-red-200 rounded-lg bg-red-50/20 text-center">
                <p className="text-sm text-red-600">
                  Failed to load orders: {ordersError?.message}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetchOrders()}
                  className="mt-2"
                >
                  Retry
                </Button>
              </div>
            ) : !ordersData?.results || ordersData.results.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-150 p-10 text-center flex flex-col items-center justify-center min-h-[200px] shadow-3xs">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3 border border-gray-100">
                  <Package className="w-6 h-6 text-gray-300" />
                </div>
                <h3 className="text-sm font-semibold text-gray-800">
                  No orders found
                </h3>
                <p className="text-xs text-gray-500 mt-1 max-w-xs">
                  {searchQuery
                    ? "No orders match your search criteria."
                    : "You have no orders."}
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <AnimatePresence>
                    {ordersData.results.map((order, idx) => (
                      <motion.div
                        key={order.tracking_number}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.2, delay: idx * 0.03 }}
                        className="bg-white rounded-lg border border-gray-150 shadow-2xs hover:shadow-xs transition-all overflow-hidden flex flex-col justify-between"
                      >
                        {/* Card Header */}
                        <div className="p-3.5 border-b border-gray-100 flex items-center justify-between bg-gray-50/20">
                          <div className="flex items-center gap-1">
                            <Link
                              href={`/track-order/${order.tracking_number}`}
                            >
                              <span className="font-bold text-gray-900 text-xs cursor-pointer hover:text-primary transition-colors">
                                {order.tracking_number}
                              </span>
                            </Link>
                            <button
                              onClick={() => handleCopy(order.tracking_number)}
                              className="p-1 hover:bg-gray-100 rounded-sm text-gray-400 hover:text-gray-600 transition-colors"
                              title="Copy tracking number"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {order.is_rider_verified &&
                              order.delivery_location_type && (
                                <Badge
                                  variant="outline"
                                  className="bg-emerald-50/50 text-emerald-700 border-emerald-200 text-[9px] font-medium gap-0.5"
                                >
                                  <Check className="w-2.5 h-2.5" />
                                  {order.delivery_location_type}
                                </Badge>
                              )}
                            {!order.is_rider_verified && (
                              <Badge
                                variant="outline"
                                className="bg-amber-50 text-amber-600 border-amber-200 text-[9px] font-medium"
                              >
                                Unverified
                              </Badge>
                            )}
                            {getStatusBadge(order.status)}
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-3.5 flex flex-col gap-3">
                          <div className="flex gap-2 items-start">
                            <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <p className="text-[9px] font-semibold text-gray-400 uppercase">
                                Recipient details
                              </p>
                              <p className="text-xs font-semibold text-gray-800 mt-0.5">
                                {capitalize(order.recipient_name)}
                              </p>
                              <p className="text-[11px] text-gray-500 font-normal mt-0.5 leading-snug">
                                {order.recipient_address},{" "}
                                {order.recipient_city}
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-2 items-start">
                            <User className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-[9px] font-semibold text-gray-400 uppercase">
                                  Client (vendor)
                                </p>
                                {order.sender_phone && (
                                  <a
                                    href={`tel:${order.sender_phone}`}
                                    className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 hover:text-emerald-700 hover:underline transition-colors cursor-pointer"
                                    title={`Call ${order.sender_name}`}
                                  >
                                    <Phone className="w-2.5 h-2.5" />
                                    <span>Call Vendor</span>
                                  </a>
                                )}
                              </div>
                              <p className="text-xs text-gray-700 font-medium mt-0.5">
                                {order.project_client}{" "}
                                <span className="text-[10px] font-light text-gray-400">
                                  ({order.sender_name})
                                </span>
                              </p>
                            </div>
                          </div>

                          {order.product && order.product.length > 0 && (
                            <div className="flex gap-2 items-start bg-gray-50/50 p-2 rounded-md border border-gray-100">
                              <ShoppingBag className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                              <div className="flex-1 min-w-0">
                                <p className="text-[9px] font-semibold text-gray-400 uppercase">
                                  Product description
                                </p>
                                <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-0.5">
                                  {(typeof order.product === "string"
                                    ? order.product.split(",").map((item) => {
                                        const [name, quantity] =
                                          item.split("-");
                                        return {
                                          name,
                                          quantity: parseInt(quantity) || 1,
                                        };
                                      })
                                    : order.product
                                  ).map((p, pIdx) => (
                                    <span
                                      key={pIdx}
                                      className="text-xs font-medium text-gray-600"
                                    >
                                      {p.name}{" "}
                                      <span className="text-[#e8611a] font-bold">
                                        x {p.quantity}
                                      </span>
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}

                          <Separator className="bg-gray-100" />

                          <div className="flex items-center justify-between bg-gray-50/10 p-1 rounded">
                            <div>
                              <p className="text-[9px] font-semibold text-gray-400 uppercase">
                                Payment method
                              </p>
                              <span
                                className={`inline-block text-[9px] font-semibold px-1.5 py-0.25 mt-0.5 rounded-sm uppercase ${
                                  order.payment_type === "COD"
                                    ? "bg-amber-50/50 text-amber-700 border border-amber-100"
                                    : "bg-emerald-50/30 text-emerald-700 border border-emerald-100"
                                }`}
                              >
                                {order.payment_type}
                              </span>
                            </div>
                            <div className="text-right">
                              <p className="text-[9px] font-semibold text-gray-400 uppercase">
                                Collection amount
                              </p>
                              <span className="text-xs font-bold text-gray-900 mt-0.5 block">
                                Rs.{" "}
                                {parseFloat(order.cod_amount).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Card Footer Actions */}
                        {order.assigned_rider !== Number(user?.user_id) ? (
                          <div className="p-2.5 bg-gray-50/30 border-t border-gray-100 flex gap-2">
                            <button
                              onClick={() =>
                                handleSelfAssign(order.tracking_number)
                              }
                              disabled={assigningTrackingNum !== null}
                              className="flex-1 flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:bg-gray-300 text-white font-medium text-xs py-1.5 px-3 rounded-md shadow-2xs transition-colors cursor-pointer font-semibold"
                            >
                              {assigningTrackingNum ===
                              order.tracking_number ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <UserCheck className="w-3.5 h-3.5" />
                              )}
                              <span>Self Assign</span>
                            </button>
                          </div>
                        ) : !order.is_rider_verified ? (
                          <div className="p-2.5 bg-gray-50/30 border-t border-gray-100 flex gap-2">
                            <button
                              onClick={() => {
                                setVerifyingOrder(order);
                                setDeliveryLocationType("");
                              }}
                              className="flex-1 flex items-center justify-center gap-1.5 bg-[#e8611a] hover:bg-[#d05519] active:bg-[#bf4d17] text-white font-medium text-xs py-1.5 px-3 rounded-md shadow-2xs transition-colors cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Verify Order</span>
                            </button>
                          </div>
                        ) : (
                          <>
                            {order.status !== "DELIVERED" &&
                              order.status !== "CANCELLED" && (
                                <StatusUpdateForm order={order} />
                              )}
                            <div className="p-2.5 bg-gray-50/30 border-t border-gray-100 flex gap-2">
                              {order.status !== "DELIVERED" &&
                              order.status !== "CANCELLED" ? (
                                <>
                                  {order.recipient_phone && (
                                    <a
                                      href={`tel:${order.recipient_phone}`}
                                      className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-medium text-xs py-1.5 px-3 rounded-md shadow-2xs transition-colors cursor-pointer"
                                    >
                                      <Phone className="w-3 h-3" />
                                      <span className="max-[370px]:hidden">
                                        Call
                                      </span>
                                    </a>
                                  )}

                                  <a
                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                      `${order.recipient_address}, ${order.recipient_city}`,
                                    )}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex-1 flex items-center justify-center gap-1.5 bg-slate-700 hover:bg-slate-800 active:bg-slate-900 text-white font-medium text-xs py-1.5 px-3 rounded-md shadow-2xs transition-colors cursor-pointer"
                                  >
                                    <Navigation className="w-3 h-3" />
                                    <span className="max-[370px]:hidden">
                                      Navigate
                                    </span>
                                  </a>

                                  <Link
                                    href={`/track-order/${order.tracking_number}`}
                                    className="p-1.5 border border-gray-200 hover:bg-gray-50 rounded-md text-gray-500 transition-all cursor-pointer flex items-center justify-center"
                                    title="View details"
                                  >
                                    <ChevronRight className="w-3.5 h-3.5" />
                                  </Link>
                                </>
                              ) : (
                                <Link
                                  href={`/track-order/${order.tracking_number}`}
                                  className="flex-1 flex items-center justify-center gap-1.5 border border-gray-200 hover:bg-gray-50 text-gray-500 font-medium text-xs py-1.5 px-3 rounded-md transition-colors cursor-pointer"
                                >
                                  <span>View Details</span>
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </Link>
                              )}
                            </div>
                          </>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 mt-2 bg-white border border-gray-150 rounded-lg px-3.5 py-2.5 shadow-3xs">
                    <p className="text-[11px] sm:text-[10px] text-gray-500 font-medium text-center sm:text-left">
                      Showing page{" "}
                      <span className="font-bold text-gray-700">
                        {ordersPage}
                      </span>{" "}
                      of{" "}
                      <span className="font-bold text-gray-700">
                        {totalPages}
                      </span>
                      <span className="ml-1.5 text-gray-400">
                        ({ordersData?.count || 0} total)
                      </span>
                    </p>
                    <div className="flex items-center justify-center gap-2 w-full sm:w-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 sm:h-7 px-3 sm:px-2.5 text-xs flex-1 sm:flex-initial"
                        disabled={
                          !hasPrev || isOrdersLoading || isOrdersFetching
                        }
                        onClick={() => setOrdersPage((p) => Math.max(1, p - 1))}
                      >
                        <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                        Prev
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 sm:h-7 px-3 sm:px-2.5 text-xs flex-1 sm:flex-initial"
                        disabled={
                          !hasNext || isOrdersLoading || isOrdersFetching
                        }
                        onClick={() => setOrdersPage((p) => p + 1)}
                      >
                        Next
                        <ChevronRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Verify Order Modal */}
      <AnimatePresence>
        {verifyingOrder && (
          <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setVerifyingOrder(null);
                setDeliveryLocationType("");
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden"
            >
              <div className="px-4 py-3.5 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Verify delivery
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {verifyingOrder.tracking_number}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setVerifyingOrder(null);
                    setDeliveryLocationType("");
                  }}
                  className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="px-4 py-4 space-y-3">
                <p className="text-xs text-gray-500">
                  Select the delivery location type to verify this order.
                </p>

                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { value: "Inside Ringroad", label: "Inside Ringroad" },
                    { value: "Outside Ringroad", label: "Outside Ringroad" },
                  ].map((option) => {
                    const isSelected = deliveryLocationType === option.value;
                    return (
                      <button
                        key={option.value}
                        onClick={() => setDeliveryLocationType(option.value)}
                        className={`flex flex-col items-center gap-1.5 p-3.5 rounded-lg border-2 text-xs font-medium transition-all cursor-pointer ${
                          isSelected
                            ? "border-[#e8611a] bg-orange-50 text-[#e8611a]"
                            : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <MapPin
                          className={`w-4 h-4 ${
                            isSelected ? "text-[#e8611a]" : "text-gray-400"
                          }`}
                        />
                        <span className="text-center leading-snug">
                          {option.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="px-4 py-3 border-t border-gray-100 flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setVerifyingOrder(null);
                    setDeliveryLocationType("");
                  }}
                  className="text-xs h-8"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  disabled={!deliveryLocationType || isVerifying}
                  onClick={() => {
                    if (!deliveryLocationType || !verifyingOrder) return;
                    verifyOrder(
                      {
                        trackingNumber: verifyingOrder.tracking_number,
                        deliveryLocationType,
                      },
                      {
                        onSuccess: () => {
                          toast.success("Order verified successfully");
                          setVerifyingOrder(null);
                          setDeliveryLocationType("");
                          refetchOrders();
                        },
                        onError: () =>
                          toast.error("Failed to verify. Try again."),
                      },
                    );
                  }}
                  className="h-8 text-xs bg-[#e8611a] hover:bg-[#d05519] text-white"
                >
                  {isVerifying ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                  ) : null}
                  Confirm
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
