"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authApi } from "@/src/lib/api";
import { useAuth } from "@/src/lib/auth-context";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    phone_number: "",
    address: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);
    try {
      const data = await authApi.register(form);
      const token = (data as any).token ?? (data as any).access ?? (data as any).key;
      const user = (data as any).user ?? { email: form.email, first_name: form.first_name, last_name: form.last_name };
      login(token, user);
      router.replace("/dashboard");
    } catch (err: any) {
      setErrors(err ?? { non_field_errors: ["Registration failed. Please try again."] });
    } finally {
      setIsLoading(false);
    }
  };

  const fieldError = (field: string) => errors[field]?.[0];
  const globalError = errors.non_field_errors?.[0] ?? errors.detail?.[0];

  const inputClass = (field: string) =>
    `w-full border rounded px-3 py-2.5 text-sm focus:outline-none focus:border-[#e8611a] transition-colors ${fieldError(field) ? "border-red-300" : "border-gray-200"
    }`;

  return (
    <div className="min-h-screen flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex flex-col justify-between w-[440px] shrink-0 bg-[#1e2d3d] p-12">
        <Link href="/" className="inline-flex">
          <Image src="/ydm-logo.webp" width={100} height={100} alt="YDM" className="brightness-0 invert" />
        </Link>
        <div>
          <h2 className="text-3xl font-medium text-white leading-snug mb-4">
            Join YDM today &<br />
            <span className="text-[#e8611a]">start delivering.</span>
          </h2>
          <p className="text-white/50 text-sm leading-relaxed">
            Create your account and get access to real-time order tracking, rider management, and powerful reporting tools.
          </p>
        </div>
        <p className="text-white/20 text-xs">© {new Date().getFullYear()} YDM</p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-sm py-10">
          {/* Mobile logo */}
          <div className="flex lg:hidden justify-center mb-8">
            <Image src="/ydm-logo.webp" width={80} height={80} alt="YDM" />
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-medium text-black">Create an account</h1>
            <p className="text-sm text-gray-500 mt-1">Fill in your details to get started</p>
          </div>

          {globalError && (
            <div className="mb-4 px-4 py-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded">
              {globalError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="first_name" className="text-xs font-medium text-gray-600">First name</label>
                <input
                  id="first_name"
                  type="text"
                  required
                  value={form.first_name}
                  onChange={set("first_name")}
                  placeholder="John"
                  className={inputClass("first_name")}
                />
                {fieldError("first_name") && <p className="text-xs text-red-500">{fieldError("first_name")}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="last_name" className="text-xs font-medium text-gray-600">Last name</label>
                <input
                  id="last_name"
                  type="text"
                  required
                  value={form.last_name}
                  onChange={set("last_name")}
                  placeholder="Doe"
                  className={inputClass("last_name")}
                />
                {fieldError("last_name") && <p className="text-xs text-red-500">{fieldError("last_name")}</p>}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-xs font-medium text-gray-600">Email address</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={set("email")}
                placeholder="you@example.com"
                className={inputClass("email")}
              />
              {fieldError("email") && <p className="text-xs text-red-500">{fieldError("email")}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-xs font-medium text-gray-600">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={form.password}
                  onChange={set("password")}
                  placeholder="••••••••"
                  className={inputClass("password") + " pr-10"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldError("password") && <p className="text-xs text-red-500">{fieldError("password")}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="phone_number" className="text-xs font-medium text-gray-600">Phone number</label>
              <input
                id="phone_number"
                type="tel"
                required
                value={form.phone_number}
                onChange={set("phone_number")}
                placeholder="98XXXXXXXX"
                className={inputClass("phone_number")}
              />
              {fieldError("phone_number") && <p className="text-xs text-red-500">{fieldError("phone_number")}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="address" className="text-xs font-medium text-gray-600">Address</label>
              <input
                id="address"
                type="text"
                required
                value={form.address}
                onChange={set("address")}
                placeholder="Kathmandu, Nepal"
                className={inputClass("address")}
              />
              {fieldError("address") && <p className="text-xs text-red-500">{fieldError("address")}</p>}
            </div>

            <Button type="submit" disabled={isLoading} className="mt-2 w-full">
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              {isLoading ? "Creating account..." : "Create account"}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-[#e8611a] hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
