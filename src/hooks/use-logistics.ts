import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getLogisticsSettings,
  patchLogisticsSettings,
  getCommissionRates,
  createCommissionRate,
  updateCommissionRate,
  deleteCommissionRate,
} from "@/src/services/logistics";
import type {
  YdmLogisticsSetting,
  CreateCommissionRatePayload,
  UpdateCommissionRatePayload,
} from "@/src/services/logistics";

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const LOGISTICS_QUERY_KEYS = {
  all: ["logistics"] as const,
  settings: () => [...LOGISTICS_QUERY_KEYS.all, "settings"] as const,
  commissionRates: () =>
    [...LOGISTICS_QUERY_KEYS.all, "commission-rates"] as const,
};

// ─── Logistics Settings ───────────────────────────────────────────────────────

/**
 * Fetch the singleton logistics settings object.
 */
export function useLogisticsSettings(enabled = true) {
  return useQuery({
    queryKey: LOGISTICS_QUERY_KEYS.settings(),
    queryFn: getLogisticsSettings,
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

/**
 * PATCH the logistics settings singleton.
 */
export function usePatchLogisticsSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<YdmLogisticsSetting>) =>
      patchLogisticsSettings(data),
    onSuccess: () => {
      toast.success("Logistics settings saved successfully.");
      queryClient.invalidateQueries({
        queryKey: LOGISTICS_QUERY_KEYS.settings(),
      });
    },
    onError: (error: any) => {
      const msg =
        error?.detail ||
        error?.message ||
        "Failed to save logistics settings.";
      toast.error(msg);
    },
  });
}

// ─── Commission Rates ─────────────────────────────────────────────────────────

/**
 * Fetch the list of all commission rate tiers.
 */
export function useCommissionRates(enabled = true) {
  return useQuery({
    queryKey: LOGISTICS_QUERY_KEYS.commissionRates(),
    queryFn: getCommissionRates,
    enabled,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

/**
 * Create a new commission rate tier.
 */
export function useCreateCommissionRate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCommissionRatePayload) =>
      createCommissionRate(data),
    onSuccess: () => {
      toast.success("Commission rate created.");
      queryClient.invalidateQueries({
        queryKey: LOGISTICS_QUERY_KEYS.commissionRates(),
      });
    },
    onError: (error: any) => {
      const msg =
        error?.detail || error?.message || "Failed to create commission rate.";
      toast.error(msg);
    },
  });
}

/**
 * Update an existing commission rate tier.
 */
export function useUpdateCommissionRate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCommissionRatePayload }) =>
      updateCommissionRate(id, data),
    onSuccess: () => {
      toast.success("Commission rate updated.");
      queryClient.invalidateQueries({
        queryKey: LOGISTICS_QUERY_KEYS.commissionRates(),
      });
    },
    onError: (error: any) => {
      const msg =
        error?.detail || error?.message || "Failed to update commission rate.";
      toast.error(msg);
    },
  });
}

/**
 * Delete a commission rate tier.
 */
export function useDeleteCommissionRate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteCommissionRate(id),
    onSuccess: () => {
      toast.success("Commission rate deleted.");
      queryClient.invalidateQueries({
        queryKey: LOGISTICS_QUERY_KEYS.commissionRates(),
      });
    },
    onError: (error: any) => {
      const msg =
        error?.detail || error?.message || "Failed to delete commission rate.";
      toast.error(msg);
    },
  });
}
