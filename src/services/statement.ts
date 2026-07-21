import { api } from "../lib/api";

export interface StatementBreakdown {
  delivered_amount: number;
  total_order: number;
  total_amount: number;
  total_charge: number;
  approved_paid: number;
  delivered_count: number;
  cancelled_count: number;
}

export interface StatementEntry {
  date: string;
  total_order: number;
  total_amount: number;
  delivery_count: number;
  cash_in: number;
  delivery_charge: number;
  payment: number;
  balance: number;
}

export interface StatementResults {
  user_id: number;
  start_date: string;
  end_date: string;
  dashboard_pending_cod: number;
  dashboard_breakdown: StatementBreakdown;
  statement: StatementEntry[];
}

export interface StatementResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: StatementResults;
}

export interface GetStatementParams {
  start_date?: string;
  end_date?: string;
}

export async function getStatement(
  userId: string | number,
  params?: GetStatementParams,
) {
  const query = new URLSearchParams({ user_id: String(userId) });
  if (params?.start_date) query.set("start_date", params.start_date);
  if (params?.end_date) query.set("end_date", params.end_date);

  return api.get<StatementResponse>(`/api/user/statement/?${query.toString()}`);
}
