"use client";

import { useOrderDetails, usePostComment } from "./order-details.queries";
import { useAuth } from "@/src/lib/auth-context";
import {
    Package,
    User,
    MapPin,
    Truck,
    MessageSquare,
    CheckCircle2,
    Loader2,
    PackageOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Product } from "@/src/services/orders";
import Image from "next/image";

interface OrderDetailsViewProps {
    trackingNumber: string;
}

export function OrderDetailsView({ trackingNumber }: OrderDetailsViewProps) {
    const { user, isLoading: authLoading } = useAuth();
    const {
        data: order,
        isLoading: queryLoading,
        error,
    } = useOrderDetails(user?.user_id, trackingNumber);

    // TypeScript-safe handling for products
    let products: string[] | Product[] | undefined;
    if (order?.product && typeof order.product === "string") {
        const products_list = order.product.split(",");
        products = products_list.map((item) => {
            const [name, quantity] = item.split("-");
            return { name, quantity: parseInt(quantity) };
        });
    } else {
        products = order?.product as Product[];
    }

    const isLoading = authLoading || queryLoading || !user;
    const [commentText, setCommentText] = useState("");
    const postCommentMutation = usePostComment();

    const handlePostComment = () => {
        if (!commentText.trim() || !user?.user_id) return;
        postCommentMutation.mutate(
            { trackingNumber, comment: commentText, userId: user.user_id },
            {
                onSuccess: () => setCommentText(""),
            },
        );
    };

    if (isLoading) {
        return (
            <div className="max-w-5xl mx-auto w-full flex flex-col gap-6 py-4 sm:py-8 px-4 sm:px-0 animate-pulse">
                {/* Header skeleton */}
                <div className="flex justify-center">
                    <div className="h-6 bg-gray-200 rounded w-48" />
                </div>

                {/* Timeline skeleton */}
                <div className="flex flex-col sm:flex-row justify-between items-center bg-gray-100 p-4 sm:p-6 rounded-sm border border-gray-200 gap-4 sm:gap-6">
                    <div className="flex flex-col items-center sm:items-start flex-1 gap-2">
                        <div className="h-2.5 bg-gray-200 rounded w-20" />
                        <div className="h-4 bg-gray-200 rounded w-36" />
                        <div className="h-3 bg-gray-200 rounded w-28" />
                    </div>
                    <div className="flex flex-col items-center flex-1 gap-2">
                        <div className="h-8 bg-gray-200 rounded w-24" />
                        <div className="h-4 bg-gray-200 rounded w-28" />
                    </div>
                    <div className="flex flex-col items-center sm:items-end flex-1 gap-2">
                        <div className="h-2.5 bg-gray-200 rounded w-20" />
                        <div className="h-4 bg-gray-200 rounded w-36" />
                        <div className="h-3 bg-gray-200 rounded w-28" />
                    </div>
                </div>

                {/* Detail cards skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2].map((n) => (
                        <div
                            key={n}
                            className="bg-white p-4 sm:p-6 rounded-sm border border-gray-200 space-y-4"
                        >
                            <div className="h-3 bg-gray-200 rounded w-32" />
                            {[1, 2, 3, 4, 5].map((r) => (
                                <div
                                    key={r}
                                    className="grid grid-cols-[80px_1fr] sm:grid-cols-[100px_1fr] gap-2 sm:gap-3"
                                >
                                    <div className="h-3 bg-gray-200 rounded" />
                                    <div className="h-3 bg-gray-200 rounded" />
                                </div>
                            ))}
                        </div>
                    ))}
                </div>

                {/* Product / Finance skeleton */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 border border-gray-200 p-4">
                    {[1, 2].map((n) => (
                        <div
                            key={n}
                            className="bg-white rounded-sm border border-gray-200 p-4 sm:p-6 space-y-3"
                        >
                            <div className="h-3 bg-gray-200 rounded w-28" />
                            {[1, 2, 3].map((r) => (
                                <div key={r} className="h-3 bg-gray-200 rounded" />
                            ))}
                        </div>
                    ))}
                </div>

                {/* Status log skeleton */}
                <div className="bg-white rounded-sm border border-gray-200 p-4 sm:p-6 space-y-4 overflow-x-auto">
                    <div className="h-3 bg-gray-200 rounded w-40" />
                    {[1, 2, 3].map((r) => (
                        <div
                            key={r}
                            className="grid grid-cols-3 sm:grid-cols-5 gap-3 min-w-[400px] sm:min-w-0"
                        >
                            {[1, 2, 3, 4, 5].map((c) => (
                                <div key={c} className="h-3 bg-gray-200 rounded" />
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="p-8 flex flex-col justify-center items-center">
                <Image
                    src="/empty-truck.svg"
                    width={150}
                    height={80}
                    alt="no orders found"
                    className="opacity-40" />
                <span className="text-gray-400 text-xl">Sorry, couldn't find order details for &ldquo;{trackingNumber}&rdquo;.</span>
            </div>
        );
    }

    const orderDate = new Date(order.created_at);
    const formattedOrderDate = orderDate.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
    const formattedOrderTime = orderDate.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });

    const deliveredDate = order.delivered_at
        ? new Date(order.delivered_at)
        : null;

    return (
        <div className="max-w-5xl mx-auto w-full flex flex-col gap-4 sm:gap-6 py-4 sm:py-8 px-3 sm:px-0">
            {/* HEADER TITLE */}
            <div className="text-center">
                <h2 className="text-black text-lg sm:text-xl font-bold uppercase relative inline-block pb-2 border-b-3 border-orange-400">
                    Your Order Details
                </h2>
            </div>

            {/* TIMELINE SECTION */}
            <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 sm:p-6 rounded-sm border border-gray-200 gap-4 sm:gap-6">
                <div className="flex flex-col items-center sm:items-start flex-1 w-full sm:w-auto">
                    <span className="text-[10px] text-gray-400 font-medium">
                        Order Placed :
                    </span>
                    <div className="text-xs sm:text-sm font-semibold text-gray-800 text-center sm:text-left">
                        {formattedOrderDate} {formattedOrderTime}
                    </div>
                    <div className="text-[10px] sm:text-xs text-gray-500 mt-1 text-center sm:text-left break-words max-w-full">
                        {order.sender_address || "N/A"}
                    </div>
                </div>

                <div className="flex flex-col items-center flex-1 w-full sm:w-auto">
                    <div className="flex gap-1 text-orange-400">
                        <span className="text-2xl sm:text-3xl font-bold">
                            &rsaquo;&rsaquo;&rsaquo;
                        </span>
                        <span className="text-2xl sm:text-3xl font-bold text-gray-300">
                            &rsaquo;
                        </span>
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-gray-700 mt-1 text-center">
                        {order.status
                            ? order.status
                                .split("_")
                                .map(
                                    (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(),
                                )
                                .join(" ")
                            : ""}
                    </div>
                </div>

                <div className="flex flex-col items-center sm:items-end flex-1 w-full sm:w-auto">
                    <span className="text-[10px] text-gray-400 font-medium">
                        Expected Delivery :
                    </span>
                    <div className="text-xs sm:text-sm font-semibold text-gray-800 text-center sm:text-right">
                        {/* {deliveredDate
                            ? `${deliveredDate.toLocaleDateString("en-GB")} ${deliveredDate.toLocaleTimeString()}`
                            : "Pending"} */}
                        Delivered within 1-2 days
                    </div>
                    <div className="text-[10px] sm:text-xs text-gray-500 mt-1 text-center sm:text-right break-words max-w-full">
                        {order.recipient_address || "N/A"}
                    </div>
                </div>
            </div>

            {/* DETAILS CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* Receiver Details */}
                <div className="bg-white p-4 sm:p-6 rounded-sm border border-gray-200">
                    <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-2">
                        <User className="w-4 h-4 text-[#2cd38a]" />
                        <h3 className="text-xs font-bold text-[#3b5998] uppercase">
                            Receiver Details
                        </h3>
                    </div>
                    <table className="w-full text-xs text-left">
                        <thead>
                        </thead>
                        <tbody>
                            <tr
                                className="border-b border-gray-50 last:border-0 text-gray-600"
                            >
                                <td className="py-3 break-words min-w-[120px] max-w-[120px] sm:max-w-none">
                                    <span className="font-bold text-[#3b5998]">Name</span>
                                </td>
                                <td className="py-3">{order.recipient_name}</td>
                            </tr>
                            <tr
                                className="border-b border-gray-50 last:border-0 text-gray-600"
                            >
                                <td className="py-3 break-words max-w-[120px] sm:max-w-none">
                                    <span className="font-bold text-[#3b5998]">Phone</span>
                                </td>
                                <td className="py-3">{order.recipient_phone}</td>
                            </tr>
                            <tr
                                className="border-b border-gray-50 last:border-0 text-gray-600"
                            >
                                <td className="py-3 break-words max-w-[120px] sm:max-w-none">
                                    <span className="font-bold text-[#3b5998]">Address</span>
                                </td>
                                <td className="py-3">{order.recipient_address}</td>
                            </tr>
                            <tr
                                className="border-b border-gray-50 last:border-0 text-gray-600"
                            >
                                <td className="py-3 break-words max-w-[120px] sm:max-w-none">
                                    <span className="font-bold text-[#3b5998]">City</span>
                                </td>
                                <td className="py-3">{order.recipient_city}</td>
                            </tr>
                            <tr
                                className="border-b border-gray-50 last:border-0 text-gray-600"
                            >
                                <td className="py-3 break-words max-w-[120px] sm:max-w-none">
                                    <span className="font-bold text-[#3b5998]">District</span>
                                </td>
                                <td className="py-3">{order.recipient_district}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Sender Details */}
                <div className="bg-white p-4 sm:p-6 rounded-sm border border-gray-200">
                    <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-2">
                        <Truck className="w-4 h-4 text-[#f39c12]" />
                        <h3 className="text-xs font-bold text-[#3b5998] uppercase">
                            Sender Details
                        </h3>
                    </div>
                    <table className="w-full text-xs text-left">
                        <thead>
                        </thead>
                        <tbody>
                            <tr
                                className="border-b border-gray-50 last:border-0 text-gray-600"
                            >
                                <td className="py-3 break-words min-w-[120px] max-w-[120px] sm:max-w-none">
                                    <span className="font-bold text-[#3b5998]">Name</span>
                                </td>
                                <td className="py-3">{order.sender_name}</td>
                            </tr>
                            <tr
                                className="border-b border-gray-50 last:border-0 text-gray-600"
                            >
                                <td className="py-3 break-words max-w-[120px] sm:max-w-none">
                                    <span className="font-bold text-[#3b5998]">Contact No.</span>
                                </td>
                                <td className="py-3">{order.sender_phone}</td>
                            </tr>
                            <tr
                                className="border-b border-gray-50 last:border-0 text-gray-600"
                            >
                                <td className="py-3 break-words max-w-[120px] sm:max-w-none">
                                    <span className="font-bold text-[#3b5998]">Address</span>
                                </td>
                                <td className="py-3">{order.sender_address}</td>
                            </tr>
                            <tr
                                className="border-b border-gray-50 last:border-0 text-gray-600"
                            >
                                <td className="py-3 break-words max-w-[120px] sm:max-w-none">
                                    <span className="font-bold text-[#3b5998]">Client Note</span>
                                </td>
                                <td className="py-3">{order.special_instructions || "-"}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* PRODUCT DETAILS */}
                <div className="bg-white rounded-sm border border-gray-200 p-4 sm:p-6 overflow-x-auto">
                    <div className="flex items-center gap-2 mb-4">
                        <Package className="w-4 h-4 text-[#9b59b6]" />
                        <h3 className="text-xs font-bold text-[#3b5998] uppercase">
                            Product Details
                        </h3>
                    </div>
                    <table className="w-full text-xs text-left">
                        <thead>
                            <tr className="border-b border-gray-100 text-[#3b5998]">
                                <th className="py-2 font-bold">Product Name</th>
                                <th className="py-2 font-bold">Product Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products?.map((p, idx) => (
                                <tr
                                    key={idx}
                                    className="border-b border-gray-50 last:border-0 text-gray-600"
                                >
                                    <td className="py-3 break-words max-w-[120px] sm:max-w-none">
                                        {p.name}
                                    </td>
                                    <td className="py-3">{p.quantity}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="bg-white rounded-sm border border-gray-200 p-4 sm:p-6 overflow-x-auto">
                    <div className="flex items-center gap-2 mb-4">
                        <PackageOpen className="w-4 h-4 text-[#9b59b6]" />
                        <h3 className="text-xs font-bold text-[#3b5998] uppercase">
                            Delivery amount details
                        </h3>
                    </div>
                    <table className="w-full text-xs text-left">
                        <tbody>
                            <tr className="border-b border-gray-50 last:border-0 text-gray-600">
                                <td className="py-3">Cod amount</td>
                                <td className="py-3">Rs. {order.cod_amount}</td>
                            </tr>
                            <tr className="border-b border-gray-50 last:border-0 text-gray-600">
                                <td className="py-3">Delivery charge</td>
                                <td className="py-3">Rs. {order.delivery_charge}</td>
                            </tr>
                            <tr className="border-b border-gray-50 last:border-0 text-gray-600">
                                <td className="py-3">Payment Type</td>
                                <td className="py-3">{order.payment_type}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* PACKAGE STATUS DETAILS */}
            <div className="bg-white rounded-sm border border-gray-200 p-4 sm:p-6 overflow-x-auto">
                <div className="flex items-center gap-2 mb-4">
                    <CheckCircle2 className="w-4 h-4 text-[#e67e22]" />
                    <h3 className="text-xs font-bold text-[#3b5998] uppercase">
                        Package Status Details
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left min-w-[500px] sm:min-w-0">
                        <thead>
                            <tr className="border-b border-gray-100 text-[#3b5998]">
                                <th className="py-2 font-bold">Date/Time</th>
                                <th className="py-2 font-bold">Old Status</th>
                                <th className="py-2 font-bold">New Status</th>
                                <th className="py-2 font-bold">Activity By</th>
                                <th className="py-2 font-bold">Remarks</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.change_logs && order.change_logs.length > 0 ? (
                                order.change_logs.map((log, idx) => (
                                    <tr
                                        key={idx}
                                        className="border-b border-gray-50 last:border-0 text-gray-600 bg-gray-50/30"
                                    >
                                        <td className="py-3 whitespace-nowrap">
                                            {new Date(log.changed_at).toLocaleString("en-GB")}
                                        </td>
                                        <td className="py-3">{log.old_status || "-"}</td>
                                        <td className="py-3">{log.new_status}</td>
                                        <td className="py-3">{log.user_name}</td>
                                        <td className="py-3">{log.comment}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr className="border-b border-gray-50 text-gray-600 bg-gray-50/30">
                                    <td className="py-3 whitespace-nowrap">
                                        {formattedOrderDate} {formattedOrderTime}
                                    </td>
                                    <td className="py-3">Order Placed</td>
                                    <td className="py-3">{order.sender_name}</td>
                                    <td className="py-3">{order.sender_address}</td>
                                    <td className="py-3"></td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* COMMENTS */}
            {
                user && (
                    <div className="bg-white rounded-sm border border-gray-200 p-4 sm:p-6">
                        <div className="flex items-center gap-2 mb-6 sm:mb-8">
                            <MessageSquare className="w-4 h-4 text-gray-400" />
                            <h3 className="text-xs font-bold text-[#3b5998] uppercase">
                                Comments
                            </h3>
                        </div>

                        {order.comments && order.comments.length > 0 && (
                            <div className="flex flex-col gap-4 mb-2">
                                {order.comments.map((comment) => (
                                    <div key={comment.id} className="flex gap-3">
                                        <div className="flex-shrink-0">
                                            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs uppercase">
                                                {comment.commented_by_name
                                                    ? comment.commented_by_name.charAt(0)
                                                    : "U"}
                                            </div>
                                        </div>
                                        <div className="flex flex-col mt-0.5 min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                                <span className="text-xs font-bold text-gray-800">
                                                    {comment.commented_by_name || "User"}
                                                </span>
                                                {comment.commented_by_role && (
                                                    <span className="inline-block text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 uppercase tracking-wide">
                                                        {comment.commented_by_role.replace(/_/g, " ")}
                                                    </span>
                                                )}
                                                <span className="text-[10px] text-gray-400 font-medium">
                                                    {new Date(comment.created_at).toLocaleString("en-GB")}
                                                </span>
                                            </div>
                                            <p className="text-xs break-words text-gray-600">
                                                {comment.message}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-3 mt-6 border-t border-gray-100 pt-6">
                            <div className="flex-shrink-0 hidden sm:block">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs uppercase mt-0.5">
                                    {user?.first_name ? user.first_name.charAt(0) : "U"}
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 flex-grow w-full">
                                <div className="flex items-center gap-2 sm:hidden">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs uppercase flex-shrink-0">
                                        {user?.first_name ? user.first_name.charAt(0) : "U"}
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">
                                        {user?.first_name} {user?.last_name}
                                    </span>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Add a comment..."
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handlePostComment()}
                                    disabled={postCommentMutation.isPending}
                                    className="w-full border-b border-gray-300 bg-transparent py-2 text-xs focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50"
                                />
                                <div className="flex justify-end mt-1">
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={handlePostComment}
                                        disabled={
                                            postCommentMutation.isPending || !commentText.trim()
                                        }
                                    >
                                        {postCommentMutation.isPending ? (
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        ) : (
                                            "Comment"
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
