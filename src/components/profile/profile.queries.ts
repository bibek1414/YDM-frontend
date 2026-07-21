import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    getApiKey,
    regenerateApiKey,
    getCurrentWebhook,
    registerWebhook,
} from "@/src/services/vendors";
import { updateUser, UpdateUserPayload } from "@/src/services/users";
import { toast } from "sonner";
import { use } from "react";

export const ORDERS_QUERY_KEYS = {
    all: ["vendors"] as const,
    byVendor: (id: string, page: number, pageSize: number, search: string, status: string, deliveryLocationType: string, startDate: string, endDate: string) => [...ORDERS_QUERY_KEYS.all, "vendor", id, page, pageSize, search, status, deliveryLocationType, startDate, endDate] as const,
    byRider: (page: number, search: string, status: string) => [...ORDERS_QUERY_KEYS.all, "rider", page, search, status] as const,
    detail: (userId: string, trackingNumber: string) => [...ORDERS_QUERY_KEYS.all, "detail", userId, trackingNumber] as const,
};

export function useVendorAPIKey() {
    return useQuery({
        queryKey: ORDERS_QUERY_KEYS.all,
        queryFn: () => getApiKey(),
    });
}

export function useRegenerateAPIKey() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => regenerateApiKey(),
        onSuccess: () => {
            toast.success("API Key regenerated successfully");
            // queryClient.invalidateQueries(ORDERS_QUERY_KEYS.all);
        },
        onError: (error) => {
            toast.error("Failed to regenerate API Key");
        }
    });
}

export function useWebhookUrl() {
    return useQuery({
        queryKey: ["webhook"],
        queryFn: () => getCurrentWebhook(),
    })
}

export function useWebhookMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (webhookUrl: string) => registerWebhook(webhookUrl),
        onSuccess: () => {
            toast.success("Webhook registered successfully");
            queryClient.invalidateQueries({ queryKey: ["webhook"] });
        },
        onError: (error) => {
            toast.error("Failed to register webhook");
        }
    });
}

export function useUpdateUserProfile() {
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateUserPayload }) => updateUser(id, data),
        onSuccess: () => {
            toast.success("Profile updated successfully");
        },
        onError: (error: any) => {
            toast.error(error?.message || "Failed to update profile");
        }
    });
}