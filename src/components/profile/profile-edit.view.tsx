"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/src/lib/auth-context";
import { useUpdateUserProfile } from "./profile.queries";
import { useChangeUserPassword } from "@/src/hooks/use-users";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Save, User, Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function ProfileEditView() {
  const { user, isLoading: authLoading, updateUserContext } = useAuth();
  const { mutate: updateProfile, isPending: updatePending } = useUpdateUserProfile();
  const changePassword = useChangeUserPassword();

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
    address: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    new_password: "",
    confirm_password: "",
  });

  useEffect(() => {
    if (user) {
      setForm({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        phone_number: user.phone_number || "",
        address: user.address || "",
      });
    }
  }, [user]);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field: keyof typeof passwordForm, value: string) => {
    setPasswordForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.user_id) return;

    updateProfile(
      {
        id: Number(user.user_id),
        data: form,
      },
      {
        onSuccess: (updatedUser) => {
          updateUserContext({
            first_name: updatedUser.first_name,
            last_name: updatedUser.last_name,
            phone_number: updatedUser.phone_number || undefined,
            address: updatedUser.address || undefined,
          });
        },
      }
    );
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
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="space-y-4 max-w-2xl pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-10 w-32 mt-6" />
        </div>
      </div>
    );
  }

  const userInitials =
    (user?.first_name?.charAt(0)?.toUpperCase() ?? "") +
    (user?.last_name?.charAt(0)?.toUpperCase() ?? "");

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center gap-4 pb-6 border-b border-gray-100">
        <div className="h-12 w-12 rounded-full bg-orange-100 text-[#e8611a] flex items-center justify-center font-bold text-lg border border-orange-200">
          {userInitials || <User className="h-6 w-6" />}
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Personal Profile Settings</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage your personal profile details and security settings.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Personal Information */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#2e4a62]">
            Personal Information
          </h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Read-only account info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xs border border-gray-100">
              <div>
                <Label className="text-gray-500 text-xs">Email Address</Label>
                <p className="text-sm font-medium text-gray-800 break-all">{user?.email || "—"}</p>
              </div>
              <div>
                <Label className="text-gray-500 text-xs">Role</Label>
                <p className="text-sm font-medium text-gray-800 capitalize">{user?.role || "—"}</p>
              </div>
            </div>

            {/* First Name & Last Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  required
                  value={form.first_name}
                  onChange={(e) => handleChange("first_name", e.target.value)}
                  placeholder="John"
                  className="focus-visible:ring-0 focus-visible:ring-offset-0 border-gray-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  required
                  value={form.last_name}
                  onChange={(e) => handleChange("last_name", e.target.value)}
                  placeholder="Doe"
                  className="focus-visible:ring-0 focus-visible:ring-offset-0 border-gray-200"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phone_number">Phone Number</Label>
              <Input
                id="phone_number"
                type="tel"
                value={form.phone_number}
                onChange={(e) => handleChange("phone_number", e.target.value)}
                placeholder="9876543210"
                className="focus-visible:ring-0 focus-visible:ring-offset-0 border-gray-200"
              />
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={form.address}
                onChange={(e) => handleChange("address", e.target.value)}
                placeholder="Kathmandu, Nepal"
                className="focus-visible:ring-0 focus-visible:ring-offset-0 border-gray-200"
              />
            </div>

            <div className="pt-4 border-t border-gray-100">
              <Button
                type="submit"
                disabled={updatePending}
                className="bg-[#e8611a] hover:bg-[#d45a18] text-white"
              >
                {updatePending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Right Column: Change Password Card */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xs border border-gray-200 flex flex-col gap-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
            <Lock className="w-4 h-4 text-[#e8611a]" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-800">
              Change Password
            </h3>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="new_profile_password">New Password</Label>
              <div className="relative">
                <Input
                  id="new_profile_password"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={passwordForm.new_password}
                  onChange={(e) => handlePasswordChange("new_password", e.target.value)}
                  className="h-9 pr-10 focus-visible:ring-0 focus-visible:ring-offset-0 border-gray-200"
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

            <div className="space-y-1.5">
              <Label htmlFor="confirm_profile_password">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirm_profile_password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={passwordForm.confirm_password}
                  onChange={(e) => handlePasswordChange("confirm_password", e.target.value)}
                  className="h-9 pr-10 focus-visible:ring-0 focus-visible:ring-offset-0 border-gray-200"
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

            <div className="pt-2 border-t border-gray-100">
              <Button
                type="submit"
                disabled={changePassword.isPending}
                className="w-full bg-[#e8611a] hover:bg-[#d45a18] text-white"
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
      </div>
    </div>
  );
}
