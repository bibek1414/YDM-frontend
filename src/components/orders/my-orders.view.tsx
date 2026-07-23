"use client";

import {
  FileText,
  Printer,
  Edit,
  Trash2,
  Eye,
  MessageSquare,
  SquareArrowRightExit,
  QrCode,
  Loader2,
  Search,
  CalendarIcon,
  X,
  Copy,
  Check,
  Motorbike,
  HelpCircle
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { type DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/src/lib/auth-context";
import {
  useRiders,
  useVendorOrders,
  useAssignRider,
  useOrderDetails,
  useUpdateOrderDetails,
  useDeleteOrder
} from "./orders.queries";
import { Order, exportOrders } from "@/src/services/orders";
import { type ColumnDef } from "@tanstack/react-table";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/ui/data-table";
import { usePostComment } from "./order-details/order-details.queries";
import { OrderDetailsView } from "./order-details/order-details.view";
import { useState, useMemo, useEffect } from "react";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

// ─── Comment Popover Body ─────────────────────────────────────────────────────

function CommentPopover({ trackingNumber, userId }: { trackingNumber: string; userId: string }) {
  const [comment, setComment] = useState("");
  const mutation = usePostComment();

  const handlePost = () => {
    if (!comment.trim()) return;
    mutation.mutate(
      { trackingNumber, comment, userId },
      {
        onSuccess: () => {
          setComment("");
          toast.success("Comment posted successfully");
        },
        onError: () => {
          toast.error("Failed to post comment. Please try again.");
        }
      }
    );
  };

  return (
    <div className="grid gap-3">
      <div className="text-sm font-medium text-gray-700">Add a Comment</div>
      <textarea
        className="w-full border border-gray-200 rounded p-2 text-xs focus:outline-none min-h-[80px] resize-none"
        placeholder="Type your message here..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        disabled={mutation.isPending}
      />
      <Button
        size="sm"
        className="w-full"
        onClick={handlePost}
        disabled={mutation.isPending || !comment.trim()}
      >
        {mutation.isPending ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          "Post Comment"
        )}
      </Button>
    </div>
  );
}

// ─── Static filter option data (defined outside component to avoid recreation) ─

const StatusChoices = [
  { label: "Order Placed", value: "ORDER_PLACED" },
  { label: "Order Verified", value: "ORDER_VERIFIED" },
  { label: "Received At Office", value: "RECEIVED_AT_OFFICE" },
  { label: "Ready for Dispatch", value: "READY_FOR_DISPATCH" },
  { label: "Order Dispatched", value: "ORDER_DISPATCHED" },
  { label: "Out For Delivery", value: "OUT_FOR_DELIVERY" },
  { label: "Rescheduled", value: "RESCHEDULED" },
  { label: "Delivered", value: "DELIVERED" },
  { label: "Cancelled", value: "CANCELLED" },
  { label: "Returning to Vendor", value: "RETURNING_TO_VENDOR" },
  { label: "Returned to Vendor", value: "RETURNED_TO_VENDOR" },
  { label: "On Hold", value: "ON_HOLD" },
];

const DeliveryLocationChoices = [
  { label: "Inside Ringroad", value: "Inside Ringroad" },
  { label: "Outside Ringroad", value: "Outside Ringroad" },
];

function getStatusBadgeClass(status: string) {
  switch (status) {
    case "ORDER_PLACED":
      return "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:text-blue-800";
    case "ORDER_VERIFIED":
      return "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 hover:text-indigo-800";
    case "RECEIVED_AT_OFFICE":
      return "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 hover:text-purple-800";
    case "READY_FOR_DISPATCH":
      return "bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100 hover:text-pink-800";
    case "ORDER_DISPATCHED":
      return "bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100 hover:text-sky-800";
    case "OUT_FOR_DELIVERY":
      return "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100 hover:text-orange-800";
    case "RESCHEDULED":
      return "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 hover:text-amber-800";
    case "DELIVERED":
      return "bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800";
    case "CANCELLED":
      return "bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:text-red-800";
    case "RETURNING_TO_VENDOR":
      return "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 hover:text-rose-800";
    case "RETURNED_TO_VENDOR":
      return "bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100 hover:text-stone-800";
    case "ON_HOLD":
      return "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100 hover:text-yellow-800";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:text-gray-800";
  }
}

// ─── FilterBar ────────────────────────────────────────────────────────────────
// Isolated component: draft state lives here so typing never re-renders the parent

type AppliedFilters = {
  search: string;
  status: string;
  deliveryLocation: string;
  dateRange: DateRange | undefined;
  isAssigned: string;
};

const AssignedChoices = [
  { label: "All Orders", value: "" },
  { label: "Assigned", value: "assigned" },
  { label: "Unassigned", value: "unassigned" },
];

const FilterBar = React.memo(function FilterBar({
  onFilter,
  onReset,
  appliedFilters,
  hideStatusFilter = false,
}: {
  onFilter: (filters: AppliedFilters) => void;
  onReset: () => void;
  appliedFilters: AppliedFilters;
  hideStatusFilter?: boolean;
}) {
  const [searchInput, setSearchInput] = useState("");
  const [draftStatus, setDraftStatus] = useState("");
  const [draftDeliveryLocation, setDraftDeliveryLocation] = useState("");
  const [draftDateRange, setDraftDateRange] = useState<DateRange | undefined>(undefined);
  const [draftIsAssigned, setDraftIsAssigned] = useState("");

  const { search: appliedSearch, status: appliedStatus, deliveryLocation: appliedDeliveryLocation, dateRange: appliedDateRange, isAssigned: appliedIsAssigned } = appliedFilters;
  const isFilterApplied = !!(appliedSearch || (!hideStatusFilter && appliedStatus) || appliedDeliveryLocation || appliedDateRange?.from || appliedIsAssigned);

  const isDraftDifferent =
    searchInput !== appliedSearch ||
    (!hideStatusFilter && draftStatus !== appliedStatus) ||
    draftDeliveryLocation !== appliedDeliveryLocation ||
    draftDateRange !== appliedDateRange ||
    draftIsAssigned !== appliedIsAssigned;

  const showClearAll = isFilterApplied && !isDraftDifferent;

  const isFirstMount = React.useRef(true);

  // Auto-apply dropdown and date filters immediately on change
  useEffect(() => {
    if (isFirstMount.current) {
      return;
    }
    onFilter({
      search: searchInput,
      status: draftStatus,
      deliveryLocation: draftDeliveryLocation,
      dateRange: draftDateRange,
      isAssigned: draftIsAssigned,
    });
  }, [draftStatus, draftDeliveryLocation, draftDateRange, draftIsAssigned, onFilter]);

  // Debounce search input to avoid API spam
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    const delayDebounce = setTimeout(() => {
      onFilter({
        search: searchInput,
        status: draftStatus,
        deliveryLocation: draftDeliveryLocation,
        dateRange: draftDateRange,
        isAssigned: draftIsAssigned,
      });
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchInput, onFilter]);

  const handleReset = () => {
    setSearchInput("");
    setDraftStatus("");
    setDraftDeliveryLocation("");
    setDraftDateRange(undefined);
    setDraftIsAssigned("");
    onReset();
  };

  return (
    <>
      <div className={cn("grid grid-cols-1 gap-4", hideStatusFilter ? "md:grid-cols-4" : "md:grid-cols-5")}>
        {/* Search */}
        <div className="relative flex flex-col gap-1.5">
          <label className="text-[11px] font-medium text-gray-500 bg-white px-1 -mb-3 z-10 w-fit ml-2 relative">
            Search
          </label>
          <div className={cn("flex items-center border rounded-xs transition-colors !h-10 bg-white", appliedSearch ? "border-orange-400" : "border-gray-200")}>
            <Search className="ml-3 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="eg. Tracking code, Name, Phone Number"
              className="w-full border-none rounded px-3 text-xs focus:outline-none bg-transparent h-full"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (searchInput.trim() === "") {
                    handleReset();
                  } else {
                    onFilter({
                      search: searchInput,
                      status: draftStatus,
                      deliveryLocation: draftDeliveryLocation,
                      dateRange: draftDateRange,
                      isAssigned: draftIsAssigned,
                    });
                  }
                }
              }}
            />
            {searchInput && (
              <button
                onClick={() => {
                  setSearchInput("");
                  onFilter({ search: "", status: draftStatus, deliveryLocation: draftDeliveryLocation, dateRange: draftDateRange, isAssigned: draftIsAssigned });
                }}
                className="mr-2 mt-0.5 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Status */}
        {!hideStatusFilter && (
          <div className="relative flex flex-col gap-1.5">
            <label className="text-[11px] font-medium text-gray-500 bg-white px-1 -mb-3 z-10 w-fit ml-2 relative">
              Select Status
            </label>
            <Select value={draftStatus} onValueChange={(value) => setDraftStatus(value || "")}>
              <SelectTrigger className={cn("w-full !h-10 rounded-xs px-3 text-xs text-gray-500 bg-white shadow-none focus:ring-0 transition-colors", appliedStatus ? "border-orange-400" : "border-gray-200")}>
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                {StatusChoices.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Delivery Location */}
        <div className="flex relative flex-col gap-1.5">
          <label className="text-[11px] font-medium text-gray-500 bg-white px-1 -mb-3 z-10 w-fit ml-2 relative">
            Select Delivery Location Type
          </label>
          <Select value={draftDeliveryLocation} onValueChange={(value) => setDraftDeliveryLocation(value || "")}>
            <SelectTrigger className={cn("w-full !h-10 rounded-xs px-3 text-xs text-gray-500 bg-white shadow-none focus:ring-0 transition-colors", appliedDeliveryLocation ? "border-orange-400" : "border-gray-200")}>
              <SelectValue placeholder="Select Delivery Location Type" />
            </SelectTrigger>
            <SelectContent>
              {DeliveryLocationChoices.map((deliveryChoice) => (
                <SelectItem key={deliveryChoice.value} value={deliveryChoice.value}>
                  {deliveryChoice.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Rider Assignment Status */}
        <div className="flex relative flex-col gap-1.5">
          <label className="text-[11px] font-medium text-gray-500 bg-white px-1 -mb-3 z-10 w-fit ml-2 relative">
            Select Rider Assignment
          </label>
          <Select value={draftIsAssigned} onValueChange={(value) => setDraftIsAssigned(value || "")}>
            <SelectTrigger className={cn("w-full !h-10 rounded-xs px-3 text-xs text-gray-500 bg-white shadow-none focus:ring-0 transition-colors", appliedIsAssigned ? "border-orange-400" : "border-gray-200")}>
              <SelectValue placeholder="Select Rider Assignment" />
            </SelectTrigger>
            <SelectContent>
              {AssignedChoices.map((assignedChoice) => (
                <SelectItem key={assignedChoice.value} value={assignedChoice.value}>
                  {assignedChoice.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date Range */}
        <div className="relative flex flex-col gap-1.5">
          <label className="text-[11px] font-medium text-gray-500 bg-white px-1 -mb-3 z-10 w-fit ml-2 relative">
            Select Date Range
          </label>
          <Popover>
            <PopoverTrigger
              id="date-picker-range"
              className={cn(buttonVariants({ variant: "outline", className: "justify-start px-2.5 font-normal !h-10 w-full rounded-xs text-xs text-gray-500 transition-colors hover:bg-white hover:text-gray-500" }), appliedDateRange?.from ? "border-orange-400" : "border-gray-200")}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {draftDateRange?.from ? (
                draftDateRange.to ? (
                  <>{format(draftDateRange.from, "LLL dd, y")} – {format(draftDateRange.to, "LLL dd, y")}</>
                ) : (
                  format(draftDateRange.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                defaultMonth={draftDateRange?.from}
                selected={draftDateRange}
                onSelect={setDraftDateRange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {showClearAll && (
        <div className="flex justify-start items-center mt-3">
          <Button
            variant="outline"
            size="default"
            onClick={handleReset}
            className="text-red-500 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
            Clear Filters
          </Button>
        </div>
      )}
    </>
  );
});

function TrackingCodeCell({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group w-full h-full flex items-center justify-center p-3">
      <div className="absolute w-full h-full inset-0 pointer-events-none">
        <div className="absolute group-hover:opacity-100 opacity-0 right-1 bottom-1 pointer-events-auto">
          <button
            onClick={handleCopy}
            className="p-1 bg-slate-200 hover:bg-slate-300 text-gray-400 hover:text-gray-500 rounded-xs transition-colors"
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          </button>
        </div>
      </div>
      <span className="text-[#d85860] text-xs font-medium whitespace-nowrap">
        {value}
      </span>
    </div>
  );
}

// ─── Edit Order Modal ─────────────────────────────────────────────────────────

const editOrderSchema = z.object({
  recipient_name: z.string().min(1, "Recipient name is required"),
  recipient_phone: z.string().min(1, "Phone is required"),
  recipient_email: z.string().email("Invalid email").or(z.literal("")),
  recipient_address: z.string().min(1, "Address is required"),
  recipient_city: z.string().min(1, "City is required"),
  recipient_district: z.string(),
  cod_amount: z.string(),
  payment_type: z.string(),
  special_instructions: z.string(),
  remarks: z.string(),
  assigned_rider: z.string().optional(),
});

type EditOrderFormValues = z.infer<typeof editOrderSchema>;

function EditOrderModal({
  trackingNumber,
  open,
  onClose,
}: {
  trackingNumber: string | null;
  open: boolean;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const { data: order, isLoading } = useOrderDetails(user?.user_id, trackingNumber ?? undefined);
  const { data: riders } = useRiders();
  const updateMutation = useUpdateOrderDetails();

  const { register, control, handleSubmit, reset, formState: { errors } } = useForm<EditOrderFormValues>({
    resolver: zodResolver(editOrderSchema as any),
    defaultValues: {
      recipient_name: "",
      recipient_phone: "",
      recipient_email: "",
      recipient_address: "",
      recipient_city: "",
      recipient_district: "",
      cod_amount: "",
      payment_type: "",
      special_instructions: "",
      remarks: "",
      assigned_rider: "",
    },
  });

  // Pre-fill form when order data arrives
  useEffect(() => {
    if (order) {
      reset({
        recipient_name: order.recipient_name ?? "",
        recipient_phone: order.recipient_phone ?? "",
        recipient_email: order.recipient_email ?? "",
        recipient_address: order.recipient_address ?? "",
        recipient_city: order.recipient_city ?? "",
        recipient_district: order.recipient_district ?? "",
        cod_amount: order.cod_amount ?? "",
        payment_type: order.payment_type ?? "",
        special_instructions: order.special_instructions ?? "",
        remarks: order.remarks ?? "",
        assigned_rider: order.assigned_rider?.toString() ?? "",
      });
    }
  }, [order, reset]);

  const onSubmit = (data: EditOrderFormValues) => {
    if (!trackingNumber) return;
    updateMutation.mutate(
      { trackingNumber, data },
      {
        onSuccess: () => {
          toast.success("Order updated successfully");
          onClose();
        },
        onError: () => {
          toast.error("Failed to update order. Please try again.");
        },
      }
    );
  };

  const inputCls = "border border-gray-200 rounded-xs px-2 py-1.5 text-xs focus:outline-none focus:border-gray-400 w-full";
  const textareaCls = `${inputCls} resize-none`;
  const labelCls = "text-[10px] text-gray-500";
  const errorCls = "text-[10px] text-red-500 mt-0.5";

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Order</DialogTitle>
          {trackingNumber && (
            <p className="text-[10px] text-gray-400 mt-0.5">Tracking: <span className="text-[#d85860] font-medium">{trackingNumber}</span></p>
          )}
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          </div>
        ) : (
          <form id="edit-order-form" onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-2">
            <div className="sm:col-span-2">
              <p className="text-[10px] font-medium text-gray-400 uppercase mb-2">Recipient Info</p>
            </div>

            <div className="flex flex-col gap-1">
              <label className={labelCls}>Recipient Name</label>
              <input {...register("recipient_name")} className={inputCls} />
              {errors.recipient_name && <p className={errorCls}>{errors.recipient_name.message}</p>}
            </div>

            <div className="flex flex-col gap-1">
              <label className={labelCls}>Recipient Phone</label>
              <input {...register("recipient_phone")} className={inputCls} />
              {errors.recipient_phone && <p className={errorCls}>{errors.recipient_phone.message}</p>}
            </div>

            <div className="flex flex-col gap-1">
              <label className={labelCls}>Recipient Email</label>
              <input type="email" {...register("recipient_email")} className={inputCls} />
              {errors.recipient_email && <p className={errorCls}>{errors.recipient_email.message}</p>}
            </div>

            <div className="flex flex-col gap-1">
              <label className={labelCls}>Recipient City</label>
              <input {...register("recipient_city")} className={inputCls} />
              {errors.recipient_city && <p className={errorCls}>{errors.recipient_city.message}</p>}
            </div>

            <div className="flex flex-col gap-1">
              <label className={labelCls}>Recipient District</label>
              <input {...register("recipient_district")} className={inputCls} />
            </div>

            <div className="flex flex-col gap-1">
              <label className={labelCls}>Recipient Address</label>
              <textarea rows={2} {...register("recipient_address")} className={textareaCls} />
              {errors.recipient_address && <p className={errorCls}>{errors.recipient_address.message}</p>}
            </div>

            <div className="sm:col-span-2 border-t border-gray-100 pt-3">
              <p className="text-[10px] font-medium text-gray-400 uppercase mb-2">Order Info</p>
            </div>

            <div className="flex flex-col gap-1">
              <label className={labelCls}>COD Amount</label>
              <input {...register("cod_amount")} className={inputCls} />
            </div>



            <div className="flex flex-col gap-1">
              <label className={labelCls}>Payment Type</label>
              <Controller
                control={control}
                name="payment_type"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="border border-gray-200 rounded-xs px-2 py-1.5 h-auto text-xs focus:outline-none focus:ring-0 focus:border-gray-400 bg-white w-full shadow-none">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="COD">COD</SelectItem>
                      <SelectItem value="PREPAID">Prepaid</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className={labelCls}>Special Instructions</label>
              <textarea rows={2} {...register("special_instructions")} className={textareaCls} />
            </div>

            <div className="flex flex-col gap-1">
              <label className={labelCls}>Remarks</label>
              <textarea rows={2} {...register("remarks")} className={textareaCls} />
            </div>

            {user?.role === "ydm" && (
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Assigned Rider</label>
                <Controller
                  control={control}
                  name="assigned_rider"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={order?.status === "ORDER_PLACED"}
                    >
                      <SelectTrigger className="border border-gray-200 rounded-xs px-2 py-1.5 h-auto text-xs focus:outline-none focus:ring-0 focus:border-gray-400 bg-white w-full shadow-none">
                        <SelectValue placeholder="Assign rider" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {riders?.results.map((rider) => (
                          <SelectItem key={rider.id} value={rider.id.toString()}>
                            {`${rider.first_name} ${rider.last_name}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            )}
          </form>
        )}

        <DialogFooter>
          <DialogClose render={<Button variant="outline" size="sm" />}>
            Cancel
          </DialogClose>
          <Button
            size="sm"
            type="submit"
            form="edit-order-form"
            disabled={updateMutation.isPending || isLoading}
          >
            {updateMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Update"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main View ──────────────────────────────────────────────────────────────

export function MyOrdersView({
  userId: propUserId,
  fixedStatus,
  title = "My Orders",
}: {
  userId?: string;
  /** When set, locks the status filter to this value and hides the status dropdown. */
  fixedStatus?: string;
  /** Heading text for the panel. */
  title?: string;
} = {}) {
  const { user } = useAuth();
  const userId = propUserId ?? user?.user_id;

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 50,
  });
  const [isExporting, setIsExporting] = useState(false);
  const [selectedOrderIds, setSelectedOrderIds] = useState<Record<string, boolean>>({});
  const [editingTrackingNumber, setEditingTrackingNumber] = useState<string | null>(null);
  const [viewTrackingNumber, setViewTrackingNumber] = useState<string | null>(null);
  const [deletingTrackingNumber, setDeletingTrackingNumber] = useState<string | null>(null);
  const [statusChangeDialog, setStatusChangeDialog] = useState<{ trackingNumber: string; val: string; statusLabel: string } | null>(null);
  const [statusChangeComment, setStatusChangeComment] = useState("");

  const { mutate: deleteOrderMutation } = useDeleteOrder();
  const updateOrderMutation = useUpdateOrderDetails();

  const deleteOrder = (trackingNumber: string) => {
    setDeletingTrackingNumber(trackingNumber);
    deleteOrderMutation(trackingNumber, {
      onSuccess: () => {
        toast.success("Order deleted successfully");
        setDeletingTrackingNumber(null);
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
      },
      onError: (error) => {
        toast.error(error.message || "Failed to delete order");
        setDeletingTrackingNumber(null);
      }
    });
  };

  const handlePrint = () => {
    const allOrders = orders?.results ?? [];
    const selectedOrders = allOrders.filter((o) => selectedOrderIds[o.tracking_number]);
    const ordersToPrint = selectedOrders.length > 0 ? selectedOrders : allOrders;

    const printDate = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

    const tableRows = ordersToPrint.map((order, idx) => `
      <tr>
        <td>${idx + 1}</td>
        <td>${order.tracking_number}</td>
        <td>${order.recipient_name}</td>
        <td>${order.recipient_phone}</td>
        <td>${order.recipient_address}, ${order.recipient_city}${order.recipient_district ? ", " + order.recipient_district : ""}</td>
        <td>${order.payment_type}</td>
        <td>Rs. ${order.cod_amount}</td>
        <td>${order.status}</td>
        <td>${(order as any).latest_status_comment ?? ""}</td>
      </tr>
    `).join("");

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>YDM Logistics</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #000; background: #fff; padding: 24px 32px; }
    .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 2px solid #000; }
    .header img { height: 48px; width: auto; filter: grayscale(100%); }
    .header-right { text-align: right; color: #000; font-size: 10px; line-height: 1.6; }
    h1 { font-size: 14px; font-weight: bold; margin-bottom: 4px; text-align: center; color: #000; }
    .subtitle { font-size: 10px; color: #000; text-align: center; margin-bottom: 16px; }
    table { width: 100%; border-collapse: collapse; font-size: 10px; }
    thead tr { background: #fff; color: #000; }
    thead th { padding: 6px 8px; text-align: left; border: 1px solid #000; white-space: nowrap; color: #000; font-weight: bold; }
    tbody tr { background: #fff; }
    tbody td { padding: 5px 8px; border: 1px solid #000; vertical-align: top; color: #000; }
    .signatures { display: flex; justify-content: space-between; margin-top: 60px; padding-top: 0; }
    .sig-box { width: 200px; }
    .sig-line { border-top: 1px solid #000; margin-bottom: 6px; }
    .sig-label { font-size: 10px; font-weight: bold; text-align: center; color: #000; }
    .sig-title { font-size: 9px; color: #000; text-align: center; }
    .summary { margin: 12px 0 0; font-size: 10px; color: #000; }
    @media print {
      body { padding: 12px 16px; }
      @page { margin: 1cm; size: A4 landscape; }
    }
  </style>
</head>
<body>
  <div class="header">
    <img src="/ydm-logo.webp" alt="YDM Logo" />
    <div class="header-right">
      <div>Print Date: ${printDate}</div>
      <div>Total Orders: ${ordersToPrint.length}</div>
    </div>
  </div>

  <h1>Order Package Report</h1>
  <br/>

  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Tracking No.</th>
        <th>Recipient Name</th>
        <th>Phone</th>
        <th>Address</th>
        <th>Payment</th>
        <th>COD (Rs.)</th>
        <th>Status</th>
        <th>Remarks</th>
      </tr>
    </thead>
    <tbody>
      ${tableRows}
    </tbody>
  </table>

  <p class="summary">Total records: ${ordersToPrint.length}</p>

  <div class="signatures">
    <div class="sig-box">
      <div class="sig-line"></div>
      <div class="sig-label">Created By YDM</div>
      <div class="sig-title">Signature</div>
    </div>
    <div class="sig-box">
      <div class="sig-line"></div>
      <div class="sig-label">Verified By</div>
      <div class="sig-title">Signature</div>
    </div>
  </div>

  <script>
    window.onload = function() { window.print(); };
  </script>
</body>
</html>`;

    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(html);
    win.document.close();
  };

  // ── Applied state (committed on Filter button click, drives the query) ───
  const [appliedSearch, setAppliedSearch] = useState("");
  const [appliedStatus, setAppliedStatus] = useState(fixedStatus ?? "");
  const [appliedDeliveryLocation, setAppliedDeliveryLocation] = useState("");
  const [appliedDateRange, setAppliedDateRange] = useState<DateRange | undefined>(undefined);
  const [appliedIsAssigned, setAppliedIsAssigned] = useState("");

  const handleFilter = React.useCallback((filters: { search: string; status: string; deliveryLocation: string; dateRange: DateRange | undefined; isAssigned: string }) => {
    setAppliedSearch(filters.search);
    setAppliedStatus(fixedStatus ?? filters.status);
    setAppliedDeliveryLocation(filters.deliveryLocation);
    setAppliedDateRange(filters.dateRange);
    setAppliedIsAssigned(filters.isAssigned);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [fixedStatus]);

  const handleReset = React.useCallback(() => {
    setAppliedSearch("");
    setAppliedStatus(fixedStatus ?? "");
    setAppliedDeliveryLocation("");
    setAppliedDateRange(undefined);
    setAppliedIsAssigned("");
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [fixedStatus]);

  const startDate = appliedDateRange?.from ? format(appliedDateRange.from, "yyyy-MM-dd") : "";
  const endDate = appliedDateRange?.to ? format(appliedDateRange.to, "yyyy-MM-dd") : "";

  const handleExport = async () => {
    if (!userId) return;
    try {
      setIsExporting(true);
      await exportOrders(
        userId,
        appliedSearch,
        appliedStatus,
        appliedDeliveryLocation,
        startDate,
        endDate,
        appliedIsAssigned
      );
      toast.success("Orders exported successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to export orders");
    } finally {
      setIsExporting(false);
    }
  };

  const { data: orders, isLoading } = useVendorOrders(
    userId,
    pagination.pageIndex + 1,
    pagination.pageSize,
    appliedSearch,
    appliedStatus,
    appliedDeliveryLocation,
    startDate,
    endDate,
    appliedIsAssigned
  );

  const { data: riders } = useRiders();
  const assignRiderMutation = useAssignRider();

  const router = useRouter();

  const pageCount = orders?.count ? Math.ceil(orders.count / pagination.pageSize) : 0;

  const columns: ColumnDef<Order>[] = useMemo(() => [
    {
      id: "select",
      header: ({ table }) => (
        <div className="flex items-center justify-center gap-1">
          <Checkbox
            className="cursor-pointer"
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(checked) => table.toggleAllPageRowsSelected(!!checked)}
          />
        </div>
      ),
      cell: ({ row }) => {
        const isSelected = row.getIsSelected();
        return (
          <div
            onClick={(e) => {
              e.stopPropagation();
              row.toggleSelected();
            }}
            className="flex items-center group justify-center cursor-pointer absolute border border-dashed border-transparent hover:border-orange-400 inset-0 w-full h-full text-center"
          >
            {!isSelected ? (
              <div className="relative flex items-center justify-center w-4 h-4 pointer-events-none">
                <Checkbox
                  checked={true}
                  onCheckedChange={() => { }}
                  className="absolute inset-0 opacity-0 group-hover:opacity-50 transition-opacity"
                />
                <Checkbox
                  checked={false}
                  onCheckedChange={() => { }}
                  className="absolute inset-0 opacity-100 group-hover:opacity-0 transition-opacity"
                />
              </div>
            ) : (
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => { }}
                className="pointer-events-none"
              />
            )}
          </div>
        );
      },
      size: 60,
    },
    {
      id: "sn",
      header: "S.N.",
      cell: ({ row }) => (
        <span className="text-gray-600 text-xs font-medium text-center block">
          {row.index + 1}
        </span>
      ),
      size: 50,
    },
    {
      id: "orderedOn",
      header: "Ordered On",
      cell: ({ row }) => {
        const orderDate = new Date(row.original.created_at);
        const dateStr = orderDate.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
        const timeStr = orderDate.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        });
        return (
          <div className="bg-[#5a6268] text-white text-[10px] rounded px-2 py-1 mx-auto w-fit font-medium text-center">
            <div className="whitespace-nowrap">{dateStr},</div>
            <div className="whitespace-nowrap">{timeStr}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: () => (
        <div className="text-center font-semibold">
          Status
        </div>
      ),
      cell: ({ row }) => {
        const currentStatus = row.original.status;
        if (user?.role === "ydm") {
          return (
            <div className="text-center min-w-[140px]">
              <Select
                value={currentStatus || ""}
                onValueChange={(val) => {
                  const statusVal = val || "";
                  const commentRequiredStatuses = ["CANCELLED", "ON_HOLD", "RESCHEDULED","RETURNING_TO_VENDOR"];
                  
                  if (commentRequiredStatuses.includes(statusVal)) {
                    const statusLabel = StatusChoices.find((s) => s.value === statusVal)?.label || statusVal;
                    setStatusChangeDialog({
                      trackingNumber: row.original.tracking_number ?? "",
                      val: statusVal,
                      statusLabel,
                    });
                    setStatusChangeComment("");
                    return;
                  }

                  updateOrderMutation.mutate(
                    {
                      trackingNumber: row.original.tracking_number ?? "",
                      data: { 
                        status: statusVal || undefined,
                      },
                    },
                    {
                      onSuccess: () => toast.success("Status updated successfully"),
                      onError: () => toast.error("Failed to update status"),
                    }
                  );
                }}
              >
                <SelectTrigger 
                  onClick={(e: any) => e.stopPropagation()} 
                  className={cn(
                    "w-full text-[10px] h-auto py-1.5 px-2 font-semibold border rounded transition-all focus:ring-0 focus:outline-none shadow-none",
                    getStatusBadgeClass(currentStatus || "")
                  )}
                >
                  <SelectValue placeholder="Select Status">
                    {StatusChoices.find((s) => s.value === currentStatus)?.label || currentStatus || ""}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent onClick={(e: any) => e.stopPropagation()}>
                  {StatusChoices.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      <span className={cn("inline-block px-2 py-0.5 rounded text-[10px] font-medium border", getStatusBadgeClass(status.value))}>
                        {status.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        }
        return (
          <div className="text-center">
            <span className={cn("inline-block px-2 py-1 border rounded text-[10px] uppercase font-semibold", getStatusBadgeClass(currentStatus || ""))}>
              {StatusChoices.find((s) => s.value === currentStatus)?.label || currentStatus}
            </span>
          </div>
        );
      },
    },
    {
      id: "customerInfo",
      header: "Customer Info",
      cell: ({ row }) => (
        <div className="text-gray-700 text-xs">
          <div className="font-medium text-gray-900">{row.original.recipient_name}</div>
          <div className="text-gray-500 text-[11px]">{row.original.recipient_phone}</div>
          <div className="font-light mt-0.5 text-gray-500 text-[11px]">{row.original.recipient_address}</div>
        </div>
      ),
    },
    {
      id: "tracking_code",
      accessorKey: "tracking_number",
      header: "Tracking Code",
      cell: ({ getValue }) => <TrackingCodeCell value={getValue() as string} />,
    },
    {
      id: "price",
      header: "Total Price (Rs.)",
      cell: ({ row }) => {
        const isCancelledStatus = ["CANCELLED", "RETURNING_TO_VENDOR", "RETURNED_TO_VENDOR"].includes(row.original.status);
        return (
          <div className="text-gray-700 text-xs min-w-[140px]">
            <div>Collection Amount : {row.original.cod_amount}</div>
            {isCancelledStatus ? (
              <div className="text-gray-500 text-[11px]">Cancelled Charge: {row.original.ydm_cancelled_charge ?? "0.00"}</div>
            ) : (
              <div className="text-gray-500 text-[11px]">Delivery Charge: {row.original.ydm_delivery_charge ?? "0.00"}</div>
            )}
          </div>
        );
      },
    },
    {
      id: "net_amount",
      header: "Net Amount (Rs.)",
      cell: ({ row }) => (
        <span className="text-gray-700 text-xs font-medium whitespace-nowrap">
          {row.original.net_amount !== null && row.original.net_amount !== undefined
            ? `Rs. ${row.original.net_amount}`
            : "-"}
        </span>
      ),
    },
    ...(user?.role === "ydm" ? [{
      id: "rider",
      header: "Rider",
      cell: ({ row }: any) => (
        <div className="text-gray-700 min-w-[140px]">
          <Select
            value={row.original.assigned_rider?.toString() || ""}
            disabled={row.original.status === "ORDER_PLACED"}
            onValueChange={(val) => {
              assignRiderMutation.mutate({
                order_ids: [row.original.tracking_number],
                rider_id: val as string
              }, {
                onSuccess: () => toast.success("Rider assigned successfully"),
                onError: () => toast.error("Failed to assign rider")
              });
            }}
          >
            <SelectTrigger onClick={(e: any) => e.stopPropagation()}>
              <SelectValue placeholder="Assign rider">
                {row.original.assigned_rider_name || "Assign rider"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent onClick={(e: any) => e.stopPropagation()}>
              {riders?.results.map((rider) => (
                <SelectItem key={rider.id} value={rider.id.toString()}>
                  {`${rider.first_name} ${rider.last_name}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ),
    }] : []),
    {
      id: "action",
      header: () => <div className="text-center min-w-[80px]">Action</div>,
      cell: ({ row }) => (
        <TooltipProvider delay={100}>
          <div className="grid grid-cols-4 gap-0.5 items-center justify-center">
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      setEditingTrackingNumber(row.original.tracking_number);
                    }}
                    variant="default"
                    size="icon-xs"
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                }
              />
              <TooltipContent>Edit</TooltipContent>
            </Tooltip>
            <AlertDialog>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <span>
                      <AlertDialogTrigger
                        render={
                          <Button
                            onClick={(e: any) => e.stopPropagation()}
                            variant="destructive"
                            size="icon-xs">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        }
                      />
                    </span>
                  }
                />
                <TooltipContent>Delete</TooltipContent>
              </Tooltip>
              <AlertDialogContent onClick={(e: any) => e.stopPropagation()}>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will delete this order. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={deletingTrackingNumber === row.original.tracking_number}>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    disabled={deletingTrackingNumber === row.original.tracking_number}
                    onClick={(e) => {
                      e.preventDefault();
                      deleteOrder(row.original.tracking_number);
                    }}
                  >
                    {deletingTrackingNumber === row.original.tracking_number && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="secondary"
                    size="icon-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      setViewTrackingNumber(row.original.tracking_number);
                    }}
                  >
                    <Eye className="w-3 h-3" />
                  </Button>
                }
              />
              <TooltipContent>View Details</TooltipContent>
            </Tooltip>
            <Popover>
              <Tooltip>
                <PopoverTrigger
                  onClick={(e) => e.stopPropagation()}
                  render={
                    <TooltipTrigger
                      render={
                        <Button variant="outline" size="icon-xs">
                          <MessageSquare className="w-3 h-3" />
                        </Button>
                      }
                    />
                  }
                />
                <TooltipContent>Comment</TooltipContent>
              </Tooltip>
              <PopoverContent onClick={(e) => e.stopPropagation()} className="w-80">
                <CommentPopover
                  trackingNumber={row.original.tracking_number}
                  userId={user?.user_id ?? ""}
                />
              </PopoverContent>
            </Popover>
          </div>
        </TooltipProvider>
      ),
    },
  ], [router, user?.user_id, user?.role, riders, assignRiderMutation, updateOrderMutation]);

  const memoizedAppliedFilters = useMemo(() => ({
    search: appliedSearch,
    status: appliedStatus,
    deliveryLocation: appliedDeliveryLocation,
    dateRange: appliedDateRange,
    isAssigned: appliedIsAssigned,
  }), [appliedSearch, appliedStatus, appliedDeliveryLocation, appliedDateRange, appliedIsAssigned]);

  const getRowId = React.useCallback((row: Order) => row.tracking_number, []);

  const selectedCount = Object.values(selectedOrderIds).filter(Boolean).length;

  return (
    <div className="flex flex-col gap-6 w-full bg-white p-6 md:p-8 rounded-sm border border-gray-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-2 border-b border-gray-100 mb-2 gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-[#2e4a62] uppercase border-b-2 border-orange-400 inline-block pb-2 -mb-[11px] w-fit">
            {title}
          </h2>
          <span className="text-xs text-gray-500 bg-gray-50 border border-gray-200 px-2.5 py-0.5 rounded-full font-medium ml-2">
            Found {orders?.count ?? 0} orders
          </span>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {user?.role === "ydm" && selectedCount > 0 && (
            <Popover>
              <PopoverTrigger
                id="bulk-assign-riders"
                disabled={selectedCount === 0}
                className={buttonVariants({ variant: "outline", size: "sm", className: cn("h-8 text-xs gap-1.5", selectedCount === 0 ? "opacity-50 cursor-not-allowed" : "") })}
              >
                <Motorbike className="w-3.5 h-3.5" />
                Bulk Assign Riders{selectedCount > 0 ? ` (${selectedCount})` : ""}
              </PopoverTrigger>
              <PopoverContent className="w-56 p-1" align="end">
                {riders?.results && riders.results.length > 0 ? (
                  <ul className="flex flex-col">
                    {riders.results.map((rider) => (
                      <li key={rider.id}>
                        <button
                          onClick={() => {
                            const allOrders = orders?.results ?? [];
                            const selected_ids = Object.entries(selectedOrderIds)
                              .filter(([, v]) => v)
                              .map(([id]) => id);
                            const order_ids = selected_ids.filter((id) => {
                              const ord = allOrders.find(o => o.tracking_number === id);
                              return ord?.status !== "ORDER_PLACED";
                            });
                            const hasOrderPlaced = selected_ids.length !== order_ids.length;

                            if (order_ids.length === 0) {
                              toast.error("Cannot assign rider to orders with status 'Order Placed'");
                              return;
                            }

                            if (hasOrderPlaced) {
                              toast.info("Skipping orders with status 'Order Placed'");
                            }

                            assignRiderMutation.mutate(
                              { order_ids, rider_id: String(rider.id) },
                              {
                                onSuccess: () => {
                                  toast.success(`Rider assigned to ${order_ids.length} order(s)`);
                                  setSelectedOrderIds({});
                                },
                                onError: (err: any) => {
                                  toast.error(err?.message ?? "Failed to assign rider");
                                },
                              }
                            );
                          }}
                          className="w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 transition-colors"
                        >
                          <span className="font-medium">{rider.first_name} {rider.last_name}</span>
                          <span className="block text-xs text-gray-400">{rider.phone_number}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="px-3 py-2 text-xs text-gray-400">No riders available</p>
                )}
              </PopoverContent>
            </Popover>
          )}

          <Button variant="secondary" size="sm" className="h-8 text-xs gap-1.5" onClick={handleExport} disabled={isExporting}>
            {isExporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <SquareArrowRightExit className="h-3.5 w-3.5" />}
            Export To Excel
          </Button>

          <Button variant="secondary" size="sm" className="h-8 text-xs gap-1.5" onClick={handlePrint}>
            <Printer className="h-3.5 w-3.5" />
            {selectedCount > 0 ? `Print Selected (${selectedCount})` : "Print"}
            {selectedCount === 0 && (
              <Tooltip>
                <TooltipTrigger render={<HelpCircle className="h-3.5 w-3.5" />} />
                <TooltipContent>
                  <p>You can select some rows to print them only too!</p>
                </TooltipContent>
              </Tooltip>
            )}
          </Button>
        </div>
      </div>

      {/* FILTERS */}
      <FilterBar
        onFilter={handleFilter}
        onReset={handleReset}
        appliedFilters={memoizedAppliedFilters}
        hideStatusFilter={!!fixedStatus}
      />

      {/* TABLE */}
      <div className="mt-4">
        <DataTable
          data={orders?.results ?? []}
          columns={columns}
          isLoading={isLoading}
          emptyMessage="No orders found."
          onRowClick={(order) =>
            router.push(`/track-order/${order.tracking_number}`)
          }
          pageCount={pageCount}
          pagination={pagination}
          onPaginationChange={setPagination}
          rowSelection={selectedOrderIds}
          onRowSelectionChange={setSelectedOrderIds}
          getRowId={getRowId}
        />
      </div>

      <EditOrderModal
        trackingNumber={editingTrackingNumber}
        open={editingTrackingNumber !== null}
        onClose={() => setEditingTrackingNumber(null)}
      />

      <Dialog open={viewTrackingNumber !== null} onOpenChange={(open) => !open && setViewTrackingNumber(null)}>
        <DialogContent className="min-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="sr-only">
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {viewTrackingNumber && (
            <OrderDetailsView trackingNumber={viewTrackingNumber} />
          )}
        </DialogContent>
      </Dialog>

      <Dialog 
        open={statusChangeDialog !== null} 
        onOpenChange={(open) => {
          if (!open) setStatusChangeDialog(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reason for Status Change</DialogTitle>
          </DialogHeader>
          <div className="py-3 flex flex-col gap-3">
            <div className="text-xs text-gray-500 flex flex-col gap-1.5 bg-slate-50 p-3 rounded-sm border border-slate-100">
              <div>
                Order: <span className="font-semibold text-gray-700">{statusChangeDialog?.trackingNumber}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>New Status:</span>
                <span className={cn("inline-block px-2 py-0.5 rounded text-[10px] font-medium border", getStatusBadgeClass(statusChangeDialog?.val || ""))}>
                  {statusChangeDialog?.statusLabel}
                </span>
              </div>
            </div>
            <label className="text-[11px] font-medium text-gray-500">
              Please enter a comment or reason for this status change:
            </label>
            <textarea
              className="w-full border border-gray-200 focus:border-orange-400 rounded p-2 text-xs focus:outline-none min-h-[100px] resize-none transition-colors"
              placeholder="e.g., Customer requested delivery tomorrow, Payment issue, etc."
              value={statusChangeComment}
              onChange={(e) => setStatusChangeComment(e.target.value)}
              disabled={updateOrderMutation.isPending}
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStatusChangeDialog(null)}
              disabled={updateOrderMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={!statusChangeComment.trim() || updateOrderMutation.isPending}
              onClick={() => {
                if (!statusChangeDialog) return;
                updateOrderMutation.mutate(
                  {
                    trackingNumber: statusChangeDialog.trackingNumber,
                    data: {
                      status: statusChangeDialog.val,
                      comment: statusChangeComment.trim(),
                    },
                  },
                  {
                    onSuccess: () => {
                      toast.success("Status updated successfully");
                      setStatusChangeDialog(null);
                    },
                    onError: () => toast.error("Failed to update status"),
                  }
                );
              }}
            >
              {updateOrderMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Updating...
                </>
              ) : (
                "Submit"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}