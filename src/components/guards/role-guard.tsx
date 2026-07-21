"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/lib/auth-context";
import { Loader2 } from "lucide-react";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: ("ydm" | "vendor" | "rider")[];
  fallbackUrl?: string;
  showUnauthorized?: boolean;
}

export default function RoleGuard({
  children,
  allowedRoles,
  fallbackUrl = "/dashboard",
  showUnauthorized = true,
}: RoleGuardProps) {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const userRole = user?.role;
  const isAuthorized = userRole && allowedRoles.includes(userRole);

  useEffect(() => {
    if (!isLoading && hasMounted && !isAuthorized) {
      if (!showUnauthorized) {
        router.replace(fallbackUrl);
      }
    }
  }, [isLoading, hasMounted, isAuthorized, router, fallbackUrl, showUnauthorized]);

  // Loading state
  if (isLoading || !hasMounted) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#e8611a]" />
          <p className="text-sm text-gray-500">Checking permissions...</p>
        </div>
      </div>
    );
  }

  // Not authorized
  if (!isAuthorized) {
    if (showUnauthorized) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4 max-w-sm">
            <h2 className="text-2xl font-medium text-gray-900">Access Denied</h2>
            <p className="text-gray-500 text-sm">
              You don&apos;t have permission to access this page.
            </p>
            <div className="bg-gray-50 text-xs text-gray-400 p-3 rounded">
              <p>Required roles: {allowedRoles.join(", ")}</p>
              <p>Your role: {userRole || "unknown"}</p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  }

  // Authorized
  return <>{children}</>;
}
