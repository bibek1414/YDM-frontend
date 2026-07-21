import { api } from "../lib/api";

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface Invoice {
  id: number;
  invoice_code: string | null;
  total_amount: string | null;
  paid_amount: string | null;
  due_amount: string | null;
  payment_type: "Cash" | "Bank Transfer" | "Cheque";
  status: "Draft" | "Partially Paid" | "Pending" | "Paid";
  is_approved: boolean;
  approved_at: string | null;
  signature: string | null;
  created_at: string;
  updated_at: string;
  user: number;
  user_detail?: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    phone_number: string | null;
    address: string | null;
    role: string;
  };
  created_by: number | null;
  approved_by: number | null;
}

export async function getInvoices(id: string) {
  return api.get<PaginatedResponse<Invoice>>(`/api/invoices?user_id=${id}`);
}

export async function getInvoiceById(id: number) {
  return api.get<Invoice>(`/api/invoices/${id}/`);
}

export async function createInvoice(data: Record<string, unknown>) {
  return api.post<Invoice>(`/api/invoices/`, data);
}

export async function updateInvoice(id: number, data: Record<string, unknown>) {
  return api.patch<Invoice>(`/api/invoices/${id}/`, data);
}

export async function getInvoiceComments(id: number) {
  return api.get<any[]>(`/api/invoices/${id}/comments/`);
}

export async function commentOnInvoice(id: number, comment: string) {
  return api.post<any>(`/api/invoices/${id}/comments/`, { comment });
}

export async function getPendingCod(userId: string) {
  return api.get<any>(`/api/pending-cod?user_id=${userId}`);
}
