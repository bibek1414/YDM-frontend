import RoleGuard from "@/src/components/guards/role-guard";
import { PaymentsView } from "@/src/components/payments/PaymentsView";

export default function VendorPaymentsPage() {
  return (
    <RoleGuard allowedRoles={["vendor", "ydm"]} showUnauthorized={true}>
      <PaymentsView />
    </RoleGuard>
  );
}
