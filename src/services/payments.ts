import { api } from "../lib/api";

export interface PaymentOrder {
  id: number;
  tracking_number: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_address: string;
  cod: string;
  delivery_charge: number;
  ydm_cancellation_charge: number | null;
  net_amount: number;
  payment_status: string;
  status?: string;
  cod_transferred?: string | number;
  balance?: string | number;
  returned?: string | number;
}

export interface GetPaymentOrdersParams {
  status?: string;
  start_date?: string;
  end_date?: string;
}

export interface PaymentOrdersResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PaymentOrder[];
}

export async function getPaymentOrders(
  userId: string | number,
  params?: GetPaymentOrdersParams,
): Promise<PaymentOrdersResponse> {
  const query = new URLSearchParams({ user_id: String(userId) });
  if (params?.status) query.set("status", params.status);
  if (params?.start_date) query.set("start_date", params.start_date);
  if (params?.end_date) query.set("end_date", params.end_date);

  return api.get<PaymentOrdersResponse>(`/api/payment/orders/?${query.toString()}`);
}

export interface CodPayment {
  id: number;
  payment_number: string;
  transfer_date: string;
  order_count: number;
  amount: string;
  status: string;
}

export interface GetCodPaymentsParams {
  status?: string;
  start_date?: string;
  end_date?: string;
}

export interface CodPaymentsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: CodPayment[];
}

export async function getCodPayments(
  userId: string | number,
  params?: GetCodPaymentsParams,
): Promise<CodPaymentsResponse> {
  const query = new URLSearchParams({ user_id: String(userId) });
  if (params?.status) query.set("status", params.status);
  if (params?.start_date) query.set("start_date", params.start_date);
  if (params?.end_date) query.set("end_date", params.end_date);

  return api.get<CodPaymentsResponse>(`/api/payment/?${query.toString()}`);
}

export async function getUnpaidOrders(
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
  return api.get<PaymentOrdersResponse>(`/api/payment/unpaid-orders/?${query.toString()}`);
}

export async function createCodTransfer(payload: {
  user: number | string;
  orders: number[];
  total_amount: number;
}): Promise<any> {
  return api.post<any>("/api/payment/", payload);
}

export interface CodPaymentOrderDetail {
  tracking_number: string;
  external_order_code: string | null;
  sender_name: string;
  sender_phone: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_address: string;
  recipient_city: string;
  recipient_district: string;
  cod_amount: string;
  delivery_charge: string;
  ydm_delivery_charge: string | null;
  ydm_cancelled_charge: string | null;
  net_amount: number;
  payment_type: string;
  status: string;
  assigned_rider: number | null;
  assigned_rider_name: string;
  is_rider_verified: boolean;
  created_at: string;
  latest_status_comment: string;
}

export interface CodPaymentDetail {
  id: number;
  payment_number: string;
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
  total_amount: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export async function getCodPaymentDetail(paymentId: string | number): Promise<CodPaymentDetail> {
  return api.get<CodPaymentDetail>(`/api/payment/${paymentId}/`);
}

export async function deleteCodTransfer(paymentId: string | number): Promise<void> {
  return api.delete(`/api/payment/${paymentId}/`);
}



