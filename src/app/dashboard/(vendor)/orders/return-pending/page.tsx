import RoleGuard from "@/src/components/guards/role-guard";
import ReturnPendingView from "@/src/components/orders/return-pending.view";

export default function VendorReturnPendingPage() {
  return (
    <RoleGuard allowedRoles={["vendor", "ydm"]} showUnauthorized={true}>
      <ReturnPendingView />
    </RoleGuard>
  );
}
