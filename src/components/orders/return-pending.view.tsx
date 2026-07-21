"use client";

import { MyOrdersView } from "./my-orders.view"; // adjust import path to match your file structure

export default function ReturnPendingView() {
    return (
        <MyOrdersView
            fixedStatus="RETURNING_TO_VENDOR"
            title="Return Pending Orders"
        />
    );
}