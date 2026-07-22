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
