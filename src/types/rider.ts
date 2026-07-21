// src/types/rider.ts

export interface RiderPackageStats {
  packages_assigned: number;
  packages_delivered: number;
  total_packages_delivered_lifetime: number;
  total_packages_cancelled_lifetime: number;
}

export interface RiderCommissionStats {
  lifetime_commission_earned: number;
  lifetime_commission_paid: number;
  remaining_balance: number;
}

export interface RiderDailyStat {
  date: string;
  delivered_count: number;
  returned_count: number;
}

export interface RiderDetail {
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

export interface CommissionPayment {
  id: number;
  rider: number;
  rider_detail: RiderDetail;
  amount: string;
  paid_at: string;
  remarks: string;
}

export interface CommissionPaymentResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: CommissionPayment[];
}

export interface RiderFilters {
  search?: string;
  is_active?: boolean;
  page?: number;
  page_size?: number;
}

export interface Rider {
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
  franchise?: string;
}

export interface RiderResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Rider[];
}

// Re-export Order types from orders service
export type { Order, PaginatedResponse } from "@/src/services/orders";
