import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Nunito_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { AuthProvider } from "@/src/lib/auth-context";
import ReactQueryProvider from "@/src/providers/react-query-provider";
import { Toaster } from "sonner";

const nunitoSansHeading = Nunito_Sans({ subsets: ['latin'], variable: '--font-heading' });

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "YDM Logistics",
  description: "YDM Logistics - Franchise Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", inter.variable, nunitoSansHeading.variable)}
    >
      <body className="min-h-full flex flex-col">
        <ReactQueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </ReactQueryProvider>
        <Toaster toastOptions={{ style: { borderRadius: "2px" } }} position="bottom-right" />
      </body>
    </html>
  );
}
