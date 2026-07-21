import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    getOrdersByVendor,
    getOrderDetailsByVendor,
    getRiderOrders,
    updateRiderOrderStatus,
    UpdateOrderStatusPayload,
    verifyRiderOrder,
    getRidersList,
    assignRider,
    updateOrderDetails,
    UpdateOrderPayload,
    deleteOrder,
    createOrder,
} from "@/src/services/orders";
import { RIDER_QUERY_KEYS } from "@/src/hooks/use-rider";

export const ORDERS_QUERY_KEYS = {
    all: ["orders"] as const,
    byVendor: (id: string, page: number, pageSize: number, search: string, status: string, deliveryLocationType: string, startDate: string, endDate: string, isAssigned: string) => [...ORDERS_QUERY_KEYS.all, "vendor", id, page, pageSize, search, status, deliveryLocationType, startDate, endDate, isAssigned] as const,
    byRider: (page: number, pageSize: number, search: string, status: string) => [...ORDERS_QUERY_KEYS.all, "rider", page, pageSize, search, status] as const,
    detail: (userId: string, trackingNumber: string) => [...ORDERS_QUERY_KEYS.all, "detail", userId, trackingNumber] as const,
};

export function useVendorOrders(
    id: string | undefined,
    page: number = 1,
    pageSize: number = 50,
    search: string = "",
    status: string = "",
    deliveryLocationType: string = "",
    startDate: string = "",
    endDate: string = "",
    isAssigned: string = ""
) {
    return useQuery({
        queryKey: ORDERS_QUERY_KEYS.byVendor(id!, page, pageSize, search, status, deliveryLocationType, startDate, endDate, isAssigned),
        queryFn: () => getOrdersByVendor(id!, page, pageSize, search, status, deliveryLocationType, startDate, endDate, isAssigned),
        enabled: !!id,
    });
}

export function useRiderOrders(page = 1, pageSize = 10, search = "", status = "", enabled = true) {
    return useQuery({
        queryKey: ORDERS_QUERY_KEYS.byRider(page, pageSize, search, status),
        queryFn: () => getRiderOrders(page, pageSize, search, status),
        enabled,
        placeholderData: (prev) => prev, // keep old data while fetching next page
    });
}

export function useRiders() {
    return useQuery({
        queryKey: ORDERS_QUERY_KEYS.all,
        queryFn: () => getRidersList()
    })
}

export function useAssignRider() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ order_ids, rider_id }: { order_ids: string[]; rider_id: string }) =>
            assignRider({ order_ids, rider_id }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEYS.all });
        },
    });
}

export function useCreateOrder() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: any) => createOrder(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEYS.all });
        },
    });
}

export function useDeleteOrder() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (trackingNumber: string) => deleteOrder(trackingNumber),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEYS.all });
        },
    });
}

export function useUpdateRiderOrderStatus() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ trackingNumber, payload }: { trackingNumber: string; payload: UpdateOrderStatusPayload }) =>
            updateRiderOrderStatus(trackingNumber, payload),
        // Optimistically update the order status in cache before the API responds
        onMutate: async ({ trackingNumber, payload }) => {
            // Cancel any in-flight refetches so they don't overwrite our optimistic update
            await queryClient.cancelQueries({ queryKey: [...ORDERS_QUERY_KEYS.all, "rider"] });

            // Snapshot current cached data for rollback on error
            const previousData = queryClient.getQueriesData<{ count: number; next: string; previous: string; results: { tracking_number: string; status: string }[] }>(
                { queryKey: [...ORDERS_QUERY_KEYS.all, "rider"] }
            );

            // Apply optimistic update to every cached rider order page
            queryClient.setQueriesData(
                { queryKey: [...ORDERS_QUERY_KEYS.all, "rider"] },
                (old: { count: number; next: string; previous: string; results: { tracking_number: string; status: string }[] } | undefined) => {
                    if (!old?.results) return old;
                    return {
                        ...old,
                        results: old.results.map((o) =>
                            o.tracking_number === trackingNumber
                                ? { ...o, status: payload.status }
                                : o
                        ),
                    };
                }
            );

            return { previousData };
        },
        onSuccess: () => {
            // Background refetch to sync accurate server state
            queryClient.invalidateQueries({ queryKey: [...ORDERS_QUERY_KEYS.all, "rider"] });
            // Refresh rider stats (package, commission, daily)
            queryClient.invalidateQueries({ queryKey: RIDER_QUERY_KEYS.all });
        },
        onError: (_err, _vars, context) => {
            // Roll back the optimistic update on failure
            if (context?.previousData) {
                context.previousData.forEach(([key, value]) => {
                    queryClient.setQueryData(key, value);
                });
            }
        },
    });
}

export function useVerifyRiderOrder() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ trackingNumber, deliveryLocationType }: { trackingNumber: string; deliveryLocationType: string }) =>
            verifyRiderOrder(trackingNumber, deliveryLocationType),
        onMutate: async ({ trackingNumber, deliveryLocationType }) => {
            await queryClient.cancelQueries({ queryKey: [...ORDERS_QUERY_KEYS.all, "rider"] });

            const previousData = queryClient.getQueriesData<{ count: number; next: string; previous: string; results: { tracking_number: string; is_rider_verified?: boolean; delivery_location_type?: string }[] }>(
                { queryKey: [...ORDERS_QUERY_KEYS.all, "rider"] }
            );

            queryClient.setQueriesData(
                { queryKey: [...ORDERS_QUERY_KEYS.all, "rider"] },
                (old: { count: number; next: string; previous: string; results: { tracking_number: string; is_rider_verified?: boolean; delivery_location_type?: string }[] } | undefined) => {
                    if (!old?.results) return old;
                    return {
                        ...old,
                        results: old.results.map((o) =>
                            o.tracking_number === trackingNumber
                                ? { ...o, is_rider_verified: true, delivery_location_type: deliveryLocationType }
                                : o
                        ),
                    };
                }
            );

            return { previousData };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [...ORDERS_QUERY_KEYS.all, "rider"] });
            queryClient.invalidateQueries({ queryKey: RIDER_QUERY_KEYS.all });
        },
        onError: (_err, _vars, context) => {
            if (context?.previousData) {
                context.previousData.forEach(([key, value]) => {
                    queryClient.setQueryData(key, value);
                });
            }
        },
    });
}

export function useOrderDetails(userId: string | undefined, trackingNumber: string | undefined) {
    return useQuery({
        queryKey: ORDERS_QUERY_KEYS.detail(userId!, trackingNumber!),
        queryFn: () => getOrderDetailsByVendor(trackingNumber!),
        enabled: !!userId && !!trackingNumber,
    });
}

export function useUpdateOrderDetails() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ trackingNumber, data }: { trackingNumber: string; data: UpdateOrderPayload }) =>
            updateOrderDetails(trackingNumber, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEYS.all });
        },
    });
}
