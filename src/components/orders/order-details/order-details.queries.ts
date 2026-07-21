import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getOrderDetailsByVendor, postOrderComment } from "@/src/services/orders";

export function useOrderDetails(userId: string | undefined, trackingNumber: string) {
  return useQuery({
    queryKey: ["order-details", userId, trackingNumber],
    queryFn: () => getOrderDetailsByVendor(trackingNumber),
    enabled: !!userId && !!trackingNumber,
  });
}

export function usePostComment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ trackingNumber, comment, userId }: { trackingNumber: string, comment: string, userId: string }) => 
      postOrderComment(trackingNumber, comment, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["order-details"]
      });
    }
  });
}
