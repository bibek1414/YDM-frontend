"use client";

import { useState, useEffect } from "react";
import { useUnpaidOrders, useCreateCodTransfer } from "./payments.queries";
import { PaymentOrder } from "@/src/services/payments";
import { Button } from "@/components/ui/button";
import {
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function formatCurrency(value: number | string | undefined | null) {
  const num = Number(value ?? 0);
  return `Rs. ${num.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

interface CreateTransferDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  userId?: string;
}

export function CreateTransferDialog({
  isOpen,
  onOpenChange,
  userId,
}: CreateTransferDialogProps) {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  // Track selected orders in a map to preserve selections across different pages
  const [selectedOrders, setSelectedOrders] = useState<Record<number, PaymentOrder>>({});

  // Debounce search query to prevent API spamming
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 450);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: unpaidData, isLoading: isLoadingUnpaid } = useUnpaidOrders(
    isOpen ? userId : undefined,
    page,
    debouncedSearch
  );

  const createCodTransferMutation = useCreateCodTransfer();

  const unpaidOrders = unpaidData?.results ?? [];
  const totalCount = unpaidData?.count ?? 0;
  const totalPages = Math.ceil(totalCount / 20) || 1;

  // Unpaid orders are filtered on the backend, so we render the API results directly
  const filteredUnpaid = unpaidOrders;

  const selectedOrdersList = Object.values(selectedOrders);
  const selectedIds = Object.keys(selectedOrders).map(Number);
  const totalSelectedAmount = selectedOrdersList.reduce(
    (sum, order) => sum + Number(order.net_amount || 0),
    0
  );

  const handleOpenChange = (open: boolean) => {
    onOpenChange(open);
    if (!open) {
      setSelectedOrders({});
      setSearchQuery("");
      setDebouncedSearch("");
      setPage(1);
    }
  };

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

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl! w-[92vw] max-h-[85vh] flex flex-col p-6 bg-white rounded-md">
        <DialogHeader>
          <DialogTitle className="text-[#2e4a62] font-bold text-sm uppercase">
            Create COD Transfer
          </DialogTitle>
        </DialogHeader>

        {isLoadingUnpaid ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin text-[#2e4a62]" />
            <p className="text-xs">Loading unpaid orders...</p>
          </div>
        ) : unpaidOrders.length === 0 && totalCount === 0 ? (
          <div className="flex flex-col gap-4 flex-1 overflow-hidden">
            {/* Search Filter input even when empty so they can clear search */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-2.5">
                <Search className="h-3.5 w-3.5 text-gray-400" />
              </span>
              <input
                type="text"
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-8 pl-8 pr-3 border border-gray-200 rounded-md text-xs text-gray-600 bg-white focus:outline-none focus:ring-1 focus:ring-[#2e4a62]"
              />
            </div>
            <div className="text-center py-12 text-gray-500 text-xs">
              No unpaid orders available.
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 flex-1 overflow-hidden">
            {/* Search Filter input */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-2.5">
                <Search className="h-3.5 w-3.5 text-gray-400" />
              </span>
              <input
                type="text"
                placeholder="Search orders by ID or Receiver..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-8 pl-8 pr-3 border border-gray-200 rounded-md text-xs text-gray-600 bg-white focus:outline-none focus:ring-1 focus:ring-[#2e4a62]"
              />
            </div>

            {/* List Table of unpaid orders */}
            <div className="flex-1 overflow-y-auto border border-gray-200 rounded-xs max-h-[260px]">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                  <tr>
                    <th className="p-3 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={filteredUnpaid.length > 0 && filteredUnpaid.every(o => !!selectedOrders[o.id])}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setSelectedOrders((prev) => {
                            const copy = { ...prev };
                            filteredUnpaid.forEach((order) => {
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
                    <th className="p-3 font-semibold text-gray-600">Order ID</th>
                    <th className="p-3 font-semibold text-gray-600">Receiver</th>
                    <th className="p-3 font-semibold text-gray-600 text-right">Net Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUnpaid.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-gray-500">
                        No orders match search query on this page.
                      </td>
                    </tr>
                  ) : (
                    filteredUnpaid.map((order, idx) => {
                      const displayId = order.tracking_number || `#${order.id}`;
                      const isSelected = !!selectedOrders[order.id];
                      return (
                        <tr
                          key={order.id}
                          className={`border-b border-gray-200 last:border-0 hover:bg-gray-50 cursor-pointer ${
                            isSelected ? "bg-orange-50/20" : idx % 2 === 0 ? "bg-white" : "bg-gray-50/10"
                          }`}
                          onClick={() => handleToggleOrder(order)}
                        >
                          <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleOrder(order)}
                              className="rounded-sm border-gray-300 text-[#2e4a62] focus:ring-[#2e4a62] cursor-pointer"
                            />
                          </td>
                          <td className="p-3 font-medium text-gray-800">{displayId}</td>
                          <td className="p-3 text-gray-600">{order.recipient_name || "N/A"}</td>
                          <td className="p-3 text-right font-medium text-gray-800">
                            {formatCurrency(order.net_amount)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-100 pt-2 shrink-0">
                <span className="text-[10px] text-gray-500">
                  Showing {(page - 1) * 20 + 1} to {Math.min(page * 20, totalCount)} of {totalCount} entries
                </span>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    className="h-7 w-7 p-0 bg-white"
                    onClick={() => setPage(p => Math.max(p - 1, 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </Button>
                  <span className="text-[10px] text-gray-600 font-medium">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    className="h-7 w-7 p-0 bg-white"
                    onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                    disabled={page === totalPages}
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}

            {/* Footer and selection totals */}
            <div className="flex flex-col gap-3 pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 font-medium">
                  Selected: <span className="text-gray-800 font-bold">{selectedIds.length}</span> orders (across pages)
                </span>
                <span className="text-gray-500 font-medium">
                  Total Amount: <span className="text-[#2e4a62] font-bold">{formatCurrency(totalSelectedAmount)}</span>
                </span>
              </div>

              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenChange(false)}
                  className="h-8 text-xs border-gray-200 text-gray-700 hover:bg-gray-50"
                  disabled={createCodTransferMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (selectedIds.length === 0) return;
                    createCodTransferMutation.mutate({
                      user: Number(userId),
                      orders: selectedIds,
                      total_amount: Number(totalSelectedAmount.toFixed(2))
                    }, {
                      onSuccess: () => {
                        handleOpenChange(false);
                      }
                    });
                  }}
                  disabled={selectedIds.length === 0 || createCodTransferMutation.isPending}
                  size="sm"
                  className="h-8 text-xs bg-[#e2722b] hover:bg-[#d0631c] text-white px-5 rounded-full"
                >
                  {createCodTransferMutation.isPending ? (
                    <>
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Transfer"
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
