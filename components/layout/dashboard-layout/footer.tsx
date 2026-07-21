"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Phone, Mail, Package } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Footer() {
  const [trackingCode, setTrackingCode] = useState("");
  const router = useRouter();

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingCode.trim()) {
      router.push(`/track-order/${encodeURIComponent(trackingCode.trim())}`);
    }
  };

  return (
    <footer className="w-full overflow-clip relative bg-olive-100 text-white">
      {/* Track your Parcel Banner */}
      <div className="bg-orange-400 overflow-clip relative border-b border-white/10">
        {/* Background decorations - hidden on mobile for performance */}
        <div className="hidden md:block absolute -left-60 -top-60 inset-0 z-3 w-full h-full">
          <div className="w-200 h-200 bg-orange-500 shadow-sm rotate-[40deg]" />
        </div>
        <div className="hidden md:block absolute -left-40 -top-60 inset-0 z-2 w-full h-full">
          <div className="w-200 h-200 bg-gradient-to-tr bg-orange-300 via-orange-300 to-orange-500 shadow-lg rotate-[40deg]" />
        </div>
        <div className="relative mx-auto z-10 max-w-screen-xl px-4 sm:px-6 py-8 sm:py-12 md:py-16 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
          <div className="flex items-center gap-3 sm:gap-4 w-full md:w-auto justify-center md:justify-start">
            <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center shrink-0">
              <Package className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <div>
              <p className="font-medium text-white uppercase italic text-xl sm:text-2xl md:text-3xl text-center md:text-left">
                Track your Parcel
              </p>
            </div>
          </div>
          <form onSubmit={handleTrack} className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto md:max-w-md flex-1">
            <input
              type="text"
              placeholder="Tracking Code"
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value)}
              className="w-full sm:flex-1 bg-white text-gray-800 text-sm px-4 py-2.5 rounded border-0 focus:outline-none shadow-lg focus:ring-2 focus:ring-orange-400"
            />
            <Button type="submit" variant="secondary" size="lg" className="w-full sm:w-auto shadow-sm text-sm sm:text-base">
              TRACK ORDER
            </Button>
          </form>
        </div>
      </div>

      {/* Main Footer */}
      <div className="mx-auto max-w-screen-xl px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Column */}
          <div className="flex flex-col gap-5">
            <Link href="/dashboard" className="inline-flex items-center">
              <Image
                src="/ydm-logo.webp"
                width={90}
                height={90}
                alt="YDM logo"
                className="brightness-0"
              />
            </Link>
            <p className="text-black/60 text-xs leading-relaxed">
              Your trusted delivery management platform, connecting vendors and
              riders seamlessly.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-4">
            <h4 className="text-sm font-medium text-black border-b border-[#e8611a] pb-2 w-fit pr-4">
              Quick Links
            </h4>
            <ul className="flex flex-col gap-2.5">
              {[
                "About Us",
                "Our Services",
                "Our Branches",
                "Terms & Conditions",
                "Privacy & Policy",
                "Careers",
                "Contact Us",
              ].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-xs text-black/60 hover:text-[#e8611a] transition-colors flex items-center gap-1.5"
                  >
                    <span className="text-[#e8611a]">›</span>
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Us */}
          <div className="flex flex-col gap-4">
            <h4 className="text-sm font-medium text-black border-b border-[#e8611a] pb-2 w-fit pr-4">
              Contact Us
            </h4>
            <div className="flex flex-col gap-4">
              <div className="flex gap-3 items-start">
                <div className="w-7 h-7 flex items-center justify-center shrink-0">
                  <MapPin className="w-3.5 h-3.5 text-[#e8611a]" />
                </div>
                <div>
                  <p className="text-xs font-medium text-black/80 mb-0.5">
                    Address
                  </p>
                  <p className="text-xs text-black/50 leading-relaxed">
                    Sinamangal - 9, Kathmandu, Nepal
                  </p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-7 h-7 flex items-center justify-center shrink-0">
                  <Phone className="w-3.5 h-3.5 text-[#e8611a]" />
                </div>
                <div>
                  <p className="text-xs font-medium text-black/80 mb-0.5">
                    Phone
                  </p>
                  <p className="text-xs text-black/50">
                    9801878703 · 9801878702
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Post */}
          {/* <div className="flex flex-col gap-4">
            <h4 className="text-sm font-medium text-black border-b border-[#e8611a] pb-2 w-fit pr-4">Recent Post</h4>
            <div className="grid grid-cols-3 gap-1.5">
              {Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square rounded bg-black/10 border border-black/10 hover:border-[#e8611a]/60 transition-colors cursor-pointer overflow-hidden"
                >
                  <div className="w-full h-full bg-gradient-to-br from-black/5 to-black/0" />
                </div>
              ))}
            </div>
          </div> */}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-screen-xl px-6 py-4 text-center">
          <p className="text-xs text-white/40">
            © All Rights Reserved, YDM {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
}
