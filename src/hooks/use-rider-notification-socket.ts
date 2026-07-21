"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { useAuth } from "@/src/lib/auth-context";
import { api } from "@/src/lib/api";

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  orderId?: number;
  trackingNumber?: string;
  recipientName?: string;
  recipientAddress?: string;
  codAmount?: number;
  createdAt: string;
  read: boolean;
  createdBy?: string;
  userId?: number;
}

const LOCAL_STORAGE_KEY = "ydm_rider_notifications";
const MAX_NOTIFICATIONS = 50;

let hasFetchedInitialRider = false;

export function useRiderNotificationSocket() {
  const { user } = useAuth();
  const riderId = user?.user_id;
  const userRole = user?.role;
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        try {
          setNotifications(JSON.parse(stored));
        } catch (e) {
          console.error("Failed to parse rider notifications", e);
        }
      }
    }
  }, []);

  // Save to localStorage when state changes
  const saveNotifications = useCallback((newNotifs: Notification[]) => {
    setNotifications(newNotifs);
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newNotifs));
    }
  }, []);

  const fetchInitialNotifications = useCallback(async () => {
    if (!user || user.role?.toLowerCase() !== "rider") return;
    if (hasFetchedInitialRider) return;
    hasFetchedInitialRider = true;
    try {
      const data = await api.get<any>("/api/notifications/?is_read=false");
      const items = Array.isArray(data) ? data : (data?.results || []);
      
      const mapped: Notification[] = items.map((item: any) => {
        let parsedData = item.data;
        if (typeof parsedData === "string") {
          try {
            parsedData = JSON.parse(parsedData);
          } catch (e) {}
        }
        const order = parsedData?.order || item.order;
        const recipientAddress = parsedData?.recipient_address || order?.recipient_address;
        
        return {
          id: String(item.id),
          type: item.notification_type || item.type || "order.rider_assigned",
          title: item.title || "Order Assigned",
          message: item.message || (order?.tracking_number ? `You have been assigned to order ${order.tracking_number}.` : "New notification"),
          orderId: order?.id,
          trackingNumber: order?.tracking_number,
          recipientName: order?.recipient_name,
          recipientAddress: recipientAddress,
          codAmount: order?.cod_amount,
          createdAt: item.created_at || new Date().toISOString(),
          read: item.is_read !== undefined ? item.is_read : (item.read || false),
          createdBy: item.created_by,
          userId: item.user,
        };
      });

      setNotifications((prev) => {
        const combined = [...prev];
        mapped.forEach((newNotif) => {
          const isDuplicate = combined.some(
            (n) =>
              n.id === newNotif.id ||
              (n.trackingNumber && newNotif.trackingNumber && n.trackingNumber === newNotif.trackingNumber) ||
              (n.orderId && newNotif.orderId && n.orderId === newNotif.orderId)
          );
          if (!isDuplicate) {
            combined.push(newNotif);
          }
        });
        combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        const sliced = combined.slice(0, MAX_NOTIFICATIONS);
        if (typeof window !== "undefined") {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sliced));
        }
        return sliced;
      });
    } catch (e) {
      console.error("Failed to fetch initial rider notifications", e);
    }
  }, [userRole]);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      if (typeof window !== "undefined") {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      }
      return updated;
    });
  }, []);

  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      if (typeof window !== "undefined") {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      }
      return updated;
    });

    if (!userRole || userRole.toLowerCase() !== "rider") return;
    try {
      await api.post("/api/notifications/bulk-read/?all=true", { all: true });
      console.log("Bulk-read successful.");
    } catch (e) {
      console.error("Failed to mark rider notifications as read in backend", e);
    }
  }, [userRole]);

  const clearAll = useCallback(() => {
    saveNotifications([]);
  }, [saveNotifications]);

  // Connect function
  const connect = useCallback(() => {
    if (typeof window === "undefined" || !userRole || userRole.toLowerCase() !== "rider" || !riderId) return;

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
    let wsBaseUrl = backendUrl.replace(/^http/, "ws");
    
    if (wsBaseUrl.endsWith("/")) {
      wsBaseUrl = wsBaseUrl.slice(0, -1);
    }
    
    const wsUrl = `${wsBaseUrl}/ws/rider/notifications/${riderId}/`;
    
    const token = localStorage.getItem("ydm_auth_token");
    const finalWsUrl = token ? `${wsUrl}?token=${token}` : wsUrl;

    console.log(`Connecting to Rider WebSocket: ${finalWsUrl}`);
    const socket = new WebSocket(finalWsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("Rider WebSocket connected.");
      setConnected(true);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Rider WebSocket message received:", data);

        if (data.type === "order.rider_assigned" && data.order) {
          const order = data.order;
          
          const newNotif: Notification = {
            id: order.notification_id ? String(order.notification_id) : (order.id ? String(order.id) : String(Date.now())),
            type: "order.rider_assigned",
            title: "New Order Assigned",
            message: order.message || `You have been assigned to order ${order.tracking_number}.`,
            orderId: order.id,
            trackingNumber: order.tracking_number,
            recipientName: order.recipient_name,
            codAmount: order.cod_amount,
            createdAt: order.created_at || new Date().toISOString(),
            read: false,
          };

          // Update state
          setNotifications((prev) => {
            const isDuplicate = prev.some(
              (n) =>
                n.id === newNotif.id ||
                (n.trackingNumber && newNotif.trackingNumber && n.trackingNumber === newNotif.trackingNumber) ||
                (n.orderId && newNotif.orderId && n.orderId === newNotif.orderId)
            );
            if (isDuplicate) {
              return prev;
            }
            return [newNotif, ...prev].slice(0, MAX_NOTIFICATIONS);
          });

          // Show Toast notification
          toast.success("New Order Assigned", {
            description: order.message || `Order ${order.tracking_number} assigned.`,
            action: {
              label: "View",
              onClick: () => {
                if (typeof window !== "undefined") {
                  window.location.href = `/dashboard/riders/orders`;
                }
              },
            },
            duration: 8000,
          });
        }
      } catch (e) {
        console.error("Error parsing Rider WebSocket message:", e);
      }
    };

    socket.onclose = (event) => {
      if (socketRef.current !== socket) return;

      console.log("Rider WebSocket disconnected. Code:", event.code, "Reason:", event.reason);
      setConnected(false);
      socketRef.current = null;
      
      if (userRole?.toLowerCase() === "rider") {
        console.log("Scheduling Rider reconnect in 5 seconds...");
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 5000);
      }
    };

    socket.onerror = (error) => {
      console.error("Rider WebSocket error:", error);
    };

  }, [userRole, riderId, saveNotifications]);

  // Handle connection/disconnection on component mount or user change
  useEffect(() => {
    if (userRole?.toLowerCase() === "rider") {
      fetchInitialNotifications();
      connect();
    } else {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      hasFetchedInitialRider = false;
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };
  }, [userRole, riderId, connect, fetchInitialNotifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    unreadCount,
    connected,
    markAsRead,
    markAllAsRead,
    clearAll,
  };
}
