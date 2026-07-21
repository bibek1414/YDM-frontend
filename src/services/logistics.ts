import { api } from "@/src/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface YdmLogisticsSetting {
  inside_ringroad_charge: string;
  outside_ringroad_charge: string;
  cancelled_charge: string;
}

export interface RiderCommissionRate {
  id: number;
  order_min_count: string;
  order_max_count: string | null;
  commission_amount: string;
}

export type CreateCommissionRatePayload = Omit<RiderCommissionRate, "id">;
export type UpdateCommissionRatePayload = Partial<CreateCommissionRatePayload>;

// ─── Logistics Settings (singleton) ──────────────────────────────────────────

export async function getLogisticsSettings(): Promise<YdmLogisticsSetting> {
  return api.get<YdmLogisticsSetting>("/api/settings/");
}

export async function patchLogisticsSettings(
  data: Partial<YdmLogisticsSetting>,
): Promise<YdmLogisticsSetting> {
  return api.patch<YdmLogisticsSetting>("/api/settings/", data);
}

// ─── Rider Commission Rates (CRUD) ───────────────────────────────────────────

export async function getCommissionRates(): Promise<RiderCommissionRate[]> {
  return api.get<RiderCommissionRate[]>("/api/rider/commission-rates/");
}

export async function createCommissionRate(
  data: CreateCommissionRatePayload,
): Promise<RiderCommissionRate> {
  return api.post<RiderCommissionRate>("/api/rider/commission-rates/", data);
}

export async function updateCommissionRate(
  id: number,
  data: UpdateCommissionRatePayload,
): Promise<RiderCommissionRate> {
  return api.patch<RiderCommissionRate>(
    `/api/rider/commission-rates/${id}/`,
    data,
  );
}

export async function deleteCommissionRate(id: number): Promise<void> {
  return api.delete<void>(`/api/rider/commission-rates/${id}/`);
}
