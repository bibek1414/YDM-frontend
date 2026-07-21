import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getUsers,
  createUser,
  deleteUser,
  patchUser,
  updateUser,
  type GetUsersParams,
  type CreateUserPayload,
  type UpdateUserPayload,
} from "@/src/services/users";

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const USERS_QUERY_KEYS = {
  all: ["users"] as const,
  lists: () => [...USERS_QUERY_KEYS.all, "list"] as const,
  list: (params: GetUsersParams) => [...USERS_QUERY_KEYS.lists(), params] as const,
};

// ─── Hooks ────────────────────────────────────────────────────────────────────

/**
 * Fetch a paginated list of users, optionally filtered by role and/or search.
 */
export function useUsers(params: GetUsersParams = {}) {
  return useQuery({
    queryKey: USERS_QUERY_KEYS.list(params),
    queryFn: () => getUsers(params),
    staleTime: 3 * 60 * 1000,
    retry: 2,
  });
}

/**
 * Create a new user (ydm, vendor, or YDM_Rider).
 */
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserPayload) => createUser(data),
    onSuccess: (_, variables) => {
      const roleLabel =
        variables.role === "YDM_Rider"
          ? "Rider"
          : variables.role === "vendor"
            ? "Vendor"
            : "YDM User";
      toast.success(`${roleLabel} created successfully.`);
      // Invalidate all user list queries so tables refresh
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEYS.lists() });
    },
    onError: (error: any) => {
      const first = error?.email?.[0] ?? error?.phone_number?.[0] ?? error?.detail ?? error?.message;
      toast.error(first || "Failed to create user.");
    },
  });
}

/**
 * Delete a user by ID.
 */
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteUser(id),
    onSuccess: () => {
      toast.success("User deleted.");
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEYS.lists() });
    },
    onError: (error: any) => {
      toast.error(error?.detail || error?.message || "Failed to delete user.");
    },
  });
}

/**
 * Toggle a user's active status.
 */
export function usePatchUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUserPayload }) =>
      patchUser(id, data),
    onSuccess: () => {
      toast.success("User updated.");
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEYS.lists() });
    },
    onError: (error: any) => {
      toast.error(error?.detail || error?.message || "Failed to update user.");
    },
  });
}

/**
 * Edit a user's profile fields.
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUserPayload }) =>
      updateUser(id, data),
    onSuccess: () => {
      toast.success("User updated successfully.");
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEYS.lists() });
    },
    onError: (error: any) => {
      const first = error?.detail || error?.message;
      toast.error(first || "Failed to update user.");
    },
  });
}
