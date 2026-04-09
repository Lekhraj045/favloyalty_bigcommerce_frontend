"use client";

import SetupHeader from "@/components/SetupHeader";
import { Alert } from "@heroui/alert";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import PointsSetting from "./points-tier-system/PointsSetting";

function HomeContent() {
  const searchParams = useSearchParams();
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const paymentStatus = searchParams.get("payment");
  const userId = searchParams.get("userId");
  const channelId = searchParams.get("channelId");
  const storeId = searchParams.get("storeId");

  useEffect(() => {
    if (paymentStatus === "success") {
      setShowSuccessMessage(true);
      // Hide message after 5 seconds
      const timer = setTimeout(() => {
        setShowSuccessMessage(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [paymentStatus]);

  return (
    <>
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col gap-4">
          <div className="head">
            <SetupHeader />
            {/* <SetupNavigation /> */}
          </div>

          {showSuccessMessage && (
            <Alert
              color="success"
              title="Payment Successful!"
              description="Your payment has been processed successfully. You can now continue setting up your loyalty program."
              onClose={() => setShowSuccessMessage(false)}
            />
          )}

          <PointsSetting />
        </div>
      </div>
    </>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
