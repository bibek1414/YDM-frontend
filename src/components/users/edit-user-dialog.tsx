"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Loader2, Pencil } from "lucide-react";
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
import { useUpdateUser } from "@/src/hooks/use-users";
import type { User } from "@/src/services/users";

// ─── Props ────────────────────────────────────────────────────────────────────

interface EditUserDialogProps {
  user: User;
  /** Optional callback after successful update. */
  onSuccess?: () => void;
}

// ─── Form Fields ──────────────────────────────────────────────────────────────

interface FormValues {
  first_name: string;
  last_name: string;
  phone_number: string;
  address: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function EditUserDialog({ user, onSuccess }: EditUserDialogProps) {
  const [open, setOpen] = useState(false);
  const updateUser = useUpdateUser();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    defaultValues: {
      first_name: user.first_name ?? "",
      last_name: user.last_name ?? "",
      phone_number: user.phone_number ?? "",
      address: user.address ?? "",
    },
  });

  // Re-seed form values whenever the user prop changes (e.g. after invalidation)
  useEffect(() => {
    reset({
      first_name: user.first_name ?? "",
      last_name: user.last_name ?? "",
      phone_number: user.phone_number ?? "",
      address: user.address ?? "",
    });
  }, [user, reset]);

  function onSubmit(values: FormValues) {
    updateUser.mutate(
      { id: user.id, data: values },
      {
        onSuccess: () => {
          setOpen(false);
          onSuccess?.();
        },
      }
    );
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      reset({
        first_name: user.first_name ?? "",
        last_name: user.last_name ?? "",
        phone_number: user.phone_number ?? "",
        address: user.address ?? "",
      });
    }
    setOpen(next);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button variant="secondary" size="icon-xs" title="Edit user" />
        }
      >
        <Pencil className="w-3 h-3" />
      </DialogTrigger>

      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <p className="text-xs text-gray-500 mt-0.5">
            {user.email}
          </p>
        </DialogHeader>

        <form
          id="edit-user-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-3 pt-1"
        >
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

          {/* Phone */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-700">Phone</label>
            <Input
              {...register("phone_number")}
              type="tel"
              placeholder="+977 98XXXXXXXX"
            />
          </div>

          {/* Address */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-700">Address</label>
            <Input
              {...register("address")}
              placeholder="Kathmandu, Nepal"
            />
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
            form="edit-user-form"
            size="sm"
            disabled={updateUser.isPending || !isDirty}
            className="min-w-[80px]"
          >
            {updateUser.isPending ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin mr-1" />
                Saving…
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
