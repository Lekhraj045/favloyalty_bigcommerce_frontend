"use client";

import ChannelSelector from "@/components/ChannelSelector";
import { getStorePlan, StorePlan } from "@/utils/api";
import { Button } from "@heroui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import CustomerTable from "./components/CustomerTable";

export default function CustomersPage() {
  const [storePlan, setStorePlan] = useState<StorePlan | null>(null);
  const router = useRouter();

  // Load store plan information
  useEffect(() => {
    const loadStorePlan = async () => {
      try {
        const plan = await getStorePlan();
        setStorePlan(plan);
      } catch (error) {
        console.error("Error loading store plan:", error);
        // Default to free plan if error
        setStorePlan({
          plan: "free",
          trialDaysRemaining: null,
          paypalSubscriptionId: null,
          limitReached: false,
          orderCount: 0,
          selectedOrderLimit: 0,
        });
      }
    };
    loadStorePlan();
  }, []);

  return (
    <>
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col gap-4">
          <div className="flex gap-2 justify-between items-center">
            <div className="flex flex-col gap-1">
              <h1 className="text-xl font-bold">Loyalty Members</h1>
              <p>Customize the way you want customers to collect points</p>
            </div>

            <div className="flex gap-2.5 items-center">
              <ChannelSelector />
              {/* Only show Upgrade button for free plan users or when limit reached */}
              {(storePlan?.plan === "free" || storePlan?.limitReached) && (
                <Button
                  onClick={() => router.push("/pricing")}
                  className="custom-btn"
                >
                  Upgrade
                </Button>
              )}
            </div>
          </div>

          <div className="card !p-0">
            <CustomerTable />
          </div>
        </div>
      </div>
    </>
  );
}
