"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Loader2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateUser } from "@/src/hooks/use-users";
import type { UserRole, CreateUserPayload } from "@/src/services/users";

// ─── Props ────────────────────────────────────────────────────────────────────

interface CreateUserDialogProps {
  /** Pre-selected role. If `roleLocked` is true the select is hidden. */
  defaultRole: UserRole;
  /** When true the user cannot change the role field. */
  roleLocked?: boolean;
  /** Custom label for the trigger button. Defaults to "Create User". */
  triggerLabel?: string;
  /** Optional callback after successful creation. */
  onSuccess?: () => void;
}

// ─── Role label map ───────────────────────────────────────────────────────────

const ROLE_LABELS: Record<UserRole, string> = {
  ydm: "YDM Admin",
  vendor: "Vendor",
  YDM_Rider: "Rider",
};

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: "YDM_Rider", label: "Rider" },
  { value: "vendor", label: "Vendor" },
  { value: "ydm", label: "YDM Admin" },
];

// ─── Form Fields ──────────────────────────────────────────────────────────────

interface FormValues {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone_number: string;
  address: string;
  role: UserRole;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CreateUserDialog({
  defaultRole,
  roleLocked = false,
  triggerLabel,
  onSuccess,
}: CreateUserDialogProps) {
  const [open, setOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const createUser = useCreateUser();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      phone_number: "",
      address: "",
      role: defaultRole,
    },
  });

  const selectedRole = watch("role");

  function onSubmit(values: FormValues) {
    const payload: CreateUserPayload = { ...values };
    createUser.mutate(payload, {
      onSuccess: () => {
        reset();
        setShowPassword(false);
        setOpen(false);
        onSuccess?.();
      },
    });
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      reset();
      setShowPassword(false);
    }
    setOpen(next);
  }

  const buttonLabel =
    triggerLabel ??
    (roleLocked ? `Create ${ROLE_LABELS[defaultRole]}` : "Create User");

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button variant="default" className="flex items-center gap-1.5" />
        }
      >
        <UserPlus className="w-3.5 h-3.5" />
        {buttonLabel}
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {roleLocked
              ? `Create ${ROLE_LABELS[defaultRole]}`
              : "Create New User"}
          </DialogTitle>
        </DialogHeader>

        <form
          id="create-user-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-3 pt-1"
        >
          {/* Role selector — hidden when locked */}
          {!roleLocked && (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-700">Role</label>
              <Select
                value={selectedRole}
                onValueChange={(v) => setValue("role", v as UserRole)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Name row */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-700">
                First Name
              </label>
              <Input
                {...register("first_name", { required: "Required" })}
                placeholder="John"
                aria-invalid={!!errors.first_name}
              />
              {errors.first_name && (
                <span className="text-[10px] text-red-500">
                  {errors.first_name.message}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-700">
                Last Name
              </label>
              <Input
                {...register("last_name", { required: "Required" })}
                placeholder="Doe"
                aria-invalid={!!errors.last_name}
              />
              {errors.last_name && (
                <span className="text-[10px] text-red-500">
                  {errors.last_name.message}
                </span>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-700">Email</label>
            <Input
              {...register("email", {
                required: "Required",
                pattern: { value: /\S+@\S+\.\S+/, message: "Invalid email" },
              })}
              type="email"
              placeholder="user@example.com"
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <span className="text-[10px] text-red-500">
                {errors.email.message}
              </span>
            )}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-700">
              Password
            </label>
            <div className="relative">
              <Input
                {...register("password", {
                  required: "Required",
                  minLength: { value: 6, message: "Min. 6 characters" },
                })}
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="pr-10"
                aria-invalid={!!errors.password}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <span className="text-[10px] text-red-500">
                {errors.password.message}
              </span>
            )}
          </div>

          {/* Phone */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-700">Phone</label>
            <Input
              {...register("phone_number", { required: "Required" })}
              type="tel"
              placeholder="+977 98XXXXXXXX"
              aria-invalid={!!errors.phone_number}
            />
            {errors.phone_number && (
              <span className="text-[10px] text-red-500">
                {errors.phone_number.message}
              </span>
            )}
          </div>

          {/* Address */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-700">Address</label>
            <Input
              {...register("address", { required: "Required" })}
              placeholder="Kathmandu, Nepal"
              aria-invalid={!!errors.address}
            />
            {errors.address && (
              <span className="text-[10px] text-red-500">
                {errors.address.message}
              </span>
            )}
          </div>
        </form>

        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            size="sm"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="create-user-form"
            size="sm"
            disabled={createUser.isPending}
            className="min-w-[100px]"
          >
            {createUser.isPending ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin mr-1" />
                Creating…
              </>
            ) : (
              buttonLabel
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
