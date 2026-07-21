import { api } from "../lib/api";
import type {
  RiderPackageStats,
  RiderCommissionStats,
  RiderDailyStat,
  CommissionPaymentResponse,
  RiderFilters,
  RiderResponse,
} from "@/src/types/rider";
import type { PaginatedResponse, Order } from "@/src/services/orders";

const BASE_URL = "/api/rider";

/**
 * Get package delivery statistics for the authenticated rider
 */
export async function getRiderPackageStats(
  startDate?: string,
  endDate?: string,
  userId?: string,
) {
  let url = `${BASE_URL}/packages/stats/`;
  const params = new URLSearchParams();
  if (startDate) params.append("start_date", startDate);
  if (endDate) params.append("end_date", endDate);
  if (userId) params.append("user_id", userId);
  if (params.toString()) url += `?${params.toString()}`;
  return api.get<RiderPackageStats>(url);
}

/**
 * Get commission statistics for the authenticated rider
 */
export async function getRiderCommissionStats(
  startDate?: string,
  endDate?: string,
  userId?: string,
) {
  let url = `${BASE_URL}/commissions/stats/`;
  const params = new URLSearchParams();
  if (startDate) params.append("start_date", startDate);
  if (endDate) params.append("end_date", endDate);
  if (userId) params.append("user_id", userId);
  if (params.toString()) url += `?${params.toString()}`;
  return api.get<RiderCommissionStats>(url);
}

/**
 * Get daily stats for rider (delivered and returned counts by date)
 */
export async function getRiderDailyStats(userId?: string) {
  let url = `${BASE_URL}/daily-stats/`;
  if (userId) url += `?user_id=${encodeURIComponent(userId)}`;
  return api.get<RiderDailyStat[]>(url);
}

/**
 * Get all orders assigned to the authenticated rider with pagination and filters
 */
export async function getRiderOrders(
  page: number = 1,
  pageSize: number = 50,
  startDate?: string,
  endDate?: string,
  status?: string,
  search?: string,
) {
  let url = `${BASE_URL}/orders/?page=${page}&page_size=${pageSize}`;
  if (startDate) url += `&start_date=${encodeURIComponent(startDate)}`;
  if (endDate) url += `&end_date=${encodeURIComponent(endDate)}`;
  if (status) url += `&status=${encodeURIComponent(status)}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  return api.get<PaginatedResponse<Order>>(url);
}

/**
 * Get commission payment history for the authenticated rider
 */
export async function getRiderCommissionPayments(
  page: number = 1,
  pageSize: number = 50,
  userId?: string,
) {
  let url = `${BASE_URL}/payouts/?page=${page}&page_size=${pageSize}`;
  if (userId) url += `&user_id=${encodeURIComponent(userId)}`;
  return api.get<CommissionPaymentResponse>(url);
}

/**
 * Create a new payout/commission payment for a rider (admin only)
 */
export async function createRiderPayout(
  riderPhone: string,
  amount: string,
  remarks?: string,
) {
  return api.post(`${BASE_URL}/payouts/`, {
    rider: riderPhone,
    amount,
    remarks: remarks || "",
  });
}

/**
 * Get riders list with filters (admin only)
 */
export async function getRiders(filters?: RiderFilters) {
  let url = "/api/account/users/?role=YDM_Rider";
  if (filters?.search) {
    url += `&search=${encodeURIComponent(filters.search)}`;
  }
  if (filters?.is_active !== undefined) {
    url += `&is_active=${filters.is_active}`;
  }
  if (filters?.page) {
    url += `&page=${filters.page}`;
  }
  if (filters?.page_size) {
    url += `&page_size=${filters.page_size}`;
  }
  return api.get<RiderResponse>(url);
}
