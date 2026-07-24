"use client";

import { useState } from "react";
import { useAuth } from "@/src/lib/auth-context";
import { useChangeUserPassword } from "@/src/hooks/use-users";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function ChangePasswordView() {
  const { user, isLoading: authLoading } = useAuth();
  const changePassword = useChangeUserPassword();

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    new_password: "",
    confirm_password: "",
  });

  const handlePasswordChange = (field: keyof typeof passwordForm, value: string) => {
    setPasswordForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.user_id) return;

    if (!passwordForm.new_password) {
      toast.error("New password is required");
      return;
    }

    if (passwordForm.new_password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error("Passwords do not match");
      return;
    }

    changePassword.mutate(
      {
        userId: Number(user.user_id),
        newPassword: passwordForm.new_password,
      },
      {
        onSuccess: () => {
          setPasswordForm({
            new_password: "",
            confirm_password: "",
          });
          setShowNewPassword(false);
          setShowConfirmPassword(false);
        },
      }
    );
  };

  if (authLoading) {
    return (
      <div className="space-y-6 max-w-md">
        <div className="space-y-2">
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
            <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
            <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse mt-6" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4 pb-6 border-b border-gray-100">
        <div className="h-12 w-12 rounded-full bg-orange-100 text-[#e8611a] flex items-center justify-center font-bold text-lg border border-orange-200">
          <Lock className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Change Password</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Update your account password.
          </p>
        </div>
      </div>

      <form onSubmit={handlePasswordSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="new_profile_password">New Password</Label>
          <div className="relative">
            <Input
              id="new_profile_password"
              type={showNewPassword ? "text" : "password"}
              placeholder="••••••••"
              value={passwordForm.new_password}
              onChange={(e) => handlePasswordChange("new_password", e.target.value)}
              className="h-10 pr-10 focus-visible:ring-0 focus-visible:ring-offset-0 border-gray-200"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm_profile_password">Confirm Password</Label>
          <div className="relative">
            <Input
              id="confirm_profile_password"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              value={passwordForm.confirm_password}
              onChange={(e) => handlePasswordChange("confirm_password", e.target.value)}
              className="h-10 pr-10 focus-visible:ring-0 focus-visible:ring-offset-0 border-gray-200"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <Button
            type="submit"
            disabled={changePassword.isPending}
            className="bg-[#e8611a] hover:bg-[#d45a18] text-white px-6"
          >
            {changePassword.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Updating...
              </>
            ) : (
              "Update Password"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
