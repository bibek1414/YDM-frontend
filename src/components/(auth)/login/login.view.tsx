"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, LogIn } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { authApi } from "@/src/lib/api";
import { useAuth } from "@/src/lib/auth-context";
import { loginSchema, type LoginFormValues } from "./login.schema";

export function LoginView() {
  const router = useRouter();
  const { login } = useAuth();

  const [form, setForm] = useState<LoginFormValues>({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof LoginFormValues, string>>>({});

  const setField = <K extends keyof LoginFormValues>(key: K, value: LoginFormValues[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    // Clear field error on change
    if (fieldErrors[key]) {
      setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    // Client-side Zod validation
    const result = loginSchema.safeParse(form);
    if (!result.success) {
      const errs: Partial<Record<keyof LoginFormValues, string>> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof LoginFormValues;
        if (!errs[key]) errs[key] = issue.message;
      }
      setFieldErrors(errs);
      return;
    }

    setIsLoading(true);
    try {
      const data = await authApi.login(form.email, form.password);
      const token = (data as any).token ?? (data as any).access ?? (data as any).key;
      const user = (data as any).user ?? { email: form.email, first_name: "", last_name: "" };
      login(token, user);
      toast.success("Signed in successfully");
      router.replace("/dashboard");
    } catch (err: any) {
      const serverErrors: Record<string, string[]> = err ?? {};
      const globalMsg =
        serverErrors.non_field_errors?.[0] ??
        serverErrors.detail?.[0] ??
        "Login failed. Please try again.";
      // Also surface any per-field server errors
      const newFieldErrors: Partial<Record<keyof LoginFormValues, string>> = {};
      if (serverErrors.email?.[0]) newFieldErrors.email = serverErrors.email[0];
      if (serverErrors.password?.[0]) newFieldErrors.password = serverErrors.password[0];
      setFieldErrors(newFieldErrors);
      toast.error(globalMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex flex-col justify-between w-[440px] shrink-0 bg-[#1e2d3d] p-12">
        <Link href="/" className="inline-flex">
          <Image src="/ydm-logo.webp" width={100} height={100} alt="YDM" className="brightness-0 invert" />
        </Link>
        <div>
          <h2 className="text-3xl font-medium text-white leading-snug mb-4">
            Manage your deliveries<br />
            <span className="text-[#e8611a]">smarter.</span>
          </h2>
          <p className="text-white/50 text-sm leading-relaxed">
            Track orders, manage riders, and grow your logistics business — all from one dashboard.
          </p>
        </div>
        <p className="text-white/20 text-xs">© {new Date().getFullYear()} YDM</p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex lg:hidden justify-center mb-8">
            <Image src="/ydm-logo.webp" width={80} height={80} alt="YDM" />
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-medium text-black">Welcome back</h1>
            <p className="text-sm text-gray-500 mt-1">Sign in to your YDM account</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-xs font-medium text-gray-600">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
                placeholder="you@example.com"
                className={`w-full border rounded px-3 py-2.5 text-sm focus:outline-none focus:border-[#e8611a] transition-colors ${
                  fieldErrors.email ? "border-red-300" : "border-gray-200"
                }`}
              />
              {fieldErrors.email && (
                <p className="text-xs text-red-500">{fieldErrors.email}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-xs font-medium text-gray-600">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={form.password}
                  onChange={(e) => setField("password", e.target.value)}
                  placeholder="••••••••"
                  className={`w-full border rounded px-3 py-2.5 pr-10 text-sm focus:outline-none focus:border-[#e8611a] transition-colors ${
                    fieldErrors.password ? "border-red-300" : "border-gray-200"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-xs text-red-500">{fieldErrors.password}</p>
              )}
            </div>

            <Button type="submit" disabled={isLoading} className="mt-2 w-full">
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-[#e8611a] hover:underline font-medium">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
