"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/src/lib/auth-context";
import { useUpdateUserProfile } from "./profile.queries";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Save, User } from "lucide-react";

export default function ProfileEditView() {
  const { user, isLoading: authLoading, updateUserContext } = useAuth();
  const { mutate: updateProfile, isPending: updatePending } = useUpdateUserProfile();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
    address: "",
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
          <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage your personal profile details.
          </p>
        </div>
      </div>

      <div className="max-w-2xl">
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
    </div>
  );
}
