"use client";

import { useState } from "react";
import { useAuth } from "@/src/lib/auth-context";
import { useVendorStatement } from "./statements.queries";

import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Button, buttonVariants } from "@/components/ui/button";
import { StatementEntry } from "@/src/services/statement";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { type DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatCurrency(value: number | string | undefined) {
  const num = Number(value ?? 0);
  return `Rs. ${num.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

const columns: ColumnDef<StatementEntry>[] = [
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
    accessorKey: "date",
    header: "Date",
    cell: ({ getValue }) => (
      <div className="text-gray-600">{formatDate(getValue() as string)}</div>
    ),
  },
  {
    accessorKey: "total_order",
    header: "Total Order",
    cell: ({ getValue }) => (
      <div className="text-gray-700">{getValue() as number}</div>
    ),
  },
  {
    accessorKey: "total_amount",
    header: "Total Amount",
    cell: ({ getValue }) => (
      <div className="text-gray-700">
        {formatCurrency(getValue() as number)}
      </div>
    ),
  },
  {
    accessorKey: "delivery_count",
    header: "Delivery Count",
    cell: ({ getValue }) => (
      <div className="text-gray-700">{getValue() as number}</div>
    ),
  },
  {
    accessorKey: "delivered_amount",
    header: "Delivered Amount",
    cell: ({ getValue }) => (
      <div className="text-green-600">
        {formatCurrency(getValue() as number)}
      </div>
    ),
  },
  {
    accessorKey: "delivery_charge",
    header: "Delivery Charge",
    cell: ({ getValue }) => (
      <div className="text-gray-700">
        {formatCurrency(getValue() as number)}
      </div>
    ),
  },
  {
    accessorKey: "payment",
    header: "Payment",
    cell: ({ getValue }) => (
      <div className="text-blue-600">
        {formatCurrency(getValue() as number)}
      </div>
    ),
  },
  {
    accessorKey: "balance",
    header: "Balance",
    cell: ({ getValue }) => (
      <div className="text-red-500 font-medium">
        {formatCurrency(getValue() as number)}
      </div>
    ),
  },
];

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 bg-gray-50 border border-gray-200 rounded-xs p-3">
      <span className="text-[10px] uppercase font-semibold text-gray-500">
        {label}
      </span>
      <span className="text-sm font-semibold text-[#2e4a62]">{value}</span>
    </div>
  );
}

export function StatementsView({
  userId: propUserId,
}: { userId?: string } = {}) {
  const { user } = useAuth();
  const userId = propUserId ?? user?.user_id;

  // Draft values bound to the inputs; "applied" values are what actually
  // drive the query, so picking a date doesn't refetch until confirmed.
  const [draftDateRange, setDraftDateRange] = useState<DateRange | undefined>(undefined);
  const [appliedRange, setAppliedRange] = useState<{
    start_date?: string;
    end_date?: string;
  }>({});

  const { data, isLoading, isFetching } = useVendorStatement(
    userId,
    appliedRange,
  );

  const results = data?.results;
  const breakdown = results?.dashboard_breakdown;

  const canApply = Boolean(draftDateRange?.from && draftDateRange?.to);
  const hasAppliedRange = Boolean(
    appliedRange.start_date || appliedRange.end_date,
  );

  const handleApply = () => {
    if (!canApply || !draftDateRange?.from || !draftDateRange?.to) return;
    const start_date = format(draftDateRange.from, "yyyy-MM-dd");
    const end_date = format(draftDateRange.to, "yyyy-MM-dd");
    setAppliedRange({ start_date, end_date });
  };

  const handleReset = () => {
    setDraftDateRange(undefined);
    setAppliedRange({});
  };

  return (
    <div className="flex flex-col gap-6 w-full bg-white p-6 md:p-8 rounded-sm border border-gray-200">
      {/* Header row: title left, filter controls right — same pattern as
          the Invoices "Create Invoice" header row. */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-2 border-b border-gray-100">
        <h2 className="text-sm font-bold text-[#2e4a62] uppercase border-b-2 border-orange-400 inline-block pb-2 -mb-[11px] w-fit">
          Statement
        </h2>

        <div className="flex flex-wrap items-center gap-2">
          <Popover>
            <PopoverTrigger
              id="date-picker-range"
              className={cn(
                buttonVariants({
                  variant: "outline",
                  className: "justify-start px-2.5 font-normal h-8 w-[240px] rounded-xs text-xs text-gray-600 transition-colors bg-transparent",
                }),
                appliedRange.start_date ? "border-orange-400" : "border-gray-200"
              )}
            >
              <CalendarIcon className="mr-2 h-3.5 w-3.5" />
              {draftDateRange?.from ? (
                draftDateRange.to ? (
                  <>
                    {format(draftDateRange.from, "LLL dd, y")} –{" "}
                    {format(draftDateRange.to, "LLL dd, y")}
                  </>
                ) : (
                  format(draftDateRange.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="range"
                defaultMonth={draftDateRange?.from}
                selected={draftDateRange}
                onSelect={setDraftDateRange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>

          <Button
            size="sm"
            className="h-8 text-xs bg-[#2e4a62] hover:bg-[#1f3242] text-white disabled:opacity-50"
            disabled={!canApply || isFetching}
            onClick={handleApply}
          >
            {isFetching ? "Applying…" : "Apply"}
          </Button>

          {hasAppliedRange && (
            <button
              onClick={handleReset}
              disabled={isFetching}
              className="text-xs text-gray-500 hover:text-gray-700 underline underline-offset-2 disabled:opacity-50"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {results && (
        <p className="text-xs text-gray-500 -mt-2">
          Showing {formatDate(results.start_date)} —{" "}
          {formatDate(results.end_date)}
        </p>
      )}

      {results && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <SummaryCard
            label="Pending COD"
            value={formatCurrency(results.dashboard_pending_cod)}
          />
          <SummaryCard
            label="Total Orders"
            value={String(breakdown?.total_order ?? 0)}
          />
          <SummaryCard
            label="Total Amount"
            value={formatCurrency(breakdown?.total_amount)}
          />
          <SummaryCard
            label="Delivered Amount"
            value={formatCurrency(breakdown?.delivered_amount)}
          />
          <SummaryCard
            label="Total Charge"
            value={formatCurrency(breakdown?.total_charge)}
          />
          <SummaryCard
            label="Approved Paid"
            value={formatCurrency(breakdown?.approved_paid)}
          />
          <SummaryCard
            label="Delivered Count"
            value={String(breakdown?.delivered_count ?? 0)}
          />
          <SummaryCard
            label="Cancelled Count"
            value={String(breakdown?.cancelled_count ?? 0)}
          />
        </div>
      )}

      <DataTable
        data={results?.statement ?? []}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="No statements available."
      />
    </div>
  );
}
