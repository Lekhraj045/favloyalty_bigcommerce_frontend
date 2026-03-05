"use client";

import ChannelSelector from "@/components/ChannelSelector";
import { useAppSelector } from "@/store/hooks";
import { getStorePlan, StorePlan } from "@/utils/api";
import { Button } from "@heroui/button";
import { Skeleton } from "@heroui/skeleton";
import { AlertTriangle } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/** Returns color config based on progress percentage (0 | 25 | 50 | 75 | 100). */
const getProgressColors = (val: number) => {
  if (val === 0) {
    return {
      completedColor: "#DEDEDE",
      backgroundColor: "#FFFFFF",
      borderColor: "#DEDEDE",
      showCheckmark: false,
    };
  }
  if (val === 25) {
    return {
      completedColor: "#D40000", // red
      backgroundColor: "#fff", // light red
      borderColor: "#D40000",
      showCheckmark: false,
    };
  }
  if (val === 50) {
    return {
      completedColor: "#FF9448", // orange
      backgroundColor: "#fff", // light orange
      borderColor: "#FF9448",
      showCheckmark: false,
    };
  }
  if (val === 75) {
    return {
      completedColor: "#EFDF30", // yellow
      backgroundColor: "#fff", // light yellow
      borderColor: "#EFDF30",
      showCheckmark: false,
    };
  }
  if (val === 100) {
    return {
      completedColor: "#22c55e", // green
      backgroundColor: "#dcfce7", // light green
      borderColor: "#22c55e",
      showCheckmark: true,
    };
  }
  // fallback
  return {
    completedColor: "#DEDEDE",
    backgroundColor: "#FFFFFF",
    borderColor: "#DEDEDE",
    showCheckmark: false,
  };
};

/** Returns the CSS conic-gradient string for the progress ring. */
// Helper to generate conic-gradient according to progress
const getConic = (
  val: number,
  completedColor: string,
  backgroundColor: string,
) => {
  if (val === 0) return `conic-gradient(${backgroundColor} 0 100%)`;
  if (val === 25)
    return `conic-gradient(${completedColor} 0 25%, ${backgroundColor} 25% 100%)`;
  if (val === 50)
    return `conic-gradient(${completedColor} 0 50%, ${backgroundColor} 50% 100%)`;
  if (val === 75)
    return `conic-gradient(${completedColor} 0 75%, ${backgroundColor} 75% 100%)`;
  if (val === 100) return `conic-gradient(${completedColor} 0 100%)`;
  return `conic-gradient(${backgroundColor} 0 100%)`;
};

/** Hide channel dropdown on ways-to-redeem create/edit coupon pages (sub-routes or when a form is open on the list page). */
function shouldHideChannelSelector(pathname: string | null): boolean {
  if (!pathname) return false;
  if (pathname === "/setup/ways-to-redeem") return false;
  return pathname.startsWith("/setup/ways-to-redeem/");
}

export interface SetupHeaderProps {
  /** When true, hide the channel dropdown (e.g. when create/edit coupon form is open on ways-to-redeem page). */
  hideChannelSelector?: boolean;
}

export default function SetupHeader({
  hideChannelSelector: hideChannelProp,
}: SetupHeaderProps = {}) {
  const pathname = usePathname();
  const router = useRouter();
  const hideByPath = shouldHideChannelSelector(pathname);
  const hideChannelSelector = hideChannelProp === true || hideByPath;
  const selectedChannel = useAppSelector(
    (state) => state.channel.selectedChannel,
  );
  const [storePlan, setStorePlan] = useState<StorePlan | null>(null);

  // Get setup progress directly from Redux store (automatically updates when completion status changes)
  const setupProgress = selectedChannel?.setupprogress ?? 0;

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
    <div className="flex flex-col gap-4">
      {/* Order Limit Warning Banner */}
      {storePlan?.plan === "paid" && storePlan?.limitReached && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-yellow-800">
                Order Limit Reached ({storePlan.orderCount?.toLocaleString()}/
                {storePlan.selectedOrderLimit?.toLocaleString()})
              </p>
              <p className="text-xs text-yellow-700">
                Premium features are currently restricted. Upgrade your plan to
                continue using all Pro features.
              </p>
            </div>
            <Button
              size="sm"
              className="custom-btn flex-shrink-0"
              onClick={() => router.push("/pricing")}
            >
              Upgrade Now
            </Button>
          </div>
        </div>
      )}

      <div className="flex gap-2 justify-between items-center">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold">Setup FavLoyalty</h1>
          <p>Configure how customers earn and use rewards.</p>
        </div>

        <div className="flex gap-2.5 items-center">
          {!hideChannelSelector && <ChannelSelector />}
          <div className="relative">
            {!selectedChannel ? (
              <Skeleton className="h-7 w-32 rounded-full" />
            ) : (
              (() => {
                // Dynamic progress calculation
                const completed = setupProgress;
                const total = 4;
                const progress = Math.round((completed / total) * 100);

                const colors = getProgressColors(progress);

                return (
                  <span className="inline-flex items-center gap-2 rounded-full border border-[#DEDEDE] bg-white px-2 py-1 text-[#303030] font-medium">
                    <span>
                      {completed} / {total} completed
                    </span>
                    {progress === 0 ? (
                      <span
                        className="h-4 w-4 rounded-full border-2"
                        style={{
                          borderColor: colors.borderColor,
                          backgroundColor: colors.backgroundColor,
                        }}
                      />
                    ) : colors.showCheckmark ? (
                      <span
                        className="h-4 w-4 rounded-full flex items-center justify-center"
                        style={{
                          backgroundColor: colors.completedColor,
                        }}
                      >
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 10 10"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M8.33333 2.5L3.75 7.08333L1.66667 5"
                            stroke="white"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    ) : (
                      <span
                        className="h-4 w-4 rounded-full border"
                        style={{
                          backgroundImage: getConic(
                            progress,
                            colors.completedColor,
                            colors.backgroundColor,
                          ),
                          borderColor: colors.borderColor,
                        }}
                      />
                    )}
                  </span>
                );
              })()
            )}
          </div>
          {/* Only show Upgrade button for free plan users */}
          {storePlan?.plan === "free" && (
            <Button
              onClick={() => {
                router.push("/pricing");
              }}
              className="custom-btn"
            >
              Upgrade
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
