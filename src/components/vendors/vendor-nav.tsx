"use client";

import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Package,
  RotateCcw,
  Receipt,
  FileBarChart,
  Plus,
  Coins,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

const BASE = "/dashboard";

export interface VendorNavProps {
  vendorId?: string;
}

export function VendorNav({ vendorId }: VendorNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  const baseHref = vendorId ? `/dashboard/vendors/${vendorId}` : BASE;
  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: baseHref },
    {
      icon: Package,
      label: "Orders",
      href: vendorId ? `${baseHref}/orders` : `${BASE}/orders/my-orders`,
    },
    {
      icon: RotateCcw,
      label: "Return Pending",
      href: `${baseHref}/orders/return-pending`,
    },
    { icon: Receipt, label: "Invoice", href: `${baseHref}/invoice` },
    { icon: FileBarChart, label: "Statement", href: `${baseHref}/statement` },
    { icon: Coins, label: "Payments", href: `${baseHref}/payments` },
  ];

  return (
    <header className="shrink-0 flex items-center justify-between bg-white rounded-lg border border-gray-200 px-4 py-2.5 gap-2 mb-4">
      <div className="flex items-center gap-1.5 flex-wrap flex-1">
        {navItems.map((item) => {
          // Check if active: exact match or starts with (avoiding nested route clashes)
          const isActive =
            pathname === item.href ||
            (item.href !== baseHref &&
              pathname.startsWith(item.href) &&
              (item.label !== "Orders" ||
                !pathname.startsWith(`${item.href}/return-pending`)));

          return (
            <Button
              key={item.label}
              onClick={() => router.push(item.href)}
              variant="ghost"
              className={`rounded-md flex items-center gap-2 px-3.5 py-2 transition-all duration-200 text-sm font-medium ${
                isActive
                  ? "bg-[#2e4a62] text-white hover:bg-[#203445] hover:text-white"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/70"
              }`}
            >
              <item.icon
                className={`h-4 w-4 ${
                  isActive ? "text-white" : "text-gray-500"
                }`}
              />
              <span>{item.label}</span>
            </Button>
          );
        })}
      </div>
      {!vendorId && (
        <div className="shrink-0">
          <Button
            onClick={() => router.push(`${BASE}/orders`)}
            className="bg-[#e2722b] hover:bg-[#d0631c] text-white flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-semibold tracking-wider transition-colors duration-200 border-0"
          >
            <Plus className="w-4 h-4" />
            <span className="uppercase">Create Order</span>
          </Button>
        </div>
      )}
    </header>
  );
}
