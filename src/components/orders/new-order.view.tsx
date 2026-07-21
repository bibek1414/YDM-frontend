"use client";

import { useRef, useState } from "react";
import { UploadCloud, Plus, Download, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { utils } from "@/src/lib/api";
import { toast } from "sonner";
import { z } from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateOrder } from "@/src/components/orders/orders.queries";
import { useRouter } from "next/navigation";

const orderSchema = z.object({
    recipient_name: z.string().min(1, "Name is required"),
    recipient_phone: z.string().min(1, "Phone is required"),
    recipient_email: z.string().email("Invalid email").optional().or(z.literal("")),
    recipient_address: z.string().min(1, "Address is required"),
    recipient_city: z.string().min(1, "City is required"),
    recipient_district: z.string().min(1, "District is required"),
    payment_type: z.enum(["COD", "Prepaid"], { message: "Payment method must be COD or Prepaid" }),
    cod_amount: z.string().optional(),
    remarks: z.string().optional(),
    products: z.array(z.object({
        name: z.string().min(1, "Product name is required"),
        quantity: z.number().min(1, "Quantity must be at least 1"),
    })).min(1, "At least one product is required")
});

type OrderFormValues = z.infer<typeof orderSchema>;

export default function NewOrderView() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const { register, control, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<OrderFormValues>({
        resolver: zodResolver(orderSchema as any),
        defaultValues: {
            recipient_name: "",
            recipient_phone: "",
            recipient_email: "",
            recipient_address: "",
            recipient_city: "",
            recipient_district: "",
            payment_type: "COD",
            cod_amount: "",
            remarks: "",
            products: [{ name: "", quantity: 1 }]
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "products"
    });

    const { mutate: createOrderMutation } = useCreateOrder();

    const handleFile = async (file: File) => {
        const allowed = [
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-excel",
        ];
        if (!allowed.includes(file.type)) {
            toast.error("Please upload a valid Excel file (.xlsx or .xls)");
            return;
        }
        setIsUploading(true);
        const toastId = toast.loading(`Uploading ${file.name}…`);
        try {
            await utils.uploadExcel(file);
            toast.success("Orders imported successfully", { id: toastId });
        } catch (err: any) {
            const msg =
                err?.detail?.[0] ?? err?.non_field_errors?.[0] ?? "Upload failed. Please try again.";
            toast.error(msg, { id: toastId });
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const onSubmit = (data: OrderFormValues) => {
        const toastId = toast.loading("Creating order...");
        const cod_amount = data.cod_amount || "0";
        const product = data.products.map(p => `${p.name}-${p.quantity}`).join(",");

        const payload = {
            recipient_name: data.recipient_name,
            recipient_phone: data.recipient_phone,
            recipient_email: data.recipient_email,
            recipient_address: data.recipient_address,
            recipient_city: data.recipient_city,
            recipient_district: data.recipient_district,
            cod_amount,
            payment_type: data.payment_type,
            product,
            remarks: data.remarks
        };

        createOrderMutation(payload, {
            onSuccess: () => {
                toast.success("Order created successfully", { id: toastId });
                reset();
            },
            onError: (err: any) => {
                const msg = err?.response?.data?.detail ?? "Failed to create order. Please try again.";
                toast.error(msg, { id: toastId });
            },
        });
    };

    return (
        <div className="flex flex-col gap-10 w-full max-w-screen-xl border border-gray-200 mx-auto pb-20 bg-white p-6 md:p-8 rounded-sm">

            {/* ORDER PLACE EXCEL SECTION */}
            <section className="flex flex-col gap-6">
                <div className="pb-2 mb-2">
                    <h2 className="text-sm font-bold text-[#2e4a62] uppercase border-b-2 border-orange-400 inline-block pb-2 -mb-[2.5px]">
                        Order Place Excel
                    </h2>
                </div>

                <div className="max-w-2xl mx-auto w-full flex flex-col items-center gap-6">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx,.xls"
                        className="hidden"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFile(file);
                        }}
                    />

                    <div
                        role="button"
                        aria-label="Upload Excel file"
                        onClick={() => !isUploading && fileInputRef.current?.click()}
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={(e) => {
                            e.preventDefault();
                            setIsDragging(false);
                            const file = e.dataTransfer.files?.[0];
                            if (file) handleFile(file);
                        }}
                        className={`w-full border-2 border-dashed rounded-xs p-10 flex flex-col items-center justify-center text-gray-500 transition-colors select-none ${isUploading
                            ? "cursor-not-allowed opacity-60 border-gray-300 bg-gray-50/50"
                            : isDragging
                                ? "border-orange-400 bg-orange-50 cursor-copy"
                                : "border-gray-300 bg-gray-50/50 hover:bg-gray-50 cursor-pointer"
                            }`}
                    >
                        <UploadCloud className={`h-10 w-10 mb-2 ${isDragging ? "text-orange-400" : "text-gray-400"}`} />
                        <span className="font-medium text-gray-400">
                            {isUploading ? "Uploading…" : isDragging ? "Drop to upload" : "Click or drag an Excel file here"}
                        </span>
                        <span className="text-xs text-gray-300 mt-1">.xlsx / .xls</span>
                    </div>

                    <Button
                        onClick={() => utils.downloadExcelSample()}
                        variant="secondary">
                        <Download className="w-4 h-4" />
                        Download Excel Sample
                    </Button>
                </div>
            </section>


            {/* ORDER PLACE FORM SECTION */}
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
                <div className="pb-2">
                    <h2 className="text-sm font-bold text-[#2e4a62] uppercase border-b-2 border-orange-400 inline-block pb-2 -mb-[2.5px]">
                        Order Place Form
                    </h2>
                </div>

                {/* Customer Details */}
                <div>
                    <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
                        <h3 className="text-[#2e4a62] font-semibold">Customer Details</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-semibold text-[#2e4a62]">Full Name *</label>
                            <input {...register("recipient_name")} type="text" placeholder="Full Name" className="w-full border border-gray-200 rounded p-2 text-sm focus:outline-none focus:border-gray-400" />
                            {errors.recipient_name && <span className="text-red-500 text-xs">{errors.recipient_name.message}</span>}
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-semibold text-[#2e4a62]">Phone Number *</label>
                            <input {...register("recipient_phone")} type="text" placeholder="Phone Number" className="w-full border border-gray-200 rounded p-2 text-sm focus:outline-none focus:border-gray-400" />
                            {errors.recipient_phone && <span className="text-red-500 text-xs">{errors.recipient_phone.message}</span>}
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-semibold text-[#2e4a62]">Email</label>
                            <input {...register("recipient_email")} type="email" placeholder="Email" className="w-full border border-gray-200 rounded p-2 text-sm focus:outline-none focus:border-gray-400" />
                            {errors.recipient_email && <span className="text-red-500 text-xs">{errors.recipient_email.message}</span>}
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-semibold text-[#2e4a62]">Address *</label>
                            <input {...register("recipient_address")} type="text" placeholder="Address" className="w-full border border-gray-200 rounded p-2 text-sm focus:outline-none focus:border-gray-400" />
                            {errors.recipient_address && <span className="text-red-500 text-xs">{errors.recipient_address.message}</span>}
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-semibold text-[#2e4a62]">City *</label>
                            <input {...register("recipient_city")} type="text" placeholder="City" className="w-full border border-gray-200 rounded p-2 text-sm focus:outline-none focus:border-gray-400" />
                            {errors.recipient_city && <span className="text-red-500 text-xs">{errors.recipient_city.message}</span>}
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-semibold text-[#2e4a62]">District *</label>
                            <input {...register("recipient_district")} type="text" placeholder="District" className="w-full border border-gray-200 rounded p-2 text-sm focus:outline-none focus:border-gray-400" />
                            {errors.recipient_district && <span className="text-red-500 text-xs">{errors.recipient_district.message}</span>}
                        </div>
                    </div>
                </div>

                {/* Payment Details */}
                <div className="mt-4">
                    <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
                        <h3 className="text-[#2e4a62] font-semibold">Payment Details</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-semibold text-[#2e4a62]">Payment Type *</label>
                            <select {...register("payment_type")} className="w-full border border-gray-200 rounded p-2 text-sm focus:outline-none focus:border-gray-400 text-gray-700 bg-white">
                                <option value="COD">COD</option>
                                <option value="Prepaid">Prepaid</option>
                            </select>
                            {errors.payment_type && <span className="text-red-500 text-xs">{errors.payment_type.message}</span>}
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-semibold text-[#2e4a62]">COD Amount</label>
                            <input {...register("cod_amount")} type="text" placeholder="Amount (e.g. 500)" className="w-full border border-gray-200 rounded p-2 text-sm focus:outline-none focus:border-gray-400" />
                            {errors.cod_amount && <span className="text-red-500 text-xs">{errors.cod_amount.message}</span>}
                        </div>
                    </div>
                </div>

                {/* Product Details */}
                <div className="mt-4">
                    <div className="mb-4 border-b border-gray-100 pb-2 flex justify-between items-center">
                        <h3 className="text-[#2e4a62] font-semibold">Product Details</h3>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1 border-orange-400 text-orange-500 hover:bg-orange-50 hover:text-orange-600"
                            onClick={() => append({ name: "", quantity: 1 })}
                        >
                            <Plus className="w-3.5 h-3.5" />
                            Add Product
                        </Button>
                    </div>

                    <div className="flex flex-col gap-2">
                        {fields.map((field, index) => (
                            <div key={field.id} className="flex flex-col md:flex-row gap-4 items-start md:items-end">
                                <div className="flex-1 flex flex-col gap-2 w-full">
                                    {index === 0 && <label className="text-xs font-semibold text-[#2e4a62]">Product Name *</label>}
                                    <input
                                        {...register(`products.${index}.name` as const)}
                                        type="text"
                                        placeholder="Product Name"
                                        className="w-full border border-gray-200 rounded p-2 text-sm focus:outline-none focus:border-gray-400"
                                    />
                                    {errors.products?.[index]?.name && <span className="text-red-500 text-xs">{errors.products[index]?.name?.message}</span>}
                                </div>
                                <div className="w-full md:w-32 flex flex-col gap-2">
                                    {index === 0 && <label className="text-xs font-semibold text-[#2e4a62]">Quantity *</label>}
                                    <input
                                        {...register(`products.${index}.quantity` as const, { valueAsNumber: true })}
                                        type="number"
                                        min="1"
                                        placeholder="Qty"
                                        className="w-full border border-gray-200 rounded p-2 text-sm focus:outline-none focus:border-gray-400"
                                    />
                                    {errors.products?.[index]?.quantity && <span className="text-red-500 text-xs">{errors.products[index]?.quantity?.message}</span>}
                                </div>
                                {fields.length > 1 ? (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="text-red-500 hover:text-red-600 hover:bg-red-50 mb-[2px]"
                                        onClick={() => remove(index)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                ) : (
                                    <div className="w-9 hidden md:block"></div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Remarks */}
                <div className="flex flex-col gap-2 mt-6">
                    <label className="text-xs font-semibold text-[#2e4a62]">Remarks</label>
                    <textarea {...register("remarks")} className="w-full border border-gray-200 rounded p-2 text-sm focus:outline-none focus:border-gray-400 min-h-[100px]"></textarea>
                    {errors.remarks && <span className="text-red-500 text-xs">{errors.remarks.message}</span>}
                </div>
                <div className="mt-4 flex items-center gap-2">
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Creating..." : "Create Order"}
                    </Button>

                    <Button
                        onClick={() => router.push("/dashboard/orders/my-orders")}
                        variant="link">
                        View Orders table
                    </Button>
                </div>
            </form >
        </div >
    );
}