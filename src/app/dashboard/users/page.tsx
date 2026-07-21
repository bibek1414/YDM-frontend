import { UsersView } from "@/src/components/users/users.view";
import RoleGuard from "@/src/components/guards/role-guard";

export default function UsersPage() {
  return (
    <RoleGuard allowedRoles={["ydm"]} showUnauthorized={true}>
      <UsersView />
    </RoleGuard>
  );
}
