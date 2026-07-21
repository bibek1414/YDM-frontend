"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/src/lib/auth-context";
import {
  useVendorInvoices,
  useApproveInvoice,
  INVOICES_QUERY_KEYS,
} from "./invoices.queries";
import { Invoice, getInvoiceById } from "@/src/services/invoices";
import { type ColumnDef } from "@tanstack/react-table";
import {
  Eye,
  Download,
  Edit,
  Plus,
  Loader2,
  Check,
  ShieldCheck,
} from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  downloadInvoicePDF,
  generateInvoicePDF,
} from "./invoice/utils/pdf-generator";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { useRouter } from "next/navigation";

const getFullSignatureUrl = (url: string | null | undefined) => {
  if (!url) return "";
  if (url.startsWith("data:")) return url;

  // Normalize url to make sure it has a leading slash if relative
  let rawPath = url;
  if (!url.startsWith("http") && !url.startsWith("/")) {
    rawPath = `/${url}`;
  }

  // Extract path starting with invoice_signatures or media
  const match = rawPath.match(/(\/(?:invoice_signatures|media)\/.*)$/);
  let path = match ? match[1] : rawPath;

  // Prepend /media if it's stored directly under /invoice_signatures/
  if (path.startsWith("/invoice_signatures/")) {
    path = `/media${path}`;
  }

  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";
  const cleanBase = baseUrl.replace(/\/$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  return `${cleanBase}${cleanPath}`;
};

/** vendorId is the URL segment used for routing (admin mode). Omit for vendor self-service. */
function buildColumns(
  vendorId: string | undefined,
  handlePdfAction: (row: Invoice, action: "view" | "download") => void,
  canApprove: boolean,
  handleApprove: (row: Invoice) => void,
): ColumnDef<Invoice>[] {
  const router = useRouter();
  const base = vendorId
    ? `/dashboard/vendors/${vendorId}/invoice`
    : "/dashboard/invoice";

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
      accessorKey: "invoice_code",
      header: "Invoice Code",
      cell: ({ getValue }) => (
        <div className="font-medium text-[#2e4a62]">
          {(getValue() as string) || "N/A"}
        </div>
      ),
    },
    {
      id: "createdAt",
      header: "Date",
      cell: ({ row }) => {
        const dateStr = new Date(row.original.created_at).toLocaleDateString(
          "en-GB",
          { day: "2-digit", month: "short", year: "numeric" },
        );
        return <div className="text-gray-600">{dateStr}</div>;
      },
    },
    {
      accessorKey: "total_amount",
      header: "Total Amount",
      cell: ({ getValue }) => (
        <div className="text-gray-700">
          Rs. {(getValue() as string) || "0.00"}
        </div>
      ),
    },
    {
      accessorKey: "paid_amount",
      header: "Paid Amount",
      cell: ({ getValue }) => (
        <div className="text-green-600">
          Rs. {(getValue() as string) || "0.00"}
        </div>
      ),
    },
    {
      accessorKey: "due_amount",
      header: "Due Amount",
      cell: ({ getValue }) => (
        <div className="text-red-500">
          Rs. {(getValue() as string) || "0.00"}
        </div>
      ),
    },
    {
      accessorKey: "payment_type",
      header: "Payment Type",
      cell: ({ getValue }) => (
        <div className="text-gray-600">{getValue() as string}</div>
      ),
    },
    {
      accessorKey: "status",
      header: () => <div className="text-center">Status</div>,
      cell: ({ row, getValue }) => {
        const status = getValue() as string;
        const invoice = row.original;
        const getStatusColor = (s: string) => {
          switch (s) {
            case "Paid":
              return "bg-green-50 text-green-700 border border-green-200";
            case "Pending":
              return "bg-orange-50 text-orange-700 border border-orange-200";
            case "Partially Paid":
              return "bg-blue-50 text-blue-700 border border-blue-200";
            case "Cancelled":
              return "bg-red-50 text-red-700 border border-red-200";
            case "Draft":
              return "bg-gray-50 text-gray-600 border border-gray-200";
            default:
              return "bg-gray-50 text-gray-700 border border-gray-200";
          }
        };

        if (canApprove && status === "Pending" && !invoice.is_approved) {
          return (
            <div className="text-center">
              <Select
                onValueChange={(val) => {
                  if (val === "approve") {
                    handleApprove(invoice);
                  }
                }}
              >
                <SelectTrigger className={`h-7 px-2.5 rounded-full text-[10px] uppercase font-bold tracking-wider ${getStatusColor("Pending")}`}>
                  <SelectValue placeholder="Pending" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending" disabled className="text-[10px] uppercase font-bold">Pending</SelectItem>
                  <SelectItem value="approve" className="text-[10px] uppercase font-bold text-green-600">Approve</SelectItem>
                </SelectContent>
              </Select>
            </div>
          );
        }

        return (
          <div className="text-center">
            <span
              className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${getStatusColor(status)}`}
            >
              {status || "N/A"}
            </span>
          </div>
        );
      },
    },
    {
      id: "action",
      header: () => <div className="text-center">Action</div>,
      cell: ({ row }) => (
        <TooltipProvider delay={100}>
          <div className="flex gap-1 items-center justify-center">
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`${base}/${row.original.id}/edit`);
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
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="secondary"
                    size="icon-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePdfAction(row.original, "view");
                    }}
                  >
                    <Eye className="w-3 h-3" />
                  </Button>
                }
              />
              <TooltipContent>View Details</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="secondary"
                    size="icon-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePdfAction(row.original, "download");
                    }}
                  >
                    <Download className="w-3 h-3" />
                  </Button>
                }
              />
              <TooltipContent>Download Invoice</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      ),
    },
  ];
}

export function InvoicesView({ userId: propUserId }: { userId?: string } = {}) {
  const { user } = useAuth();
  const userId = propUserId ?? user?.user_id;
  const { data, isLoading } = useVendorInvoices(userId);
  const approveInvoice = useApproveInvoice();
  const queryClient = useQueryClient();

  const [pdfOpen, setPdfOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState("");
  const [activeInvoice, setActiveInvoice] = useState<Invoice | null>(null);
  const [activeVendorName, setActiveVendorName] = useState("");
  const [approvalChecked, setApprovalChecked] = useState(false);

  const closePdfDialog = () => {
    setPdfOpen(false);
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl("");
    }
    setPdfError("");
    setActiveInvoice(null);
    setApprovalChecked(false);
  };

  // The row snapshot from the table can be momentarily stale (e.g. right
  // after an approval elsewhere). Re-check the invoice by id so the
  // Approve button only ever reflects the server's current state.
  const refreshApprovalStatus = async (id: number) => {
    try {
      const fresh = await queryClient.fetchQuery({
        queryKey: INVOICES_QUERY_KEYS.detail(id),
        queryFn: () => getInvoiceById(id),
      });
      setActiveInvoice((prev) =>
        prev && prev.id === id
          ? { ...prev, is_approved: fresh?.is_approved ?? prev.is_approved }
          : prev,
      );
    } catch {
      // If the check fails, fall back silently to the row's own value.
    } finally {
      setApprovalChecked(true);
    }
  };

  const handlePdfAction = async (row: Invoice, action: "view" | "download") => {
    const details = row.user_detail;

    const vendorName = details
      ? [details.first_name, details.last_name].filter(Boolean).join(" ") ||
      details.username
      : "Vendor Name";

    const pdfInvoiceData = {
      invoiceCode: row.invoice_code || "",
      totalAmount: row.total_amount || "0.00",
      paidAmount: row.paid_amount || "0.00",
      dueAmount: row.due_amount || "0.00",
      paymentType: (row.payment_type || "Cash") as any,
      status: ((row.status as any) === "Cancelled"
        ? "Pending"
        : row.status) as any,
      franchise: vendorName,
      createdBy: "",
      signedBy: "",
      signatureDate: "",
      notes: "",
    };

    const signatureUrl = row.signature
      ? getFullSignatureUrl(row.signature)
      : undefined;

    if (action === "download") {
      try {
        await downloadInvoicePDF(pdfInvoiceData, vendorName, signatureUrl);
      } catch (err) {
        console.error("Error downloading PDF:", err);
      }
      return;
    }

    // action === "view"
    setActiveInvoice(row);
    setActiveVendorName(vendorName);
    setPdfError("");
    setPdfUrl("");
    setPdfLoading(true);
    setPdfOpen(true);
    setApprovalChecked(false);
    refreshApprovalStatus(row.id);

    try {
      const pdfBytes = await generateInvoicePDF(
        pdfInvoiceData,
        vendorName,
        signatureUrl,
      );

      const blob = new Blob([pdfBytes as any], {
        type: "application/pdf",
      });

      setPdfUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error("Error generating PDF:", err);
      setPdfError("Something went wrong while preparing the preview.");
    } finally {
      setPdfLoading(false);
    }
  };

  const handleApprove = (invoice: Invoice) => {
    approveInvoice.mutate(invoice.id, {
      onSuccess: () => {
        setActiveInvoice((prev) =>
          prev && prev.id === invoice.id
            ? { ...prev, is_approved: true }
            : prev,
        );
      },
    });
  };

  // Only the vendor themself can approve their invoice — not the ydm admin
  // browsing on the vendor's behalf.
  const showCreate = user?.role === "ydm";
  const canApprove = user?.role !== "ydm";

  const columns = buildColumns(propUserId, handlePdfAction, canApprove, handleApprove);

  const createHref = propUserId
    ? `/dashboard/vendors/${propUserId}/invoice/create`
    : "/dashboard";

  return (
    <>
      <div className="flex flex-col gap-6 w-full bg-white p-6 md:p-8 rounded-sm border border-gray-200">
        <div className="flex justify-between items-center pb-2 border-b border-gray-100">
          <h2 className="text-sm font-bold text-[#2e4a62] uppercase border-b-2 border-orange-400 inline-block pb-2 -mb-[11px]">
            Invoices
          </h2>

          {showCreate && (
            <Link href={createHref}>
              <Button className="bg-[#2e4a62] hover:bg-[#1f3242] text-white flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Create Invoice
              </Button>
            </Link>
          )}
        </div>

        <DataTable
          data={data?.results ?? []}
          columns={columns}
          isLoading={isLoading}
          emptyMessage="No invoices available."
        />
      </div>

      <Dialog
        open={pdfOpen}
        onOpenChange={(open) => {
          if (!open) closePdfDialog();
          else setPdfOpen(true);
        }}
      >
        <DialogContent className="max-w-5xl w-[92vw] h-[88vh] p-0 overflow-hidden flex flex-col gap-0 bg-white">
          <DialogHeader className="flex-row items-center justify-between space-y-0 border-b border-gray-100 pl-6 pr-12 py-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <DialogTitle className="text-base font-semibold text-[#2e4a62]">
                  {activeInvoice?.invoice_code
                    ? `Invoice ${activeInvoice.invoice_code}`
                    : "Invoice Preview"}
                </DialogTitle>

                {activeInvoice && (
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${activeInvoice.is_approved
                      ? "bg-green-100 text-green-700"
                      : "bg-orange-100 text-orange-700"
                      }`}
                  >
                    {activeInvoice.is_approved ? (
                      <>
                        <ShieldCheck className="w-3 h-3" />
                        Approved
                      </>
                    ) : (
                      "Not Approved"
                    )}
                  </span>
                )}
              </div>
              {activeVendorName && (
                <p className="text-xs text-gray-500 mt-0.5 truncate">
                  {activeVendorName}
                </p>
              )}
            </div>

            {activeInvoice && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 text-xs shrink-0"
                disabled={pdfLoading}
                onClick={() => handlePdfAction(activeInvoice, "download")}
              >
                <Download className="w-3.5 h-3.5" />
                Download
              </Button>
            )}
          </DialogHeader>

          <div className="flex-1 min-h-0 bg-gray-50">
            {pdfLoading && (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-400">
                <Loader2 className="w-6 h-6 animate-spin" />
                <p className="text-sm">Preparing preview…</p>
              </div>
            )}

            {!pdfLoading && pdfError && (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-500 px-6 text-center">
                <p className="text-sm">{pdfError}</p>
                {activeInvoice && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-1 text-xs"
                    onClick={() => handlePdfAction(activeInvoice, "view")}
                  >
                    Try again
                  </Button>
                )}
              </div>
            )}

            {!pdfLoading && !pdfError && pdfUrl && (
              <object
                data={pdfUrl}
                type="application/pdf"
                className="w-full h-full"
              >
                <iframe
                  src={pdfUrl}
                  className="w-full h-full border-0"
                  title="Invoice Preview"
                />
              </object>
            )}
          </div>

          {canApprove &&
            activeInvoice &&
            approvalChecked &&
            !activeInvoice.is_approved && (
              <div className="flex items-center justify-between border-t border-gray-100 px-6 py-3 shrink-0">
                <div className="text-xs text-gray-500">
                  Due:{" "}
                  <span className="font-medium text-red-500">
                    Rs. {activeInvoice.due_amount || "0.00"}
                  </span>
                </div>

                <Button
                  size="sm"
                  className="h-8 gap-1.5 text-xs bg-[#2e4a62] hover:bg-[#1f3242] text-white"
                  disabled={approveInvoice.isPending}
                  onClick={() => handleApprove(activeInvoice)}
                >
                  {approveInvoice.isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  {approveInvoice.isPending ? "Approving…" : "Approve Invoice"}
                </Button>
              </div>
            )}
        </DialogContent>
      </Dialog>
    </>
  );
}
