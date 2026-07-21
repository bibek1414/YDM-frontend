"use client";

import { useState } from "react";
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  AlertTriangle,
} from "lucide-react";
import {
  useCommissionRates,
  useCreateCommissionRate,
  useUpdateCommissionRate,
  useDeleteCommissionRate,
} from "@/src/hooks/use-logistics";
import type { RiderCommissionRate } from "@/src/services/logistics";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

// ─── Form state ──────────────────────────────────────────────────────────────

interface RowForm {
  order_min_count: string;
  order_max_count: string;
  commission_amount: string;
}

const emptyForm: RowForm = {
  order_min_count: "",
  order_max_count: "",
  commission_amount: "",
};

// ─── Component ────────────────────────────────────────────────────────────────

export function CommissionRatesView() {
  const { data: rates, isLoading, isError } = useCommissionRates();
  const { mutate: createRate, isPending: isCreating } =
    useCreateCommissionRate();
  const { mutate: updateRate, isPending: isUpdating } =
    useUpdateCommissionRate();
  const { mutate: deleteRate, isPending: isDeleting } =
    useDeleteCommissionRate();

  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingRate, setEditingRate] = useState<RiderCommissionRate | null>(
    null,
  );
  const [addForm, setAddForm] = useState<RowForm>(emptyForm);
  const [editForm, setEditForm] = useState<RowForm>(emptyForm);

  // Confirm-delete id
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createRate(
      {
        order_min_count: addForm.order_min_count,
        order_max_count:
          addForm.order_max_count.trim() === ""
            ? null
            : addForm.order_max_count,
        commission_amount: addForm.commission_amount,
      },
      {
        onSuccess: () => {
          setIsAddDialogOpen(false);
          setAddForm(emptyForm);
        },
      },
    );
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRate) return;
    updateRate(
      {
        id: editingRate.id,
        data: {
          order_min_count: editForm.order_min_count,
          order_max_count:
            editForm.order_max_count.trim() === ""
              ? null
              : editForm.order_max_count,
          commission_amount: editForm.commission_amount,
        },
      },
      {
        onSuccess: () => {
          setIsEditDialogOpen(false);
          setEditingRate(null);
          setEditForm(emptyForm);
        },
      },
    );
  };

  const openEditDialog = (rate: RiderCommissionRate) => {
    setEditingRate(rate);
    setEditForm({
      order_min_count: rate.order_min_count,
      order_max_count: rate.order_max_count ?? "",
      commission_amount: rate.commission_amount,
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    deleteRate(id, {
      onSuccess: () => setConfirmDeleteId(null),
    });
  };

  // ── Render ───────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-96 mt-1" />
          </div>
          <Skeleton className="h-10 w-28" />
        </div>
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-200 p-4 grid grid-cols-4 gap-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-16 justify-self-end" />
          </div>
          <div className="divide-y divide-gray-100 bg-white">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 grid grid-cols-4 gap-4">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-24" />
                <div className="flex gap-2 justify-self-end">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        Failed to load commission rates. Please refresh and try again.
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Commission Rates
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Define rider commission tiers by order count range.
          </p>
        </div>
        <Button
          onClick={() => {
            setIsAddDialogOpen(true);
            setAddForm(emptyForm);
          }}
          className="bg-[#e8611a] hover:bg-[#d45a18]"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Rate
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Min Orders
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Max Orders
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Commission (Rs.)
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 bg-white">
            {rates && rates.length > 0 ? (
              rates.map((rate) => (
                <tr
                  key={rate.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {Number(rate.order_min_count).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {rate.order_max_count ? (
                      Number(rate.order_max_count).toLocaleString()
                    ) : (
                      <span className="italic text-gray-400">Above</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-800">
                    Rs.{Number(rate.commission_amount).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {confirmDeleteId === rate.id ? (
                      <div className="flex items-center justify-end gap-2">
                        <span className="flex items-center gap-1 text-xs text-red-600">
                          <AlertTriangle className="h-3 w-3" />
                          Confirm delete?
                        </span>
                        <Button
                          onClick={() => handleDelete(rate.id)}
                          disabled={isDeleting}
                          size="sm"
                          variant="destructive"
                          className="h-8"
                        >
                          {isDeleting ? (
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                          ) : (
                            <Trash2 className="h-3 w-3 mr-1" />
                          )}
                          Delete
                        </Button>
                        <Button
                          onClick={() => setConfirmDeleteId(null)}
                          size="sm"
                          variant="outline"
                          className="h-8"
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          onClick={() => openEditDialog(rate)}
                          size="sm"
                          variant="outline"
                          className="h-8"
                        >
                          <Pencil className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          onClick={() => setConfirmDeleteId(rate.id)}
                          size="sm"
                          variant="destructive"
                          className="h-8"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-12 text-center text-sm text-gray-400"
                >
                  No commission rates yet. Click{" "}
                  <button
                    onClick={() => {
                      setIsAddDialogOpen(true);
                      setAddForm(emptyForm);
                    }}
                    className="text-[#e8611a] underline hover:text-[#d45a18]"
                  >
                    Add Rate
                  </button>{" "}
                  to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Commission Rate</DialogTitle>
            <DialogDescription>
              Create a new commission tier for riders based on order count.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="add-min-orders">Min Orders *</Label>
                <Input
                  id="add-min-orders"
                  type="number"
                  step="1"
                  min="1"
                  required
                  placeholder="e.g. 1"
                  value={addForm.order_min_count}
                  onChange={(e) =>
                    setAddForm((f) => ({
                      ...f,
                      order_min_count: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="add-max-orders">Max Orders</Label>
                <Input
                  id="add-max-orders"
                  type="number"
                  step="1"
                  min="1"
                  placeholder="Leave blank for 'Above'"
                  value={addForm.order_max_count}
                  onChange={(e) =>
                    setAddForm((f) => ({
                      ...f,
                      order_max_count: e.target.value,
                    }))
                  }
                />
                <p className="text-xs text-gray-400">
                  Leave blank to indicate no upper limit
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="add-commission">
                  Commission Amount (Rs.) *
                </Label>
                <Input
                  id="add-commission"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  placeholder="0.00"
                  value={addForm.commission_amount}
                  onChange={(e) =>
                    setAddForm((f) => ({
                      ...f,
                      commission_amount: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddDialogOpen(false);
                  setAddForm(emptyForm);
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  isCreating ||
                  !addForm.order_min_count ||
                  !addForm.commission_amount
                }
                className="bg-[#e8611a] hover:bg-[#d45a18]"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Save
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Commission Rate</DialogTitle>
            <DialogDescription>
              Update the commission tier details.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-min-orders">Min Orders *</Label>
                <Input
                  id="edit-min-orders"
                  type="number"
                  step="1"
                  min="1"
                  required
                  value={editForm.order_min_count}
                  onChange={(e) =>
                    setEditForm((f) => ({
                      ...f,
                      order_min_count: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-max-orders">Max Orders</Label>
                <Input
                  id="edit-max-orders"
                  type="number"
                  step="1"
                  min="1"
                  placeholder="Leave blank for 'Above'"
                  value={editForm.order_max_count}
                  onChange={(e) =>
                    setEditForm((f) => ({
                      ...f,
                      order_max_count: e.target.value,
                    }))
                  }
                />
                <p className="text-xs text-gray-400">
                  Leave blank to indicate no upper limit
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-commission">
                  Commission Amount (Rs.) *
                </Label>
                <Input
                  id="edit-commission"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={editForm.commission_amount}
                  onChange={(e) =>
                    setEditForm((f) => ({
                      ...f,
                      commission_amount: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setEditingRate(null);
                  setEditForm(emptyForm);
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isUpdating}
                className="bg-[#e8611a] hover:bg-[#d45a18]"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Update
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
