"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Loader2, Key, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { useChangeUserPassword } from "@/src/hooks/use-users";
import type { User } from "@/src/services/users";

interface ChangePasswordDialogProps {
  user: User;
  onSuccess?: () => void;
}

interface FormValues {
  new_password: string;
  confirm_password: string;
}

export function ChangePasswordDialog({ user, onSuccess }: ChangePasswordDialogProps) {
  const [open, setOpen] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const changePassword = useChangeUserPassword();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      new_password: "",
      confirm_password: "",
    },
  });

  const newPasswordVal = watch("new_password");

  function onSubmit(values: FormValues) {
    changePassword.mutate(
      { userId: user.id, newPassword: values.new_password },
      {
        onSuccess: () => {
          setOpen(false);
          reset();
          onSuccess?.();
        },
      }
    );
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      reset();
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    }
    setOpen(next);
  }

  const name =
    user.first_name || user.last_name
      ? `${user.first_name} ${user.last_name}`.trim()
      : user.username;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button variant="outline" size="icon-xs" title="Change Password" />
        }
      >
        <Key className="w-3 h-3 text-[#2e4a62]" />
      </DialogTrigger>

      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold uppercase tracking-wider text-gray-800">
            Change Password
          </DialogTitle>
          <p className="text-xs text-gray-500 mt-1">
            Set a new password for <span className="font-semibold">{name}</span>.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-3">
          <div className="space-y-1.5">
            <Label htmlFor="new_password">New Password</Label>
            <div className="relative">
              <Input
                id="new_password"
                type={showNewPassword ? "text" : "password"}
                placeholder="••••••••"
                {...register("new_password", {
                  required: "New password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
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
            {errors.new_password && (
              <p className="text-[10px] text-red-500">{errors.new_password.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirm_password">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirm_password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                {...register("confirm_password", {
                  required: "Confirm password is required",
                  validate: (val) =>
                    val === newPasswordVal || "Passwords do not match",
                })}
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
            {errors.confirm_password && (
              <p className="text-[10px] text-red-500">{errors.confirm_password.message}</p>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleOpenChange(false)}
              disabled={changePassword.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="bg-[#e8611a] hover:bg-[#d45a18] text-white"
              disabled={changePassword.isPending}
            >
              {changePassword.isPending ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  Saving...
                </>
              ) : (
                "Change Password"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
