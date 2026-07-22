import { api, downloadFile } from "../lib/api";

export interface PaginatedResponse<T> {
  count: number;
  next: string;
  previous: string;
  results: T[];
}

export interface ChangeLog {
  old_status: string;
  new_status: string;
  comment: string;
  changed_at: string;
  user: number;
  user_name: string;
}

export interface Comment {
  id: number;
  commented_by: number;
  commented_by_name: string;
  commented_by_role: string;
  message: string;
  created_at: string;
}

export interface User {
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
}

export interface Product {
  name: string;
  quantity: number;
}

export interface Order {
  tracking_number: string;
  external_order_code: string;
  project_client: string;
  sender_name: string;
  sender_phone: string;
  sender_address: string;
  sender_email: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_email: string;
  recipient_address: string;
  recipient_city: string;
  recipient_district: string | null;
  cod_amount: string;
  delivery_charge: string;
  payment_type: string;
  product: Product[] | string;
  special_instructions: string;
  status: string;
  remarks: string;
  pickup_date: string | null;
  delivered_at: string | null;
  delivery_attempts: number;
  assigned_rider: number | null;
  assigned_rider_name: string;
  created_at: string;
  updated_at: string;
  change_logs: ChangeLog[];
  comments: Comment[];
  delivery_location_type?: string | null;
  is_rider_verified?: boolean;
  latest_status_comment?: string | null;
  ydm_delivery_charge?: string | null;
  ydm_cancelled_charge?: string | null;
  net_amount?: number | null;
}

export async function getOrdersByVendor(
  id: string,
  page: number = 1,
  pageSize: number = 50,
  search: string = "",
  status: string = "",
  deliveryLocationType: string = "",
  startDate: string = "",
  endDate: string = "",
  isAssigned: string = "",
) {
  let url = `/api/orders/?user_id=${id}&page=${page}&page_size=${pageSize}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  if (status) url += `&status=${encodeURIComponent(status)}`;
  if (deliveryLocationType)
    url += `&delivery_location_type=${encodeURIComponent(deliveryLocationType)}`;
  if (startDate) url += `&start_date=${encodeURIComponent(startDate)}`;
  if (endDate) url += `&end_date=${encodeURIComponent(endDate)}`;
  if (isAssigned) {
    const isAssignedVal = isAssigned === "assigned" ? "true" : "false";
    url += `&is_assigned=${encodeURIComponent(isAssignedVal)}`;
  }

  return api.get<PaginatedResponse<Order>>(url);
}

export async function getAllOrders(
  page: number = 1,
  pageSize: number = 50,
  search: string = "",
  status: string = "",
  startDate?: string,
  endDate?: string,
) {
  let url = `/api/orders/?page=${page}&page_size=${pageSize}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  if (status) url += `&status=${encodeURIComponent(status)}`;
  if (startDate) url += `&start_date=${encodeURIComponent(startDate)}`;
  if (endDate) url += `&end_date=${encodeURIComponent(endDate)}`;
  return api.get<PaginatedResponse<Order>>(url);
}

export async function getOrderDetailsByVendor(tracking_number: string) {
  return api.get<Order>(`/api/orders/${tracking_number}`);
}

export async function deleteOrder(tracking_number: string) {
  return api.delete(`/api/orders/${tracking_number}/`);
}

export async function getRiderOrders(page = 1, pageSize = 10, search = "", status = "") {
  const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
  if (search.trim()) params.set("search", search.trim());
  if (status.trim() && status !== "all") params.set("status", status);
  return api.get<PaginatedResponse<Order>>(
    `/api/rider/orders/?${params.toString()}`,
  );
}

export interface UpdateOrderStatusPayload {
  status: string;
  comment?: string;
}

export async function updateRiderOrderStatus(
  trackingNumber: string,
  payload: UpdateOrderStatusPayload,
) {
  return api.post<Order>(
    `/api/rider/orders/${trackingNumber}/update-status/`,
    payload,
  );
}

export async function verifyRiderOrder(
  trackingNumber: string,
  deliveryLocationType: string,
) {
  return api.post<Order>(`/api/rider/orders/${trackingNumber}/verify/`, {
    delivery_location_type: deliveryLocationType,
  });
}

export async function getRidersList() {
  return api.get<PaginatedResponse<User>>(`/api/account/users/?role=YDM_Rider`);
}

export async function postOrderComment(
  tracking_number: string,
  message: string,
  user_id: string,
) {
  return api.post(`/api/orders/${tracking_number}/comments/`, {
    message: message,
    commented_by: user_id,
  });
}

export async function exportOrders(
  id: string,
  search: string = "",
  status: string = "",
  deliveryLocationType: string = "",
  startDate: string = "",
  endDate: string = "",
  isAssigned: string = "",
) {
  let url = `/api/orders/export/?user_id=${id}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  if (status) url += `&status=${encodeURIComponent(status)}`;
  if (deliveryLocationType)
    url += `&delivery_location_type=${encodeURIComponent(deliveryLocationType)}`;
  if (startDate) url += `&start_date=${encodeURIComponent(startDate)}`;
  if (endDate) url += `&end_date=${encodeURIComponent(endDate)}`;
  if (isAssigned) {
    const isAssignedVal = isAssigned === "assigned" ? "true" : "false";
    url += `&is_assigned=${encodeURIComponent(isAssignedVal)}`;
  }

  return downloadFile(url, "orders-export.xlsx");
}

export async function createOrder(data: any) {
  return api.post("/api/orders/", data);
}

export async function assignRider(data: {
  order_ids: string[];
  rider_id: string;
}) {
  return api.post("/api/orders/assign-rider/", data);
}

export interface UpdateOrderPayload {
  recipient_name?: string;
  recipient_phone?: string;
  recipient_email?: string;
  recipient_address?: string;
  recipient_city?: string;
  recipient_district?: string;
  cod_amount?: string;
  delivery_charge?: string;
  payment_type?: string;
  special_instructions?: string;
  remarks?: string;
  status?: string;
  comment?: string;
}

export async function updateOrderDetails(
  tracking_number: string,
  data: UpdateOrderPayload,
) {
  return api.patch<Order>(`/api/orders/${tracking_number}/`, data);
}
