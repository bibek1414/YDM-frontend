"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/src/lib/auth-context";
import { cn } from "@/lib/utils";
import { User, Key, Truck, Percent, Settings, Lock } from "lucide-react";

export default function SettingsProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const pathname = usePathname();

  const menuItems = [
    {
      href: "/dashboard/profile",
      label: "Profile",
      icon: User,
      roles: ["ydm", "vendor", "rider"],
    },
    {
      href: "/dashboard/profile/change-password",
      label: "Change Password",
      icon: Lock,
      roles: ["ydm", "vendor", "rider"],
    },
    {
      href: "/dashboard/profile/api-key",
      label: "API Key",
      icon: Key,
      roles: ["vendor"],
    },
    {
      href: "/dashboard/settings/logistics",
      label: "Logistics",
      icon: Truck,
      roles: ["ydm"],
    },
    {
      href: "/dashboard/settings/commission-rates",
      label: "Commission Rates",
      icon: Percent,
      roles: ["ydm"],
    },
  ];

  const filteredItems = menuItems.filter(
    (item) => !user?.role || item.roles.includes(user.role),
  );

  return (
    <div className="mx-auto w-full max-w-screen-xl px-4 md:px-6 py-6 flex flex-col md:flex-row gap-6">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 shrink-0">
        <div className="bg-white rounded-xs border border-gray-200 p-4 space-y-1">
          <div className="px-3 py-2 flex items-center gap-2">
            <Settings className="h-4 w-4 text-gray-400" />
            <h2 className="text-sm font-semibold">Account & Settings</h2>
          </div>
          <nav className="space-y-1">
            {filteredItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 text-sm rounded-xs transition-colors font-normal",
                    isActive
                      ? "bg-orange-50 text-[#e8611a] font-medium"
                      : "text-gray-600 hover:text-black hover:bg-gray-50",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4",
                      isActive ? "text-[#e8611a]" : "text-gray-400",
                    )}
                  />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 bg-white rounded-xs border border-gray-200 p-6 md:p-8 min-h-[400px]">
        {children}
      </main>
    </div>
  );
}
``;
