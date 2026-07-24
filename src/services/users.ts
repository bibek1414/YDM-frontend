import { api } from "@/src/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserRole = "ydm" | "vendor" | "YDM_Rider";

export interface User {
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
}

export interface UsersResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: User[];
}

export interface GetUsersParams {
  role?: UserRole | "all";
  search?: string;
  page?: number;
  page_size?: number;
  is_active?: boolean;
}

export interface CreateUserPayload {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  address: string;
  role: UserRole;
}

export interface UpdateUserPayload {
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  address?: string;
  is_active?: boolean;
}

// ─── Service Functions ────────────────────────────────────────────────────────

/**
 * List users from /api/account/users/ with optional role filter and search.
 */
export async function getUsers(params: GetUsersParams = {}): Promise<UsersResponse> {
  const query = new URLSearchParams();
  if (params.role && params.role !== "all") query.append("role", params.role);
  if (params.search) query.append("search", params.search);
  if (params.page) query.append("page", String(params.page));
  if (params.page_size) query.append("page_size", String(params.page_size));
  if (params.is_active !== undefined) query.append("is_active", String(params.is_active));

  const qs = query.toString();
  return api.get<UsersResponse>(`/api/account/users/${qs ? `?${qs}` : ""}`);
}

/**
 * Create a new user via the admin register endpoint.
 * The caller must supply a `role` of "ydm", "vendor", or "YDM_Rider".
 */
export async function createUser(data: CreateUserPayload): Promise<User> {
  return api.post<User>("/api/account/register/", data);
}

/**
 * Delete a user by ID.
 */
export async function deleteUser(id: number): Promise<void> {
  return api.delete<void>(`/api/account/users/${id}/`);
}

/**
 * Toggle user active status via PATCH.
 */
export async function patchUser(id: number, data: UpdateUserPayload): Promise<User> {
  return api.patch<User>(`/api/account/users/${id}/`, data);
}

/**
 * Update editable profile fields for a user.
 */
export async function updateUser(id: number, data: UpdateUserPayload): Promise<User> {
  return api.patch<User>(`/api/account/users/${id}/`, data);
}

/**
 * Change a user's password.
 */
export async function changeUserPassword(
  userId: number,
  newPassword: string,
): Promise<{ detail?: string; message?: string }> {
  return api.patch<{ detail?: string; message?: string }>(
    `/api/account/users/${userId}/change-password/`,
    { new_password: newPassword }
  );
}
