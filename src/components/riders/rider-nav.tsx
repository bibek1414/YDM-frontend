"use client";

import { Button } from "@/components/ui/button";
import { LayoutDashboard, Package, Wallet } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

export interface RiderNavProps {
  riderId: string;
}

export function RiderNav({ riderId }: RiderNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  const baseHref = `/dashboard/riders/${riderId}`;
  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: baseHref },
    { icon: Package, label: "Orders", href: `${baseHref}/orders` },
    { icon: Wallet, label: "Payout", href: `${baseHref}/payout` },
  ];

  return (
    <header className="shrink-0 flex items-center justify-between bg-white rounded-lg border border-gray-200 px-4 py-2.5 gap-2 mb-4">
      <div className="flex items-center gap-1.5 flex-wrap flex-1">
        {navItems.map((item) => {
          const isActive =
            item.href === baseHref
              ? pathname === baseHref
              : pathname.startsWith(item.href);

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
    </header>
  );
}
