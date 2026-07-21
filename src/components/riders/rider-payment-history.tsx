// src/components/riders/rider-payment-history.tsx

import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { CommissionPaymentResponse } from "@/src/types/rider";

interface RiderPaymentHistoryProps {
  data?: CommissionPaymentResponse;
  isLoading: boolean;
  isError: boolean;
  error?: Error | null;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onRetry?: () => void;
}

export function RiderPaymentHistory({
  data,
  isLoading,
  isError,
  error,
  page,
  pageSize,
  onPageChange,
  onRetry,
}: RiderPaymentHistoryProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 border border-red-200 rounded-lg bg-red-50/20 text-center">
        <p className="text-sm text-red-600">
          Failed to load commission history
        </p>
        {error?.message && (
          <p className="text-xs text-gray-500 mt-1">{error.message}</p>
        )}
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-2 text-xs text-gray-600 hover:text-gray-900 underline"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  if (!data?.results || data.results.length === 0) {
    return (
      <p className="text-sm text-gray-500 py-8 text-center">
        No paid commission history found.
      </p>
    );
  }

  const totalPages = Math.ceil(data.count / pageSize);
  const startIndex = (page - 1) * pageSize;

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "yyyy-MM-dd hh:mm a");
    } catch {
      return dateStr;
    }
  };

  const formatCurrency = (amount: string) => {
    return parseFloat(amount).toLocaleString(undefined, {
      minimumFractionDigits: 1,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="space-y-4">
      {/* Desktop/Tablet Table View */}
      <div className="hidden sm:block overflow-x-auto border border-gray-200 rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">S.N.</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Paid At</TableHead>
              <TableHead>Remarks</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.results.map((payment, index) => {
              const serialNumber = startIndex + index + 1;
              return (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium text-gray-600">
                    {serialNumber}
                  </TableCell>
                  <TableCell className="font-medium text-gray-900">
                    Rs. {formatCurrency(payment.amount)}
                  </TableCell>
                  <TableCell className="text-gray-700">
                    {formatDate(payment.paid_at)}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {payment.remarks || "-"}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card List View */}
      <div className="space-y-3 sm:hidden">
        {data.results.map((payment, index) => {
          const serialNumber = startIndex + index + 1;
          return (
            <div key={payment.id} className="p-4 bg-white border border-gray-200 rounded-lg space-y-2.5 shadow-3xs">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-semibold text-gray-400">
                  S.N. #{serialNumber}
                </span>
                <span className="text-xs text-gray-500 font-medium">
                  {formatDate(payment.paid_at)}
                </span>
              </div>
              <div className="flex justify-between items-end pt-1">
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                    Amount
                  </span>
                  <span className="text-base font-bold text-gray-900 mt-0.5">
                    Rs. {formatCurrency(payment.amount)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider block">
                    Remarks
                  </span>
                  <span className="text-xs text-gray-600 font-normal mt-0.5 block">
                    {payment.remarks || "-"}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between py-2">
          <div className="text-xs text-gray-500">
            Showing {startIndex + 1} to {Math.min(page * pageSize, data.count)}{" "}
            of {data.count} payments
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.max(page - 1, 1))}
              disabled={page === 1}
              className="h-8 text-xs gap-1"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.min(page + 1, totalPages))}
              disabled={page === totalPages}
              className="h-8 text-xs gap-1"
            >
              Next <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
