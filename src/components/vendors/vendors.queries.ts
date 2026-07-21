import { useQuery } from "@tanstack/react-query";
import {
    getVendors,
    getVendorById,
    getVendorDashboardStats,
    getVendorDashboardDeliveredStats,
    getVendorDashboardPlacedStats,
    type GetVendorsParams,
    getVendorDashboardCompleteStats,
} from "@/src/services/vendors";

export const VENDORS_QUERY_KEYS = {
    all: ["vendors"] as const,
    lists: () => [...VENDORS_QUERY_KEYS.all, "list"] as const,
    list: (params: GetVendorsParams) => [...VENDORS_QUERY_KEYS.lists(), params] as const,
    details: () => [...VENDORS_QUERY_KEYS.all, "detail"] as const,
    detail: (id: string) => [...VENDORS_QUERY_KEYS.details(), id] as const,
    dashboardStats: (id: string) => [...VENDORS_QUERY_KEYS.detail(id), "dashboardStats"] as const,
    dashboardPlacedStats: (id: string) => [...VENDORS_QUERY_KEYS.detail(id), "dashboardPlacedStats"] as const,
    dashboardDeliveredStats: (id: string) => [...VENDORS_QUERY_KEYS.detail(id), "dashboardDeliveredStats"] as const,
    dashboardCompleteStats: (id: string) => [...VENDORS_QUERY_KEYS.detail(id), "dashboardCompleteStats"] as const,
};

export function useVendors(params: GetVendorsParams = {}) {
    return useQuery({
        queryKey: VENDORS_QUERY_KEYS.list(params),
        queryFn: () => getVendors(params),
    });
}

export function useVendor(id: string) {
    return useQuery({
        queryKey: VENDORS_QUERY_KEYS.detail(id),
        queryFn: () => getVendorById(id),
        enabled: !!id,
    });
}

export function useVendorDashboardStats(id: string | undefined) {
    return useQuery({
        queryKey: VENDORS_QUERY_KEYS.dashboardStats(id!),
        queryFn: () => getVendorDashboardStats(id!),
        enabled: !!id,
    });
}

export function useVendorDashboardPlacedStats(id: string | undefined) {
    return useQuery({
        queryKey: VENDORS_QUERY_KEYS.dashboardPlacedStats(id!),
        queryFn: () => getVendorDashboardPlacedStats(id!),
        enabled: !!id,
    });
}

export function useVendorDashboardDeliveredStats(id: string | undefined) {
    return useQuery({
        queryKey: VENDORS_QUERY_KEYS.dashboardDeliveredStats(id!),
        queryFn: () => getVendorDashboardDeliveredStats(id!),
        enabled: !!id,
    });
}

export function useVendorDashboardCompleteStats(id: string | undefined) {
    return useQuery({
        queryKey: VENDORS_QUERY_KEYS.dashboardCompleteStats(id!),
        queryFn: () => getVendorDashboardCompleteStats(id!),
        enabled: !!id,
    })
}
