import {
  getDeliveryBills,
  GetDeliveryBillsParams,
  getDeliveryBillOrders,
  getDeliveryBillDetail,
  getDeliveryBillUnpaidOrders,
  createDeliveryBill,
  deleteDeliveryBill,
  updateDeliveryBill,
} from "@/src/services/delivery-bills";
import { GetPaymentOrdersParams } from "@/src/services/payments";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const DELIVERY_BILLS_QUERY_KEYS = {
  all: ["delivery-bills"] as const,
  list: (userId: string | number | undefined, params?: GetDeliveryBillsParams) =>
    ["delivery-bills", userId, params] as const,
  orders: (userId: string | number | undefined, params?: GetPaymentOrdersParams) =>
    ["delivery-bills", "orders", userId, params] as const,
  detail: (billId: string | number) =>
    ["delivery-bills", "detail", billId] as const,
  unpaidOrders: (userId: string | number | undefined) =>
    ["delivery-bills", "unpaid-orders", userId] as const,
};

export function useVendorDeliveryBills(
  userId: string | number | undefined,
  params?: GetDeliveryBillsParams,
) {
  return useQuery({
    queryKey: DELIVERY_BILLS_QUERY_KEYS.list(userId, params),
    queryFn: () => getDeliveryBills(userId as string | number, params),
    enabled: !!userId,
  });
}

export function useVendorDeliveryBillOrders(
  userId: string | number | undefined,
  params?: GetPaymentOrdersParams,
) {
  return useQuery({
    queryKey: DELIVERY_BILLS_QUERY_KEYS.orders(userId, params),
    queryFn: () => getDeliveryBillOrders(userId as string | number, params),
    enabled: !!userId,
  });
}

export function useDeliveryBillDetail(billId: string | number) {
  return useQuery({
    queryKey: DELIVERY_BILLS_QUERY_KEYS.detail(billId),
    queryFn: () => getDeliveryBillDetail(billId),
    enabled: !!billId,
  });
}

export function useDeliveryBillUnpaidOrders(
  userId: string | number | undefined,
  page: number = 1,
  search: string = "",
  start_date?: string,
  end_date?: string,
) {
  return useQuery({
    queryKey: [
      ...DELIVERY_BILLS_QUERY_KEYS.unpaidOrders(userId),
      page,
      search,
      start_date,
      end_date,
    ] as const,
    queryFn: () =>
      getDeliveryBillUnpaidOrders(userId!, page, search, start_date, end_date),
    enabled: !!userId,
  });
}

export function useCreateDeliveryBill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      user: number | string;
      orders: number[];
      delivery_amount: number;
    }) => createDeliveryBill(payload),
    onSuccess: () => {
      toast.success("Delivery Bill created successfully");
      queryClient.invalidateQueries({ queryKey: DELIVERY_BILLS_QUERY_KEYS.all });
    },
    onError: (error: any) => {
      toast.error(
        error?.message || error?.detail || "Failed to create Delivery Bill",
      );
    },
  });
}

export function useDeleteDeliveryBill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (billId: string | number) => deleteDeliveryBill(billId),
    onSuccess: () => {
      toast.success("Delivery Bill deleted successfully");
      queryClient.invalidateQueries({ queryKey: DELIVERY_BILLS_QUERY_KEYS.all });
    },
    onError: (error: any) => {
      toast.error(
        error?.message || error?.detail || "Failed to delete Delivery Bill",
      );
    },
  });
}

export function useUpdateDeliveryBill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      billId,
      status,
    }: {
      billId: string | number;
      status: string;
    }) => updateDeliveryBill(billId, { status }),
    onSuccess: () => {
      toast.success("Delivery Bill status updated successfully");
      queryClient.invalidateQueries({ queryKey: DELIVERY_BILLS_QUERY_KEYS.all });
    },
    onError: (error: any) => {
      toast.error(
        error?.message || error?.detail || "Failed to update Delivery Bill",
      );
    },
  });
}
