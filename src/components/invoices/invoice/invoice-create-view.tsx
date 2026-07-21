"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

import SignatureModal from "./signature/SignatureModal";
import {
  useCreateInvoice,
  useUpdateInvoice,
  usePendingCod,
} from "../invoices.queries";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/src/lib/auth-context";

import { downloadInvoicePDF } from "./utils/pdf-generator";
import { SignatureContextProvider } from "./signature/SignatureContext";

interface InvoiceData {
  invoiceCode: string;
  totalAmount: string;
  paidAmount: string;
  dueAmount: string;
  paymentType: "Cash" | "Bank Transfer" | "Cheque";
  status: "Draft" | "Partially Paid" | "Pending" | "Paid" | "Cancelled";
  createdBy: string;
  signedBy: string;
  signatureDate: string;
  notes: string;
  signature?: File | string | null;
}

type Mode = "create" | "edit";

type Props = {
  mode?: Mode;
  initialInvoice?: {
    id: number;
    invoice_code: string;
    total_amount: string;
    paid_amount: string;
    due_amount: string;
    payment_type: "Cash" | "Bank Transfer" | "Cheque" | string;
    status: "Pending" | "Partially Paid" | "Paid" | "Cancelled" | string;
    notes: string;
    signature: string | null;
  } | null;
};

export default function InvoiceCreateView({
  mode = "create",
  initialInvoice,
}: Props) {
  const router = useRouter();
  const params = useParams<{ vendorId?: string; id?: string }>();
  const searchParams = useSearchParams();
  const queryUserId = searchParams.get("user_id");

  const { mutate: createMutate, isPending: isCreating } = useCreateInvoice();
  const { mutate: updateMutate, isPending: isUpdating } = useUpdateInvoice();
  const { user } = useAuth();

  const vendorUserId =
    queryUserId || params?.vendorId || params?.id || user?.user_id;
  const { data: pendingCodData } = usePendingCod(vendorUserId);

  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    invoiceCode: "",
    totalAmount: "",
    paidAmount: "",
    dueAmount: "",
    paymentType: "Cash",
    status: "Draft",
    createdBy: "",
    signedBy: "",
    signatureDate: "",
    notes: "",
    signature: null,
  });

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

  // Prefill in edit mode
  useEffect(() => {
    if (mode === "edit" && initialInvoice) {
      setInvoiceData((prev) => ({
        ...prev,
        invoiceCode: initialInvoice.invoice_code || "",
        totalAmount: initialInvoice.total_amount || "",
        paidAmount: initialInvoice.paid_amount || "",
        dueAmount: initialInvoice.due_amount || "",
        paymentType:
          (initialInvoice.payment_type as InvoiceData["paymentType"]) || "Cash",
        status: (initialInvoice.status as InvoiceData["status"]) || "Draft",
        notes: initialInvoice.notes || "",
        signature: initialInvoice.signature ? getFullSignatureUrl(initialInvoice.signature) : null,
      }));
    }
  }, [mode, initialInvoice]);

  // Prefill total COD in create mode
  useEffect(() => {
    if (mode === "create" && pendingCodData) {
      const pendingCodVal =
        pendingCodData.pending_cod_amount ??
        pendingCodData.pending_cod ??
        pendingCodData.amount ??
        pendingCodData.total_pending_cod ??
        0;
      updateField("totalAmount", pendingCodVal.toString());
    }
  }, [mode, pendingCodData]);

  // Derived signature preview URL for rendering drawn/uploaded signature in the preview
  const [signaturePreviewUrl, setSignaturePreviewUrl] = useState<string>("");
  useEffect(() => {
    // Handle string (e.g., data URL) or File
    if (!invoiceData.signature) {
      setSignaturePreviewUrl("");
      return;
    }

    if (typeof invoiceData.signature === "string") {
      setSignaturePreviewUrl(invoiceData.signature);
      return;
    }

    // File case
    const url = URL.createObjectURL(invoiceData.signature);
    setSignaturePreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [invoiceData.signature]);

  const updateField = (field: keyof InvoiceData, value: string | boolean) => {
    setInvoiceData((prev) => {
      const updated = { ...prev, [field]: value };

      if (field === "totalAmount" || field === "paidAmount") {
        const total =
          Number.parseFloat(
            field === "totalAmount" ? (value as string) : updated.totalAmount,
          ) || 0;
        const paid =
          Number.parseFloat(
            field === "paidAmount" ? (value as string) : updated.paidAmount,
          ) || 0;
        updated.dueAmount = Math.max(0, total - paid).toString();

        if (paid === 0) {
          updated.status = total > 0 ? "Pending" : "Draft";
        } else if (paid >= total && total > 0) {
          updated.status = "Paid";
        } else if (paid > 0 && paid < total) {
          updated.status = "Partially Paid";
        }
      }

      return updated;
    });
  };

  const dataURLtoFile = (dataurl: string, filename: string): File => {
    const arr = dataurl.split(",");
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const handleGenerateInvoice = async () => {
    try {
      const formData = new FormData();
      formData.append("invoice_code", invoiceData.invoiceCode);
      formData.append("total_amount", invoiceData.totalAmount);
      formData.append("paid_amount", invoiceData.paidAmount);
      formData.append("due_amount", invoiceData.dueAmount);
      formData.append("payment_type", invoiceData.paymentType);
      formData.append("status", invoiceData.status);
      formData.append("notes", invoiceData.notes);

      if (vendorUserId) {
        formData.append("user", vendorUserId.toString());
      }

      if (invoiceData.signature) {
        if (invoiceData.signature instanceof File) {
          formData.append("signature", invoiceData.signature);
        } else if (
          typeof invoiceData.signature === "string" &&
          invoiceData.signature.startsWith("data:")
        ) {
          const file = dataURLtoFile(invoiceData.signature, "signature.png");
          formData.append("signature", file);
        }
      }

      if (mode === "edit" && initialInvoice) {
        updateMutate(
          { id: initialInvoice.id, invoice: formData as any },
          {
            onSuccess: () => {
              const dest = vendorUserId
                ? `/dashboard/vendors/${vendorUserId}/invoice`
                : "/dashboard";
              router.push(dest);
            },
          },
        );
      } else {
        createMutate(formData as any, {
          onSuccess: () => {
            const dest = vendorUserId
              ? `/dashboard/vendors/${vendorUserId}/invoice`
              : "/dashboard";
            router.push(dest);
          },
        });
      }
    } catch (e) {
      // errors are surfaced via toast in the mutation onError
      console.error(e);
    }
  };

  const formatCurrency = (amount: string) => {
    const num = Number.parseFloat(amount);
    return isNaN(num)
      ? "Nrs 0.00"
      : `Nrs ${num.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;
  };

  // Auto-generate invoice code in create mode
  useEffect(() => {
    if (mode === "create" && !invoiceData.invoiceCode) {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const date = String(now.getDate()).padStart(2, "0");
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");
      const generatedCode = `INV-${year}${month}${date}-${hours}${minutes}${seconds}`;
      setInvoiceData((prev) => ({ ...prev, invoiceCode: generatedCode }));
    }
  }, [mode, invoiceData.invoiceCode]);

  const handleSignatureChange = (file: File | null) => {
    setInvoiceData((prev) => ({ ...prev, signature: file }));
  };

  const handleDownloadPDF = async () => {
    try {
      let signatureUrl: string | undefined;

      // Convert signature to data URL if it exists
      if (invoiceData.signature) {
        if (typeof invoiceData.signature === "string") {
          signatureUrl = invoiceData.signature;
        } else {
          // Convert File to data URL
          signatureUrl = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(invoiceData.signature as File);
          });
        }
      }

      // Sanitize status for PDF generator which expects limited union
      const pdfData = {
        ...invoiceData,
        status:
          invoiceData.status === "Cancelled"
            ? "Pending"
            : (invoiceData.status as Exclude<
                InvoiceData["status"],
                "Cancelled"
              >),
      } as Omit<InvoiceData, "status"> & {
        status: "Draft" | "Partially Paid" | "Pending" | "Paid";
      };

      await downloadInvoicePDF(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        pdfData as unknown as any,
        signatureUrl || "",
      );
    } catch (error) {
      console.error("Error downloading PDF:", error);
      // You can add toast notification here for error handling
    }
  };
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-2">Invoice</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <FileText className="h-5 w-5" />
                Invoice Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="invoiceCode" className="text-card-foreground">
                    Invoice Code
                  </Label>
                  <Input
                    id="invoiceCode"
                    placeholder="INV-2024-001"
                    value={invoiceData.invoiceCode}
                    onChange={(e) => updateField("invoiceCode", e.target.value)}
                    className="bg-input border-border text-foreground font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-card-foreground">
                    Status
                  </Label>
                  <Select
                    value={invoiceData.status}
                    onValueChange={(value) =>
                      updateField("status", value as InvoiceData["status"])
                    }
                  >
                    <SelectTrigger className="bg-input border-border text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Draft">Draft</SelectItem>
                      <SelectItem value="Partially Paid">
                        Partially Paid
                      </SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Paid">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-card-foreground flex items-center gap-2">
                  Payment Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="totalAmount"
                      className="text-card-foreground"
                    >
                      Total Amount
                    </Label>
                    <Input
                      id="totalAmount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      readOnly
                      value={invoiceData.totalAmount}
                      onChange={(e) =>
                        updateField("totalAmount", e.target.value)
                      }
                      className="bg-input border-border text-foreground font-mono text-lg"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="paidAmount"
                      className="text-card-foreground"
                    >
                      Paid Amount
                    </Label>
                    <Input
                      id="paidAmount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={invoiceData.paidAmount}
                      onChange={(e) =>
                        updateField("paidAmount", e.target.value)
                      }
                      className="bg-input border-border text-foreground font-mono text-lg"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dueAmount" className="text-card-foreground">
                      Due Amount
                    </Label>
                    <Input
                      id="dueAmount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={invoiceData.dueAmount}
                      readOnly
                      className="bg-muted border-border text-muted-foreground font-mono text-lg"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentType" className="text-card-foreground">
                    Payment Type
                  </Label>
                  <Select
                    value={invoiceData.paymentType}
                    onValueChange={(value) =>
                      updateField(
                        "paymentType",
                        value as InvoiceData["paymentType"],
                      )
                    }
                  >
                    <SelectTrigger className="bg-input border-border text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Bank Transfer">
                        Bank Transfer
                      </SelectItem>
                      <SelectItem value="Cheque">Cheque</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-card-foreground">
                  Signature
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <SignatureContextProvider
                      initialSignature={
                        invoiceData.signature
                          ? typeof invoiceData.signature === "string"
                            ? invoiceData.signature
                            : URL.createObjectURL(invoiceData.signature)
                          : ""
                      }
                      onSignatureChange={handleSignatureChange}
                    >
                      <SignatureModal />
                    </SignatureContextProvider>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-card-foreground">
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Additional notes or comments..."
                  value={invoiceData.notes}
                  onChange={(e) => updateField("notes", e.target.value)}
                  className="bg-input border-border text-foreground min-h-[100px]"
                />
              </div>

              <Button
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={handleGenerateInvoice}
                disabled={isCreating || isUpdating}
              >
                {isCreating || isUpdating
                  ? "Saving..."
                  : mode === "edit"
                    ? "Update Invoice"
                    : "Generate Invoice"}
              </Button>
              <Button
                onClick={handleDownloadPDF}
                disabled={isCreating || isUpdating}
              >
                Download Invoice
              </Button>
            </CardContent>
          </Card>

          {/* Live Preview Section */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">
                Live Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-white border-2 border-gray-300 rounded-lg shadow-lg overflow-hidden">
                {/* Company Header */}
                <div className="border-b-4 border-black p-8">
                  <div className="flex justify-between items-start">
                    <div>
                      <h1 className="text-3xl font-bold text-black mb-2">
                        YDM
                      </h1>
                      <p className="text-gray-700 text-sm font-medium uppercase tracking-wide">
                        Professional Business Services
                      </p>
                      <div className="mt-4 space-y-1 text-gray-600 text-sm">
                        <p>Kathmandu, Nepal</p>
                        <p>Phone: +977-981-3492594</p>
                        <p>Email: ydmnepal@gmail.com</p>
                      </div>
                    </div>
                    <div className="text-right border-2 border-black p-4">
                      <h2 className="text-2xl font-bold text-black mb-1 tracking-wider">
                        INVOICE
                      </h2>
                      <p className="text-gray-700 font-mono text-sm font-semibold">
                        {invoiceData.invoiceCode || "INV-XXXX-XXX"}
                      </p>
                      <div className="mt-3">
                        <div className="inline-block border-2 border-gray-400 px-3 py-1 text-xs font-bold uppercase tracking-wide text-gray-700">
                          {invoiceData.status}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Invoice Details */}
                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div>
                      <h3 className="text-lg font-bold text-black mb-3 border-b-2 border-gray-400 pb-2 uppercase tracking-wide">
                        Invoice To
                      </h3>
                      <div className="space-y-2">
                        <p className="text-black font-bold text-lg capitalize">
                          {[user?.first_name, user?.last_name]
                            .filter(Boolean)
                            .join(" ") || "Vendor Name"}
                        </p>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-black mb-3 border-b-2 border-gray-400 pb-2 uppercase tracking-wide">
                        Invoice Details
                      </h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600 text-sm font-medium">
                            Invoice Date:
                          </span>
                          <span className="text-black font-bold text-sm">
                            {new Date().toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 font-medium">
                            Payment Type:
                          </span>
                          <span className="text-black font-bold">
                            {invoiceData.paymentType}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Summary */}
                  <div className="border-2 border-gray-300 bg-gray-50 p-6 mb-6">
                    <h3 className="text-lg font-bold text-black mb-4 uppercase tracking-wide">
                      Payment Summary
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-3 border-b-2 border-gray-300">
                        <span className="text-black font-bold text-lg uppercase tracking-wide">
                          Total Amount
                        </span>
                        <span className="text-3xl font-bold text-black font-mono">
                          {formatCurrency(invoiceData.totalAmount)}
                        </span>
                      </div>

                      {invoiceData.paidAmount &&
                        Number.parseFloat(invoiceData.paidAmount) > 0 && (
                          <div className="flex justify-between items-center py-2 border border-gray-400 bg-white px-3">
                            <span className="font-bold text-gray-700 uppercase tracking-wide">
                              Amount Paid
                            </span>
                            <span className="font-mono font-bold text-lg text-black">
                              {formatCurrency(invoiceData.paidAmount)}
                            </span>
                          </div>
                        )}

                      {invoiceData.dueAmount &&
                        Number.parseFloat(invoiceData.dueAmount) > 0 && (
                          <div className="flex justify-between items-center py-3 border-2 border-black bg-white px-3">
                            <span className="font-bold text-black uppercase tracking-wide text-lg">
                              Amount Due
                            </span>
                            <span className="font-mono font-bold text-xl text-black">
                              {formatCurrency(invoiceData.dueAmount)}
                            </span>
                          </div>
                        )}
                    </div>
                  </div>

                  {/* Notes */}
                  {invoiceData.notes && (
                    <div className="mb-6">
                      <h4 className="text-lg font-bold text-black mb-3 border-b-2 border-gray-400 pb-2 uppercase tracking-wide">
                        Additional Notes
                      </h4>
                      <div className="border-2 border-gray-300 p-4">
                        <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">
                          {invoiceData.notes}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Signature Section */}
                  {(signaturePreviewUrl || invoiceData.signatureDate) && (
                    <div className="border-t-2 border-gray-400 pt-8">
                      <div className="flex justify-between items-end">
                        <div className="flex-1">
                          {signaturePreviewUrl && (
                            <div className="mb-3">
                              <img
                                src={signaturePreviewUrl}
                                alt="Signature"
                                className="h-16 object-contain"
                              />
                            </div>
                          )}
                          <div className="border-b-2 border-black w-64 mb-3"></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="bg-gray-100 px-8 py-4 border-t-2 border-gray-300">
                  <p className="text-center text-gray-700 text-sm font-medium">
                    Thank you for your business. For questions regarding this
                    invoice, please contact us immediately.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
