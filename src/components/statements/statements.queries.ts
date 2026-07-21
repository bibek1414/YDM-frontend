import { getStatement, GetStatementParams } from "@/src/services/statement";
import { useQuery } from "@tanstack/react-query";

export const STATEMENT_QUERY_KEYS = {
  all: ["statement"] as const,
  detail: (userId: string | number | undefined, params?: GetStatementParams) =>
    ["statement", userId, params] as const,
};

export function useVendorStatement(
  userId: string | number | undefined,
  params?: GetStatementParams,
) {
  return useQuery({
    queryKey: STATEMENT_QUERY_KEYS.detail(userId, params),
    queryFn: () => getStatement(userId as string | number, params),
    enabled: !!userId,
  });
}
