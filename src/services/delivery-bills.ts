import { api } from "../lib/api";
import { CodPaymentOrderDetail, PaymentOrder, PaymentOrdersResponse } from "./payments";

export interface DeliveryBill {
  id: number;
  bill_number: string;
  transfer_date: string;
  order_count: number;
  delivery_amount: string;
  status: string;
}

export interface GetDeliveryBillsParams {
  status?: string;
  start_date?: string;
  end_date?: string;
}

export interface DeliveryBillsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: DeliveryBill[];
}

export interface DeliveryBillDetail {
  id: number;
  bill_number: string;
  user: number;
  user_detail: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    address: string;
    role: string;
    is_active: boolean;
    is_staff: boolean;
    date_joined: string;
  };
  created_by: number;
  created_by_detail: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    address: string;
    role: string;
    is_active: boolean;
    is_staff: boolean;
    date_joined: string;
  };
  orders: number[];
  orders_detail: CodPaymentOrderDetail[];
  delivery_amount: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export async function getDeliveryBills(
  userId: string | number,
  params?: GetDeliveryBillsParams,
): Promise<DeliveryBillsResponse> {
  const query = new URLSearchParams({ user_id: String(userId) });
  if (params?.status) query.set("status", params.status);
  if (params?.start_date) query.set("start_date", params.start_date);
  if (params?.end_date) query.set("end_date", params.end_date);

  return api.get<DeliveryBillsResponse>(`/api/delivery-bill/?${query.toString()}`);
}

export async function getDeliveryBillOrders(
  userId: string | number,
  params?: GetDeliveryBillsParams,
): Promise<PaymentOrdersResponse> {
  const query = new URLSearchParams({ user_id: String(userId) });
  if (params?.status) query.set("status", params.status);
  if (params?.start_date) query.set("start_date", params.start_date);
  if (params?.end_date) query.set("end_date", params.end_date);

  return api.get<PaymentOrdersResponse>(`/api/delivery-bill/orders/?${query.toString()}`);
}

export async function getDeliveryBillDetail(
  billId: string | number,
): Promise<DeliveryBillDetail> {
  return api.get<DeliveryBillDetail>(`/api/delivery-bill/${billId}/`);
}

export async function getDeliveryBillUnpaidOrders(
  userId: string | number,
  page: number = 1,
  search: string = "",
  start_date?: string,
  end_date?: string,
): Promise<PaymentOrdersResponse> {
  const query = new URLSearchParams({ user_id: String(userId), page: String(page) });
  if (search) query.set("search", search);
  if (start_date) query.set("start_date", start_date);
  if (end_date) query.set("end_date", end_date);
  return api.get<PaymentOrdersResponse>(`/api/delivery-bill/unpaid-orders/?${query.toString()}`);
}

export async function createDeliveryBill(payload: {
  user: number | string;
  orders: number[];
  delivery_amount: number;
}): Promise<any> {
  return api.post<any>("/api/delivery-bill/", payload);
}

export async function deleteDeliveryBill(
  billId: string | number,
): Promise<void> {
  return api.delete(`/api/delivery-bill/${billId}/`);
}

export async function updateDeliveryBill(
  billId: string | number,
  data: Partial<DeliveryBill>,
): Promise<DeliveryBill> {
  return api.patch<DeliveryBill>(`/api/delivery-bill/${billId}/`, data);
}
