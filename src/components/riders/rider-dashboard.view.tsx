"use client";

import { useAuth } from "@/src/lib/auth-context";
import {
  Package,
  MapPin,
  Phone,
  Navigation,
  Search,
  Copy,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  X,
  User,
  ShoppingBag,
  Loader2,
  CheckCircle2,
  Check,
} from "lucide-react";
import { useState, useEffect } from "react";
import {
  useRiderOrders,
  useUpdateRiderOrderStatus,
  useVerifyRiderOrder,
} from "@/src/components/orders/orders.queries";
import { Order } from "@/src/services/orders";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { RiderDetailDashboardView } from "./rider-detail-dashboard.view";

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
                  // Simple confirmation for Delivered status
                  <p className="text-xs text-gray-500">
                    Are you sure you want to mark this order as{" "}
                    <span className="font-semibold text-gray-700">
                      Delivered
                    </span>
                    ?
                  </p>
                ) : (
                  // Comment input for other statuses
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
                          // Only include comment if it's NOT delivered
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

export function RiderDashboardView({ riderId }: { riderId?: string }) {
  if (riderId) {
    return <RiderDetailDashboardView riderId={riderId} />;
  }
  return <SelfRiderDashboardView />;
}

function SelfRiderDashboardView() {
  const { user } = useAuth();

  // 1. States for search, filtering, pagination, detail view modal & status update
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeTab, setActiveTab] = useState<
    | "all"
    | "ORDER_DISPATCHED"
    | "OUT_FOR_DELIVERY"
    | "RESCHEDULED"
    | "DELIVERED"
    | "CANCELLED"
    | "ON_HOLD"
  >("all");

  const [verifyingOrder, setVerifyingOrder] = useState<Order | null>(null);
  const [deliveryLocationType, setDeliveryLocationType] = useState<string>("");

  const { mutate: verifyOrder, isPending: isVerifying } = useVerifyRiderOrder();

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 400);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  // Tab IDs now directly match backend status strings, so no mapping needed
  const statusParam = activeTab === "all" ? "" : activeTab;

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    const element = document.getElementById("rider-orders-list");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const {
    data: riderOrdersData,
    isLoading,
    isFetching,
    error,
  } = useRiderOrders(page, PAGE_SIZE, debouncedSearch, statusParam, true);

  // Pagination metadata from API
  const totalCount = riderOrdersData?.count ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const hasNext = !!riderOrdersData?.next;
  const hasPrev = !!riderOrdersData?.previous;

  // Orders for this page
  const rawOrders = riderOrdersData?.results || [];

  // Helper to copy text to clipboard
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied: ${text}`);
  };

  // Helper to capitalize names
  const capitalize = (s: string) =>
    s ? s.replace(/\b\w/g, (c) => c.toUpperCase()) : "";

  const filteredOrders = rawOrders;

  // Display name helper
  const displayName = capitalize(
        user?.first_name
          ? `${user.first_name} ${user.last_name || ""}`
          : "Rider",
      );

  // Status Badge Helper (Toned down, clean & nice)
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ORDER_PLACED":
        return (
          <Badge
            variant="outline"
            className="bg-amber-50/50 text-amber-700 border-amber-200 text-[9px] font-medium whitespace-nowrap"
          >
            Placed
          </Badge>
        );
      case "ORDER_DISPATCHED":
        return (
          <Badge
            variant="outline"
            className="bg-blue-50/50 text-blue-700 border-blue-200 text-[9px] font-medium whitespace-nowrap"
          >
            Dispatched
          </Badge>
        );
      case "OUT_FOR_DELIVERY":
        return (
          <Badge
            variant="outline"
            className="bg-indigo-50/50 text-indigo-700 border-indigo-200 text-[9px] font-medium whitespace-nowrap"
          >
            Out for delivery
          </Badge>
        );
      case "RESCHEDULED":
        return (
          <Badge
            variant="outline"
            className="bg-purple-50/50 text-purple-700 border-purple-200 text-[9px] font-medium whitespace-nowrap"
          >
            Rescheduled
          </Badge>
        );
      case "ON_HOLD":
        return (
          <Badge
            variant="outline"
            className="bg-slate-100 text-slate-700 border-slate-200 text-[9px] font-medium whitespace-nowrap"
          >
            On hold
          </Badge>
        );
      case "IN_TRANSIT":
        return (
          <Badge
            variant="outline"
            className="bg-slate-50 text-slate-700 border-slate-200 text-[9px] font-medium whitespace-nowrap"
          >
            In transit
          </Badge>
        );
      case "DELIVERED":
        return (
          <Badge
            variant="outline"
            className="bg-emerald-50/50 text-emerald-700 border-emerald-200 text-[9px] font-medium whitespace-nowrap"
          >
            Delivered
          </Badge>
        );
      case "CANCELLED":
        return (
          <Badge
            variant="outline"
            className="bg-rose-50/50 text-rose-700 border-rose-200 text-[9px] font-medium whitespace-nowrap"
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

      {/* Main Order View Container */}
      <div id="rider-orders-list" className="flex flex-col gap-4 mt-1">
        {/* Search & Tab bar */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center justify-between bg-white border border-gray-150 rounded-lg p-2.5 shadow-3xs">
          {/* Navigation tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {[
              {
                id: "all",
                label: "All",
              },
              {
                id: "ORDER_DISPATCHED",
                label: "Dispatched",

                color: "text-blue-700 bg-blue-50 border-blue-100",
              },
              {
                id: "OUT_FOR_DELIVERY",
                label: "Out for delivery",

                color: "text-indigo-700 bg-indigo-50 border-indigo-100",
              },
              {
                id: "RESCHEDULED",
                label: "Rescheduled",

                color: "text-purple-700 bg-purple-50 border-purple-100",
              },
              {
                id: "ON_HOLD",
                label: "On hold",

                color: "text-slate-600 bg-slate-100 border-slate-200",
              },
              {
                id: "DELIVERED",
                label: "Delivered",

                color: "text-emerald-700 bg-emerald-50/50 border-emerald-100",
              },
              {
                id: "CANCELLED",
                label: "Cancelled",

                color: "text-rose-700 bg-rose-50/50 border-rose-100",
              },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as typeof activeTab);
                    setPage(1);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? "bg-gray-800 text-white border-gray-800 shadow-2xs"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search box */}
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search code, name, address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-md bg-gray-50/50 focus:bg-white focus:outline-none focus:border-gray-400 transition-all text-gray-800 font-light"
            />
          </div>
        </div>

        {/* Loading and Error states */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="bg-white rounded-lg border border-gray-150 p-4.5 space-y-4 animate-pulse"
              >
                <div className="flex justify-between items-center">
                  <div className="h-3.5 bg-gray-100 rounded-sm w-20" />
                  <div className="h-5 bg-gray-100 rounded-full w-14" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-100 rounded-sm w-3/4" />
                  <div className="h-3 bg-gray-100 rounded-sm w-1/2" />
                </div>
                <div className="h-px bg-gray-100" />
                <div className="flex justify-between">
                  <div className="h-3 bg-gray-100 rounded-sm w-1/4" />
                  <div className="h-6 bg-gray-100 rounded-md w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50/50 border border-red-150 text-red-800 rounded-lg p-6 flex flex-col items-center gap-3 text-center max-w-sm mx-auto my-10">
            <AlertCircle className="w-10 h-10 text-red-500" />
            <div>
              <h3 className="font-semibold text-sm">Failed to load orders</h3>
              <p className="text-xs text-red-600/70 mt-0.5">
                Please check your connection and try again.
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => window.location.reload()}
              className="mt-1 h-8 text-xs"
            >
              Retry Connection
            </Button>
          </div>
        ) : filteredOrders.length === 0 ? (
          // Empty State
          <div className="bg-white rounded-lg border border-gray-150 p-10 text-center flex flex-col items-center justify-center min-h-[300px] shadow-3xs">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3 border border-gray-100">
              <Package className="w-6 h-6 text-gray-300" />
            </div>
            <h3 className="text-sm font-semibold text-gray-800">
              No assignments found
            </h3>
            <p className="text-xs text-gray-500 mt-1 max-w-xs">
              {searchQuery
                ? "No orders match your search keyword. Try refining your spelling or numbers."
                : "Currently there are no delivery orders assigned to this category."}
            </p>
            {searchQuery && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchQuery("")}
                className="mt-3 h-8 text-xs"
              >
                Clear Search
              </Button>
            )}
          </div>
        ) : (
          // Card List (Responsive, Clean, no tracking-wide)
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence>
              {filteredOrders.map((order, idx) => {
                const isCod = order.payment_type === "COD";
                return (
                  <motion.div
                    key={order.tracking_number}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.2, delay: idx * 0.03 }}
                    className="bg-white rounded-lg border border-gray-150 shadow-2xs hover:shadow-xs transition-all overflow-hidden flex flex-col justify-between"
                  >
                    {/* Card Header */}
                    <div className="p-3.5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-2 bg-gray-50/20">
                      <div className="flex items-center gap-1 shrink-0">
                        <Link href={`/track-order/${order.tracking_number}`}>
                          <span className="font-bold text-gray-900 text-xs cursor-pointer hover:text-primary transition-colors whitespace-nowrap">
                            {order.tracking_number}
                          </span>
                        </Link>
                        <button
                          onClick={() => handleCopy(order.tracking_number)}
                          className="p-1 hover:bg-gray-100 rounded-sm text-gray-400 hover:text-gray-600 transition-colors shrink-0"
                          title="Copy tracking number"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap shrink-0">
                        {order.is_rider_verified &&
                          order.delivery_location_type && (
                            <Badge
                              variant="outline"
                              className="bg-emerald-50/50 text-emerald-700 border-emerald-200 text-[9px] font-medium gap-0.5 whitespace-nowrap"
                            >
                              <Check className="w-2.5 h-2.5" />
                              {order.delivery_location_type}
                            </Badge>
                          )}
                        {!order.is_rider_verified && (
                          <Badge
                            variant="outline"
                            className="bg-amber-50 text-amber-600 border-amber-200 text-[9px] font-medium whitespace-nowrap"
                          >
                            Unverified
                          </Badge>
                        )}
                        {getStatusBadge(order.status)}
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-3.5 flex flex-col gap-3">
                      {/* Customer Address Row */}
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
                            {order.recipient_address}, {order.recipient_city}
                          </p>
                        </div>
                      </div>

                      {/* Merchant Row */}
                      <div className="flex gap-2 items-start">
                        <User className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[9px] font-semibold text-gray-400 uppercase">
                            Client (vendor)
                          </p>
                          <p className="text-xs text-gray-700 font-medium mt-0.5">
                            {order.project_client}{" "}
                            <span className="text-[10px] font-light text-gray-400">
                              ({order.sender_name})
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Products Listing inside Card */}
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
                                    const [name, quantity] = item.split("-");
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

                      {/* Finance & COD detail */}
                      <div className="flex items-center justify-between bg-gray-50/10 p-1 rounded">
                        <div>
                          <p className="text-[9px] font-semibold text-gray-400 uppercase">
                            Payment method
                          </p>
                          <span
                            className={`inline-block text-[9px] font-semibold px-1.5 py-0.25 mt-0.5 rounded-sm uppercase ${
                              isCod
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
                            Rs. {parseFloat(order.cod_amount).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer Actions */}
                    {!order.is_rider_verified ? (
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
                              {/* Call Customer Button */}
                              {order.recipient_phone && (
                                <a
                                  href={`tel:${order.recipient_phone}`}
                                  className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-medium text-xs py-1.5 px-3 rounded-md shadow-2xs transition-colors cursor-pointer"
                                >
                                  <Phone className="w-3 h-3" />
                                  <span>Call</span>
                                </a>
                              )}

                              {/* Navigate Button */}
                              <a
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                  `${order.recipient_address}, ${order.recipient_city}`,
                                )}`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex-1 flex items-center justify-center gap-1.5 bg-slate-700 hover:bg-slate-800 active:bg-slate-900 text-white font-medium text-xs py-1.5 px-3 rounded-md shadow-2xs transition-colors cursor-pointer"
                              >
                                <Navigation className="w-3 h-3" />
                                <span>Navigate</span>
                              </a>

                              {/* View Details */}
                              <a
                                href={`/track-order/${order.tracking_number}`}
                                className="p-1.5 border border-gray-200 hover:bg-gray-50 rounded-md text-gray-500 transition-all cursor-pointer flex items-center justify-center"
                                title="View details"
                              >
                                <ChevronRight className="w-3.5 h-3.5" />
                              </a>
                            </>
                          ) : (
                            /* Delivered / Cancelled — only show track link */
                            <a
                              href={`/track-order/${order.tracking_number}`}
                              className="flex-1 flex items-center justify-center gap-1.5 border border-gray-200 hover:bg-gray-50 text-gray-500 font-medium text-xs py-1.5 px-3 rounded-md transition-colors cursor-pointer"
                            >
                              <span>View Details</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Pagination — server-side paged */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 mt-2 bg-white border border-gray-150 rounded-lg px-3.5 py-2.5 shadow-3xs">
            <p className="text-[11px] sm:text-[10px] text-gray-500 font-medium text-center sm:text-left">
              Showing page{" "}
              <span className="font-bold text-gray-700">{page}</span> of{" "}
              <span className="font-bold text-gray-700">{totalPages}</span>
              <span className="ml-1.5 text-gray-400">({totalCount} total)</span>
            </p>
            <div className="flex items-center justify-center gap-2 w-full sm:w-auto">
              {isFetching && !isLoading && (
                <Loader2 className="w-3.5 h-3.5 text-gray-400 animate-spin" />
              )}
              <Button
                variant="outline"
                size="sm"
                className="h-8 sm:h-7 px-3 sm:px-2.5 text-xs flex-1 sm:flex-initial"
                disabled={!hasPrev}
                onClick={() => handlePageChange(Math.max(1, page - 1))}
              >
                <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 sm:h-7 px-3 sm:px-2.5 text-xs flex-1 sm:flex-initial"
                disabled={!hasNext}
                onClick={() => handlePageChange(page + 1)}
              >
                Next
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

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
              {/* Modal Header */}
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

              {/* Modal Body */}
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
                          className={`w-4 h-4 ${isSelected ? "text-[#e8611a]" : "text-gray-400"}`}
                        />
                        <span className="text-center leading-snug">
                          {option.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Modal Footer */}
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
