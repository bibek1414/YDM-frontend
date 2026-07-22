import {
  getPaymentOrders,
  GetPaymentOrdersParams,
  getCodPayments,
  GetCodPaymentsParams,
  getUnpaidOrders,
  createCodTransfer,
  getCodPaymentDetail,
  deleteCodTransfer,
} from "@/src/services/payments";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const PAYMENTS_QUERY_KEYS = {
  all: ["payments"] as const,
  detail: (userId: string | number | undefined, params?: GetPaymentOrdersParams) =>
    ["payments", userId, params] as const,
  codPayments: (userId: string | number | undefined, params?: GetCodPaymentsParams) =>
    ["payments", "cod", userId, params] as const,
  unpaidOrders: (userId: string | number | undefined) =>
    ["payments", "unpaid-orders", userId] as const,
  codPaymentDetail: (paymentId: string | number) =>
    ["payments", "cod-detail", paymentId] as const,
};

export function useVendorPaymentOrders(
  userId: string | number | undefined,
  params?: GetPaymentOrdersParams,
) {
  return useQuery({
    queryKey: PAYMENTS_QUERY_KEYS.detail(userId, params),
    queryFn: () => getPaymentOrders(userId as string | number, params),
    enabled: !!userId,
  });
}

export function useVendorCodPayments(
  userId: string | number | undefined,
  params?: GetCodPaymentsParams,
) {
  return useQuery({
    queryKey: PAYMENTS_QUERY_KEYS.codPayments(userId, params),
    queryFn: () => getCodPayments(userId as string | number, params),
    enabled: !!userId,
  });
}

export function useUnpaidOrders(
  userId: string | number | undefined,
  page: number = 1,
  search: string = "",
  start_date?: string,
  end_date?: string,
) {
  return useQuery({
    queryKey: [...PAYMENTS_QUERY_KEYS.unpaidOrders(userId), page, search, start_date, end_date] as const,
    queryFn: () => getUnpaidOrders(userId!, page, search, start_date, end_date),
    enabled: !!userId,
  });
}

export function useCreateCodTransfer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { user: number | string; orders: number[]; total_amount: number }) =>
      createCodTransfer(payload),
    onSuccess: () => {
      toast.success("COD Transfer created successfully");
      queryClient.invalidateQueries({ queryKey: PAYMENTS_QUERY_KEYS.all });
    },
    onError: (error: any) => {
      toast.error(error?.message || error?.detail || "Failed to create COD Transfer");
    },
  });
}

export function useCodPaymentDetail(paymentId: string | number) {
  return useQuery({
    queryKey: PAYMENTS_QUERY_KEYS.codPaymentDetail(paymentId),
    queryFn: () => getCodPaymentDetail(paymentId),
    enabled: !!paymentId,
  });
}

export function useDeleteCodTransfer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (paymentId: string | number) => deleteCodTransfer(paymentId),
    onSuccess: () => {
      toast.success("COD Transfer deleted successfully");
      queryClient.invalidateQueries({ queryKey: PAYMENTS_QUERY_KEYS.all });
    },
    onError: (error: any) => {
      toast.error(error?.message || error?.detail || "Failed to delete COD Transfer");
    },
  });
}

