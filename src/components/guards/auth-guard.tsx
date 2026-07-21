"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/lib/auth-context";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
  fallbackUrl?: string;
}

export default function AuthGuard({
  children,
  fallbackUrl = "/login",
}: AuthGuardProps) {
  const router = useRouter();
  const { token, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !token) {
      router.replace(fallbackUrl);
    }
  }, [token, isLoading, router, fallbackUrl]);

  // While hydrating from localStorage
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#e8611a]" />
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated — return null while redirect happens
  if (!token) {
    return null;
  }

  return <>{children}</>;
}
