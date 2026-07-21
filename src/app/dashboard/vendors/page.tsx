import { VendorsView } from "@/src/components/vendors/vendors.view";
import RoleGuard from "@/src/components/guards/role-guard";

export default function VendorsPage() {
  return (
    <RoleGuard allowedRoles={["ydm"]} showUnauthorized={true}>
      <VendorsView />
    </RoleGuard>
  );
}
