"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/src/lib/auth-context";
import { NotificationDropdown } from "../dashboard-layout/notification-dropdown";

const navLinks = [
    { href: "/dashboard", label: "Home" },
    { href: "/dashboard/vendors", label: "Vendors", ydmOnly: true },
    { href: "/dashboard/riders", label: "Riders", ydmOnly: true },
];

export function TrackOrderNavbar() {
    const pathname = usePathname();
    const router = useRouter();
    const { logout, user } = useAuth();

    const isRider = user?.role?.toLowerCase() === "rider";

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

                {/* Nav Links */}
                <nav className="flex items-center gap-1 flex-1">
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

                {/* Right actions */}
                <div className="flex items-center gap-2 shrink-0">
                    {user?.role === "ydm" && (
                        <Button
                            variant="ghost"
                            onClick={() => router.push("/dashboard/users")}
                        >
                            <Users className="h-3.5 w-3.5" />
                            User Management
                        </Button>
                    )}
                    {user?.role === "ydm" && <NotificationDropdown align="right" />}
                    <Button variant="outline" onClick={() => { logout(); router.replace("/login"); }}>
                        <LogOut className="h-3.5 w-3.5" />
                        Logout
                    </Button>
                </div>
            </div>
        </header>
    );
}
