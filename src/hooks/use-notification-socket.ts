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
  codAmount?: number;
  createdAt: string;
  read: boolean;
  createdBy?: string;
  userId?: number;
  recipientAddress?: string;
}

const LOCAL_STORAGE_KEY = "ydm_notifications";
const MAX_NOTIFICATIONS = 50;

let hasFetchedInitial = false;

export function useNotificationSocket() {
  const { user } = useAuth();
  const userId = user?.user_id || (user as any)?.email;
  const userRole = user?.role;
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fetchedRef = useRef(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        try {
          setNotifications(JSON.parse(stored));
        } catch (e) {
          console.error("Failed to parse notifications", e);
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
    if (!user || user.role !== "ydm") return;
    if (hasFetchedInitial) return;
    hasFetchedInitial = true;
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
        
        return {
          id: String(item.id),
          type: item.notification_type || item.type || "order.placed",
          title: item.title || "New Order Placed",
          message: item.message || (order?.tracking_number ? `Order #${order.tracking_number} placed.` : "New notification"),
          orderId: order?.id,
          trackingNumber: order?.tracking_number,
          recipientName: order?.recipient_name,
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
      console.error("Failed to fetch initial notifications", e);
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

    if (!userRole || userRole !== "ydm") return;
    try {
      await api.post("/api/notifications/bulk-read/?all=true", { all: true });
      console.log("Bulk-read successful.");
    } catch (e) {
      console.error("Failed to mark notifications as read in backend", e);
    }
  }, [userRole]);

  const clearAll = useCallback(() => {
    saveNotifications([]);
  }, [saveNotifications]);

  // Connect function
  const connect = useCallback(() => {
    if (typeof window === "undefined" || !userRole || userRole !== "ydm") return;

    // Determine the base WebSocket URL based on NEXT_PUBLIC_BACKEND_URL
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
    // Replace http/https with ws/wss
    let wsBaseUrl = backendUrl.replace(/^http/, "ws");
    
    // Format trail
    if (wsBaseUrl.endsWith("/")) {
      wsBaseUrl = wsBaseUrl.slice(0, -1);
    }
    
    const wsUrl = `${wsBaseUrl}/ws/notifications/`;
    
    // Retrieve auth token
    const token = localStorage.getItem("ydm_auth_token");
    const finalWsUrl = token ? `${wsUrl}?token=${token}` : wsUrl;

    console.log(`Connecting to WebSocket: ${finalWsUrl}`);
    const socket = new WebSocket(finalWsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("WebSocket connected.");
      setConnected(true);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("WebSocket message received:", data);

        if (data.type === "order.placed" && data.order) {
          const order = data.order;
          
          const newNotif: Notification = {
            id: order.id ? String(order.id) : String(Date.now()),
            type: "order.placed",
            title: "New Order Placed",
            message: `Order #${order.tracking_number} placed by ${order.created_by || "User"} for ${order.recipient_name} (Rs. ${order.cod_amount})`,
            orderId: order.id,
            trackingNumber: order.tracking_number,
            recipientName: order.recipient_name,
            codAmount: order.cod_amount,
            createdAt: order.created_at || new Date().toISOString(),
            read: false,
            createdBy: order.created_by || data.created_by || (data.item ? data.item.created_by : undefined),
            userId: order.user || data.user || (data.item ? data.item.user : undefined),
          };

          // Update state
          setNotifications((prev) => {
            // Avoid duplicate notifications
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
          const toastUserId = order.user || data.user || (data.item ? data.item.user : undefined);
          toast.success("New Order Placed", {
            description: `Order ${order.tracking_number} for ${order.recipient_name} (Rs. ${order.cod_amount})`,
            ...(toastUserId && {
              action: {
                label: "View",
                onClick: () => {
                  if (typeof window !== "undefined") {
                    window.location.href = `/dashboard/vendors/${toastUserId}/orders`;
                  }
                },
              },
            }),
            duration: 8000,
          });
        }
      } catch (e) {
        console.error("Error parsing WebSocket message:", e);
      }
    };

    socket.onclose = (event) => {
      // Only handle close if this socket is still the active socket in reference
      if (socketRef.current !== socket) return;

      console.log("WebSocket disconnected. Code:", event.code, "Reason:", event.reason);
      setConnected(false);
      socketRef.current = null;
      
      // Auto-reconnect after 5 seconds if still logged in as YDM
      if (userRole === "ydm") {
        console.log("Scheduling reconnect in 5 seconds...");
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 5000);
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

  }, [userRole, saveNotifications]);

  // Handle connection/disconnection on component mount or user change
  useEffect(() => {
    if (userRole === "ydm") {
      if (!fetchedRef.current) {
        fetchedRef.current = true;
        fetchInitialNotifications();
      }
      connect();
    } else {
      // Disconnect if user changes or doesn't have YDM role
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      fetchedRef.current = false;
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
  }, [userRole, userId, connect, fetchInitialNotifications]);

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
