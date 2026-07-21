"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Bell, Package, Clock, Trash2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useNotificationSocket } from "@/src/hooks/use-notification-socket";
import { useRiderNotificationSocket } from "@/src/hooks/use-rider-notification-socket";
import { useAuth } from "@/src/lib/auth-context";

function formatRelativeTime(dateString: string) {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    if (isNaN(diffMs)) return "Just now";

    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  } catch (e) {
    return "Just now";
  }
}

export function NotificationDropdown({
  align = "right",
}: {
  align?: "left" | "right";
}) {
  const router = useRouter();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isRider = user?.role?.toLowerCase() === "rider";
  const ydmSocket = useNotificationSocket();
  const riderSocket = useRiderNotificationSocket();

  const {
    notifications,
    unreadCount,
    connected,
    markAsRead,
    markAllAsRead,
    clearAll,
  } = isRider ? riderSocket : ydmSocket;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="icon"
        className="relative p-2"
        onClick={() => {
          const nextState = !isOpen;
          setIsOpen(nextState);
          if (nextState) {
            markAllAsRead();
          }
        }}
      >
        <Bell className="h-5 w-5 text-gray-600 hover:text-black" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white font-sans">
            {unreadCount}
          </span>
        )}
      </Button>
      {isOpen && (
        <div
          className={cn(
            "fixed sm:absolute top-14 sm:top-auto sm:mt-2 left-3 right-3 sm:left-auto w-auto sm:w-96 bg-white border border-gray-200 shadow-2xl rounded-xl sm:rounded-lg z-50 flex flex-col max-h-[80vh] sm:max-h-[500px]",
            align === "right" ? "sm:right-0" : "sm:left-0",
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-800 text-sm">
                Notifications
              </span>
            </div>
            {notifications.length > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  markAllAsRead();
                }}
                className="text-xs text-orange-600 hover:text-orange-700 hover:underline flex items-center gap-1 font-medium bg-transparent border-none cursor-pointer"
              >
                <Check className="h-3.5 w-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto max-h-[350px]">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                <Bell className="h-8 w-8 text-gray-300 mb-2" />
                <p className="text-xs text-gray-500 font-medium">
                  No notifications yet
                </p>
                <p className="text-[10px] text-gray-400 mt-1">
                  Real-time updates will show up here
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => {
                      markAsRead(notif.id);
                      setIsOpen(false);
                      if (isRider) {
                        router.push(`/dashboard/riders/orders`);
                      } else if (notif.userId) {
                        router.push(`/dashboard/vendors/${notif.userId}/orders`);
                      }
                    }}
                    className={cn(
                      "p-3 flex gap-3 hover:bg-gray-50 cursor-pointer transition-colors relative",
                      !notif.read && "bg-orange-50/30",
                    )}
                  >
                    {!notif.read && (
                      <span className="absolute top-4 right-3 h-2 w-2 rounded-full bg-orange-500" />
                    )}
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                        <Package className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 pr-2">
                      <p className="text-xs font-bold text-gray-800 truncate">
                        {notif.title}
                        {!isRider && notif.createdBy && (
                          <span className="text-[11px] font-normal text-gray-500 ml-1.5">
                            by {notif.createdBy}
                          </span>
                        )}
                      </p>
                      <p className="text-[11px] text-gray-600 mt-0.5 leading-relaxed break-words">
                        {notif.message}
                      </p>
                      {isRider && notif.recipientAddress && (
                        <p className="text-[10.5px] text-orange-600 mt-0.5 font-medium flex items-center gap-0.5">
                          <span>📍 Address: {notif.recipientAddress}</span>
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span className="text-[10px] text-gray-400">
                          {formatRelativeTime(notif.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-2 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  clearAll();
                }}
                className="text-[11px] text-red-600 hover:text-red-700 hover:underline flex items-center gap-1 font-medium px-2 py-1 bg-transparent border-none cursor-pointer"
              >
                <Trash2 className="h-3 w-3" />
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
