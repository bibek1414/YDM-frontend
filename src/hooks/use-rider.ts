import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getRiderPackageStats,
  getRiderCommissionStats,
  getRiderDailyStats,
  getRiderOrders,
  getRiderCommissionPayments,
  createRiderPayout,
  getRiders,
} from "@/src/services/rider";
import { toast } from "sonner";

// Query Keys
export const RIDER_QUERY_KEYS = {
  all: ["rider"] as const,
  packages: (startDate?: string, endDate?: string, userId?: string) =>
    [...RIDER_QUERY_KEYS.all, "packages", startDate, endDate, userId] as const,
  commissions: (startDate?: string, endDate?: string, userId?: string) =>
    [...RIDER_QUERY_KEYS.all, "commissions", startDate, endDate, userId] as const,
  dailyStats: (userId?: string) =>
    [...RIDER_QUERY_KEYS.all, "dailyStats", userId] as const,
  orders: (
    page: number,
    pageSize: number,
    startDate?: string,
    endDate?: string,
    status?: string,
    search?: string,
  ) =>
    [
      ...RIDER_QUERY_KEYS.all,
      "orders",
      page,
      pageSize,
      startDate,
      endDate,
      status,
      search,
    ] as const,
  payments: (page?: number, pageSize?: number, userId?: string) => {
    const keys: (string | number)[] = [...RIDER_QUERY_KEYS.all, "payments"];
    if (page !== undefined) keys.push(page);
    if (pageSize !== undefined) keys.push(pageSize);
    if (userId !== undefined) keys.push(userId);
    return keys;
  },
  list: (filters?: {
    search?: string;
    is_active?: boolean;
    page?: number;
    page_size?: number;
  }) => [...RIDER_QUERY_KEYS.all, "list", filters] as const,
};

/**
 * Hook to fetch rider package delivery statistics
 */
export function useRiderPackageStats(
  startDate?: string,
  endDate?: string,
  enabled: boolean = true,
  userId?: string,
) {
  return useQuery({
    queryKey: RIDER_QUERY_KEYS.packages(startDate, endDate, userId),
    queryFn: () => getRiderPackageStats(startDate, endDate, userId),
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  });
}

/**
 * Hook to fetch rider commission statistics
 */
export function useRiderCommissionStats(
  startDate?: string,
  endDate?: string,
  enabled: boolean = true,
  userId?: string,
) {
  return useQuery({
    queryKey: RIDER_QUERY_KEYS.commissions(startDate, endDate, userId),
    queryFn: () => getRiderCommissionStats(startDate, endDate, userId),
    enabled,
    staleTime: 2 * 60 * 1000,
    retry: 2,
  });
}

/**
 * Hook to fetch rider daily order status stats (delivered and returned counts)
 */
export function useRiderDailyStats(enabled: boolean = true, userId?: string) {
  return useQuery({
    queryKey: RIDER_QUERY_KEYS.dailyStats(userId),
    queryFn: () => getRiderDailyStats(userId),
    enabled,
    staleTime: 2 * 60 * 1000,
    retry: 2,
  });
}

/**
 * Hook to fetch rider orders with pagination and filters
 */
export function useRiderOrders(
  page: number = 1,
  pageSize: number = 50,
  startDate?: string,
  endDate?: string,
  status?: string,
  search?: string,
  enabled: boolean = true,
) {
  return useQuery({
    queryKey: RIDER_QUERY_KEYS.orders(
      page,
      pageSize,
      startDate,
      endDate,
      status,
      search,
    ),
    queryFn: () =>
      getRiderOrders(page, pageSize, startDate, endDate, status, search),
    enabled,
    staleTime: 1 * 60 * 1000, // 1 minute
    retry: 2,
    placeholderData: (prev) => prev, // Keep previous data while fetching new page
  });
}

/**
 * Hook to fetch rider commission payment history
 */
export function useRiderCommissionPayments(
  page: number = 1,
  pageSize: number = 10,
  enabled: boolean = true,
  userId?: string,
) {
  return useQuery({
    queryKey: RIDER_QUERY_KEYS.payments(page, pageSize, userId),
    queryFn: () => getRiderCommissionPayments(page, pageSize, userId),
    enabled,
    staleTime: 2 * 60 * 1000,
    retry: 2,
    placeholderData: (prev) => prev,
  });
}

/**
 * Hook to fetch list of riders (admin only)
 */
export function useRiders(filters?: {
  search?: string;
  is_active?: boolean;
  page?: number;
  page_size?: number;
}) {
  return useQuery({
    queryKey: RIDER_QUERY_KEYS.list(filters),
    queryFn: () => getRiders(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

/**
 * Hook to create a new rider payout (admin only)
 */
export function useCreateRiderPayout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      rider,
      amount,
      remarks,
    }: {
      rider: string;
      amount: string;
      remarks?: string;
    }) => createRiderPayout(rider, amount, remarks),
    onSuccess: () => {
      toast.success("Payout recorded successfully");
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: RIDER_QUERY_KEYS.commissions(),
      });
      queryClient.invalidateQueries({
        queryKey: RIDER_QUERY_KEYS.payments(),
      });
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to record payout");
    },
  });
}
