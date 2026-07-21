"use client";
import { useRouter } from "next/navigation";
import { ChevronLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const NotFound = () => {
  const router = useRouter();

  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  const handleGoHome = () => {
    router.push("/");
  };

  return (
    <div className=" min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-7xl  text-center border-none shadow-none">
        <CardContent className="pt-12 pb-8">
          {/* 404 Number */}
          <div className="text-8xl font-bold text-gray-300 mb-4">404</div>

          {/* Title */}
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">
            Page Not Found
          </h1>

          {/* Description */}
          <p className="text-gray-600 mb-8">
            Sorry, the page you are looking for doesn&apos;t exist or has been
            moved.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={handleGoBack}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Go Back
            </Button>

            <Button
              onClick={handleGoHome}
              className="flex items-center gap-2 bg-primary hover:bg-primary text-white"
            >
              <Home className="w-4 h-4" />
              Go Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
