"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Users, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/src/lib/auth-context";
import { Sheet, SheetTrigger, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { NotificationDropdown } from "./notification-dropdown";

const navLinks = [
  { href: "/dashboard", label: "Home" },
  { href: "/dashboard/vendors", label: "Vendors", ydmOnly: true },
  { href: "/dashboard/riders", label: "Riders", ydmOnly: true },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isRider = user?.role?.toLowerCase() === "rider";

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-white border-b border-gray-200 shrink-0">
      <div className="mx-auto max-w-screen-xl px-6 flex h-14 items-center gap-6">
        {/* Logo */}
        <Link href="/dashboard" className="shrink-0 flex items-center gap-1.5 mr-4">
          <Image
            src="/ydm-logo.webp"
            width={80}
            height={80}
            alt="YDM logo" />
        </Link>

        {/* Nav Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-1 flex-1">
          {navLinks.filter(link => !link.ydmOnly || user?.role === "ydm").map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-3 py-1.5 text-sm rounded transition-colors relative",
                isActive(link.href)
                  ? "text-black font-bold after:absolute after:bottom-[-13px] after:left-0 after:right-0 after:h-[3px] after:bg-orange-400"
                  : "text-gray-600 hover:text-black font-normal"
              )}
            >
              {link.label}
            </Link>
          ))}

          {/* Rider-only: All Orders link */}
          {isRider && (
            <Link
              href="/dashboard/riders/orders"
              className={cn(
                "px-3 py-1.5 text-sm rounded transition-colors relative",
                isActive("/dashboard/riders/orders")
                  ? "text-black font-bold after:absolute after:bottom-[-13px] after:left-0 after:right-0 after:h-[3px] after:bg-orange-400"
                  : "text-gray-600 hover:text-black font-normal"
              )}
            >
              All Orders
            </Link>
          )}


        </nav>

        {/* Right actions (Desktop) */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          {user?.role === "ydm" && (
            <Button
              variant="ghost"
              onClick={() => router.push("/dashboard/users")}
            >
              <Users className="h-3.5 w-3.5" />
              User Management
            </Button>
          )}
          {(user?.role === "ydm" || user?.role?.toLowerCase() === "rider") && <NotificationDropdown align="right" />}
          <Button variant="outline" onClick={() => { logout(); router.replace("/login"); }}>
            <LogOut className="h-3.5 w-3.5" />
            Logout
          </Button>
          <TooltipProvider delay={100}>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="secondary"
                    onClick={() => {
                      router.push("/dashboard/profile")
                    }}>
                    {(user?.first_name?.charAt(0)?.toUpperCase() ?? "") + (user?.last_name?.charAt(0)?.toUpperCase() ?? "")}
                  </Button>
                }
              />
              <TooltipContent>
                Profile
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Mobile menu trigger */}
        <div className="md:hidden ml-auto flex items-center gap-2">
          {(user?.role === "ydm" || user?.role?.toLowerCase() === "rider") && <NotificationDropdown align="right" />}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Open Menu"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              }
            />
            <SheetContent side="right" className="w-[300px] max-w-[85vw] p-6 flex flex-col justify-between h-full bg-white border-l border-gray-200">
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <SheetTitle className="text-lg font-bold text-gray-800">
                    Menu
                  </SheetTitle>
                </div>

                {/* Mobile Navigation Links */}
                <nav className="flex flex-col gap-3">
                  {navLinks.filter(link => !link.ydmOnly || user?.role === "ydm").map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        "px-3 py-2 text-base rounded-sm transition-colors relative block",
                        isActive(link.href)
                          ? "bg-orange-50 text-orange-600 font-bold border-l-4 border-orange-400 pl-2"
                          : "text-gray-600 hover:text-black font-normal hover:bg-gray-50"
                      )}
                    >
                      {link.label}
                    </Link>
                  ))}

                  {/* Rider-only: All Orders link */}
                  {isRider && (
                    <Link
                      href="/dashboard/riders/orders"
                      className={cn(
                        "px-3 py-2 text-base rounded-sm transition-colors relative block",
                        isActive("/dashboard/riders/orders")
                          ? "bg-orange-50 text-orange-600 font-bold border-l-4 border-orange-400 pl-2"
                          : "text-gray-600 hover:text-black font-normal hover:bg-gray-50"
                      )}
                    >
                      All Orders
                    </Link>
                  )}
                </nav>


              </div>

              {/* Mobile Actions at Bottom */}
              <div className="flex flex-col gap-2 pt-6 border-t border-gray-100 mt-auto">
                {user?.role === "ydm" && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setMobileOpen(false);
                      router.push("/dashboard/users");
                    }}
                    className="justify-start w-full gap-2 px-3 py-2"
                  >
                    <Users className="h-4 w-4" />
                    User Management
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => {
                    setMobileOpen(false);
                    logout();
                    router.replace("/login");
                  }}
                  className="justify-start w-full gap-2 px-3 py-2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

