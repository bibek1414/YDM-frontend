"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    useVendorAPIKey,
    useRegenerateAPIKey,
    useWebhookMutation,
    useWebhookUrl
} from "./profile.queries";
import { RotateCw, Copy, Check, Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileView() {
    const { data: apiKey, isLoading: apiLoading } = useVendorAPIKey();
    const { mutate: regenerateAPIKey } = useRegenerateAPIKey();

    const { data: webhook, isLoading: webhookLoading } = useWebhookUrl();
    const { mutate: registerWebhook } = useWebhookMutation();

    const [copiedApiKey, setCopiedApiKey] = useState(false);
    const [showApiKey, setShowApiKey] = useState(false);
    const [webhookUrl, setWebhookUrl] = useState(webhook?.webhook_url || "");

    useEffect(() => {
        if (webhook?.webhook_url) {
            setWebhookUrl(webhook.webhook_url);
        }
    }, [webhook?.webhook_url]);

    const actualApiKey = Array.isArray(apiKey) ? apiKey[0]?.key : apiKey?.key;

    const handleCopy = (text: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        toast.success("API Key copied to clipboard");

        setCopiedApiKey(true);
        setTimeout(() => setCopiedApiKey(false), 2000);
    };

    if (apiLoading || webhookLoading) {
        return (
            <div className="space-y-6">
                <div>
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-96 mt-1" />
                </div>
                
                <div className="space-y-6 pt-4">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-72" />
                        <div className="flex gap-3">
                            <Skeleton className="h-10 flex-1" />
                            <Skeleton className="h-10 w-28" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-4 w-80" />
                        <div className="flex gap-3">
                            <Skeleton className="h-10 flex-1" />
                            <Skeleton className="h-10 w-20" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="mb-6 pb-6 border-b border-gray-100">
                <h2 className="text-black font-semibold text-xl m-0">Developer Settings</h2>
                <p className="text-gray-500 text-sm mt-1">Manage your API keys and webhooks for integration.</p>
            </div>

            <div className="space-y-6 max-w-2xl">
                {/* API Key Section */}
                <div className="space-y-2">
                    <label className="text-black font-medium text-sm">API Key</label>
                    <p className="text-gray-500 text-xs mb-3">Use this key to authenticate your API requests.</p>
                    <div className="flex items-center gap-3">
                        <div className="relative flex-1">
                            <Input
                                readOnly
                                type={showApiKey ? "text" : "password"}
                                value={actualApiKey || ""}
                                placeholder="Loading..."
                                className="pr-20 text-black font-normal bg-gray-50/50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                <button
                                    onClick={() => setShowApiKey(!showApiKey)}
                                    className="text-black hover:opacity-70 transition-opacity"
                                    title={showApiKey ? "Hide API Key" : "Show API Key"}
                                >
                                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                                <button
                                    onClick={() => handleCopy(actualApiKey || "")}
                                    className="text-black hover:opacity-70 transition-opacity"
                                    title="Copy API Key"
                                >
                                    {copiedApiKey ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => regenerateAPIKey()}
                            className="border-gray-200 text-black font-normal flex items-center gap-2"
                        >
                            <RotateCw className="w-4 h-4" />
                            Regenerate
                        </Button>
                    </div>
                </div>

                {/* Webhook Section */}
                <div className="space-y-2">
                    <label className="text-black font-medium text-sm">Webhook URL</label>
                    <p className="text-gray-500 text-xs mb-3">Receive real-time event updates at this endpoint.</p>
                    <div className="flex items-center gap-3">
                        <div className="relative flex-1">
                            <Input
                                placeholder="https://your-domain.com/webhook"
                                className="text-black font-normal border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0"
                                onChange={(e) => setWebhookUrl(e.target.value)}
                                value={webhookUrl}
                            />
                        </div>
                        <Button
                            onClick={() => registerWebhook(webhookUrl || "")}
                            variant="outline"
                            className="border-gray-200 text-black font-medium px-6"
                        >
                            Save
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}