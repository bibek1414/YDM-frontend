import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  getInvoiceComments,
  commentOnInvoice,
  getPendingCod,
} from "@/src/services/invoices";
import { toast } from "sonner";

export const INVOICES_QUERY_KEYS = {
  all: ["invoices"] as const,
  byVendor: (id: string) => [...INVOICES_QUERY_KEYS.all, "vendor", id] as const,
  detail: (id: number) => [...INVOICES_QUERY_KEYS.all, "detail", id] as const,
  comments: (id: number) =>
    [...INVOICES_QUERY_KEYS.detail(id), "comments"] as const,
  pendingCod: (id: string) =>
    [...INVOICES_QUERY_KEYS.all, "pendingCod", id] as const,
};

function getErrorMessage(error: any, fallback: string) {
  return error?.message || error?.detail || fallback;
}

export function usePendingCod(userId: string | undefined) {
  return useQuery({
    queryKey: INVOICES_QUERY_KEYS.pendingCod(userId!),
    queryFn: () => getPendingCod(userId!),
    enabled: !!userId,
  });
}

export function useVendorInvoices(id: string | undefined) {
  return useQuery({
    queryKey: INVOICES_QUERY_KEYS.byVendor(id!),
    queryFn: () => getInvoices(id!),
    enabled: !!id,
  });
}

export function useGetInvoiceById(id: number) {
  return useQuery({
    queryKey: INVOICES_QUERY_KEYS.detail(id),
    queryFn: () => getInvoiceById(id),
    enabled: !!id && !isNaN(id),
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Record<string, unknown>) => createInvoice(data),
    onSuccess: () => {
      toast.success("Invoice created successfully");
      queryClient.invalidateQueries({ queryKey: INVOICES_QUERY_KEYS.all });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, "Failed to create invoice"));
    },
  });
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      invoice,
    }: {
      id: number;
      invoice: Record<string, unknown>;
    }) => updateInvoice(id, invoice),
    onSuccess: () => {
      toast.success("Invoice updated successfully");
      queryClient.invalidateQueries({ queryKey: INVOICES_QUERY_KEYS.all });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, "Failed to update invoice"));
    },
  });
}

/**
 * Approves an invoice via PATCH /api/invoices/:id/ with { is_approve: true }.
 * Kept separate from useUpdateInvoice so the approve action gets its own
 * loading state and toast copy, without callers needing to pass a payload.
 */
export function useApproveInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => updateInvoice(id, { is_approved: true }),
    onSuccess: (_data, id) => {
      toast.success("Invoice approved successfully");
      queryClient.invalidateQueries({ queryKey: INVOICES_QUERY_KEYS.all });
      queryClient.invalidateQueries({
        queryKey: INVOICES_QUERY_KEYS.detail(id),
      });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, "Failed to approve invoice"));
    },
  });
}

export function useGetInvoiceComments(id: number) {
  return useQuery({
    queryKey: INVOICES_QUERY_KEYS.comments(id),
    queryFn: () => getInvoiceComments(id),
    enabled: !!id,
  });
}

export function useCommentOnInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, comments }: { id: number; comments: string }) =>
      commentOnInvoice(id, comments),
    onSuccess: (_data, variables) => {
      toast.success("Comment added successfully");
      queryClient.invalidateQueries({
        queryKey: INVOICES_QUERY_KEYS.comments(variables.id),
      });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, "Failed to add comment"));
    },
  });
}
