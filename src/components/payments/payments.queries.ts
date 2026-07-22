import {
  getPaymentOrders,
  GetPaymentOrdersParams,
  getCodPayments,
  GetCodPaymentsParams,
} from "@/src/services/payments";
import { useQuery } from "@tanstack/react-query";

export const PAYMENTS_QUERY_KEYS = {
  all: ["payments"] as const,
  detail: (userId: string | number | undefined, params?: GetPaymentOrdersParams) =>
    ["payments", userId, params] as const,
  codPayments: (userId: string | number | undefined, params?: GetCodPaymentsParams) =>
    ["payments", "cod", userId, params] as const,
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
