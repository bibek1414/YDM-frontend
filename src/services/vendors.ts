import { api } from "@/src/lib/api";

export interface GetVendorsParams {
  search?: string;
  has_new_order?: boolean;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface Vendor {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string | null;
  address: string | null;
  role: string;
  is_active: boolean;
  date_joined: string;
  new_order_count: number;
}

export interface DashboardStat {
  status: string;
  key: string;
  nos: number;
  amount: number;
}

export interface VendorDashboardStats {
  order_processing: DashboardStat[];
  order_dispatched: DashboardStat[];
  order_status: DashboardStat[];
}

export interface VendorDailyPlacedStat {
  date: string;
  placed_count: number;
}

export interface VendorDailyDeliveredStat {
  date: string;
  delivered_count: number;
}

export interface TotalStats {
  nos: number;
  amount: number;
}

export interface LastCodPayment {
  amount: number;
  date: string;
}

export interface VendorCompleteStat {
  overall_statistics: {
    total_order: TotalStats;
    total_cod: TotalStats;
    total_delivered: TotalStats;
    total_rtv: TotalStats;
    total_delivery_charge: TotalStats;
    total_cancellation_charge: TotalStats;
    total_pending_cod: TotalStats;
    last_cod_payment: { amount: number; date: string } | null;
  };
  todays_statistics: {
    todays_orders: number;
    todays_delivery: number;
    todays_rescheduled: number;
    todays_cancellation: number;
  };
  delivery_performance: {
    delivered_percentage: number;
    cancelled_percentage: number;
  };
}

export interface RegeneratedAPIKey {
  message: string,
  api_key: string,
  created_at: string,
}

export interface CurrentAPIKey {
  id: number,
  key: string,
  is_active: boolean,
  expires_at: string,
  created_at: string,
}

export interface WebhookResponse {
  webhook_url: string,
  message: string,
}

export async function getVendors(
  params?: GetVendorsParams,
): Promise<PaginatedResponse<Vendor>> {
  const query = new URLSearchParams();
  if (params?.search) {
    query.append("search", params.search);
  }
  if (params?.has_new_order !== undefined) {
    query.append("has_new_order", String(params.has_new_order));
  }
  const qs = query.toString();
  return api.get<PaginatedResponse<Vendor>>(
    `/api/account/vendors${qs ? `?${qs}` : ""}`,
  );
}

export async function getVendorById(id: string): Promise<Vendor> {
  return api.get<Vendor>(`/api/account/users/${id}/`);
}

export async function getVendorDashboardStats(
  id: string,
): Promise<VendorDashboardStats> {
  return api.get<VendorDashboardStats>(`/api/dashboard?user_id=${id}`);
}

export async function getVendorDashboardPlacedStats(
  id: string,
): Promise<VendorDailyPlacedStat[]> {
  return api.get<VendorDailyPlacedStat[]>(
    `/api/dashboard/daily/placed?user_id=${id}`,
  );
}

export async function getVendorDashboardDeliveredStats(
  id: string,
): Promise<VendorDailyDeliveredStat[]> {
  return api.get<VendorDailyDeliveredStat[]>(
    `/api/dashboard/daily/delivered?user_id=${id}`,
  );
}

export async function getVendorDashboardCompleteStats(
  id: string,
): Promise<VendorCompleteStat> {
  return api.get<VendorCompleteStat>(`/api/dashboard/complete?user_id=${id}`);
}

export async function getApiKey(): Promise<CurrentAPIKey> {
  return api.get<CurrentAPIKey>(`/api/account/api-keys`);
}

export async function regenerateApiKey(): Promise<RegeneratedAPIKey> {
  return api.post(`/api/account/api-keys`, {});
}

export async function registerWebhook(webhookUrl: string): Promise<WebhookResponse> {
  return api.post(`/api/ydm/webhook/`, {
    webhook_url: webhookUrl
  })
}

export async function getCurrentWebhook(): Promise<WebhookResponse> {
  return api.get<WebhookResponse>(`/api/ydm/webhook`)
}
