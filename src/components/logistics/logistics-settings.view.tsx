"use client";

import { useState, useEffect } from "react";
import { Loader2, Save } from "lucide-react";
import {
  useLogisticsSettings,
  usePatchLogisticsSettings,
} from "@/src/hooks/use-logistics";
import type { YdmLogisticsSetting } from "@/src/services/logistics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";


export function LogisticsSettingsView() {
  const { data, isLoading, isError } = useLogisticsSettings();
  const { mutate: patchSettings, isPending } = usePatchLogisticsSettings();

  const [form, setForm] = useState<YdmLogisticsSetting>({
    inside_ringroad_charge: "",
    outside_ringroad_charge: "",
    cancelled_charge: "",
  });

  useEffect(() => {
    if (data) {
      setForm({
        inside_ringroad_charge: data.inside_ringroad_charge,
        outside_ringroad_charge: data.outside_ringroad_charge,
        cancelled_charge: data.cancelled_charge,
      });
    }
  }, [data]);

  const handleChange = (field: keyof YdmLogisticsSetting, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    patchSettings(form);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-96 mt-1" />
        </div>
        <div className="space-y-6 max-w-2xl pt-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-64" />
            <Skeleton className="h-10 w-full max-w-md" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-64" />
            <Skeleton className="h-10 w-full max-w-md" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-64" />
            <Skeleton className="h-10 w-full max-w-md" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        Failed to load logistics settings. Please refresh and try again.
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Logistics Settings
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Configure YDM delivery charges applied to orders.
        </p>
      </div>

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Inside Ringroad */}
          <div className="space-y-2">
            <Label htmlFor="inside_ringroad_charge">
              Inside Ringroad Charge (Rs.)
            </Label>
            <p className="text-xs text-gray-400">
              YDM delivery charge for inside ringroad deliveries.
            </p>
            <Input
              id="inside_ringroad_charge"
              type="number"
              step="0.01"
              min="0"
              required
              value={form.inside_ringroad_charge}
              onChange={(e) =>
                handleChange("inside_ringroad_charge", e.target.value)
              }
              placeholder="100.00"
              className="max-w-md"
            />
          </div>

          {/* Outside Ringroad */}
          <div className="space-y-2">
            <Label htmlFor="outside_ringroad_charge">
              Outside Ringroad Charge (Rs.)
            </Label>
            <p className="text-xs text-gray-400">
              YDM delivery charge for outside ringroad deliveries.
            </p>
            <Input
              id="outside_ringroad_charge"
              type="number"
              step="0.01"
              min="0"
              required
              value={form.outside_ringroad_charge}
              onChange={(e) =>
                handleChange("outside_ringroad_charge", e.target.value)
              }
              placeholder="150.00"
              className="max-w-md"
            />
          </div>

          {/* Cancelled Charge */}
          <div className="space-y-2">
            <Label htmlFor="cancelled_charge">
              Cancelled / Returned Charge (Rs.)
            </Label>
            <p className="text-xs text-gray-400">
              YDM charge for cancelled or returned deliveries.
            </p>
            <Input
              id="cancelled_charge"
              type="number"
              step="0.01"
              min="0"
              required
              value={form.cancelled_charge}
              onChange={(e) => handleChange("cancelled_charge", e.target.value)}
              placeholder="0.00"
              className="max-w-md"
            />
          </div>

          <div className="pt-2 border-t border-gray-100">
            <Button
              type="submit"
              disabled={isPending}
              className="bg-[#e8611a] hover:bg-[#d45a18]"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving…
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
