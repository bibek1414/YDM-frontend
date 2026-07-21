import RoleGuard from "@/src/components/guards/role-guard";
import { StatementsView } from "@/src/components/statements/StatementsView";

export default function VendorStatementPage() {
  return (
    <RoleGuard allowedRoles={["vendor", "ydm"]} showUnauthorized={true}>
      <StatementsView />
    </RoleGuard>
  );
}
