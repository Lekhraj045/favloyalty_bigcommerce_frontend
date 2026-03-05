"use client";

import { useState, useEffect } from "react";
import SetupNavigation from "@/components/SetupNavigation";
import { CheckBadgeIcon, ClockIcon } from "@heroicons/react/24/outline";
import { Button } from "@heroui/button";
import { useAppSelector } from "@/store/hooks";
import { useRouter } from "next/navigation";

interface SetupStepProps {
  label: string;
  completed: boolean;
  route: string;
}

function SetupStep({ label, completed, route }: SetupStepProps) {
  const router = useRouter();
  const Icon = completed ? CheckBadgeIcon : ClockIcon;
  const iconColor = completed ? "text-green-600" : "text-amber-400";
  
  const underlineColor = completed ? "bg-green-600" : "bg-amber-500";

  const handleClick = () => {
    router.push(route);
  };

  return (
    <Button 
      className="flex flex-col items-center justify-center bg-white border border-gray-200 rounded-lg relative px-6 py-3 h-[46px] w-full"
      onClick={handleClick}
    >
      <div className="flex justify-center items-center gap-1.5">
        <Icon className={`h-5 w-5 ${iconColor}`} />
        <span className="text-[13px] font-medium text-[#303030]">
          {label}
        </span>
      </div>
      <span className={`absolute bottom-0 left-0 w-full h-[3px] ${underlineColor} rounded-b-lg`}></span>
    </Button>
  );
}

export default function SetupBar() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const selectedChannel = useAppSelector(
    (state) => state.channel.selectedChannel
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  // Get completion status from channel, default to false if not available
  const pointsTierSystemCompleted =
    selectedChannel?.pointsTierSystemCompleted ?? false;
  const waysToEarnCompleted = selectedChannel?.waysToEarnCompleted ?? false;
  const waysToRedeemCompleted =
    selectedChannel?.waysToRedeemCompleted ?? false;
  const customiseWidgetCompleted =
    selectedChannel?.customiseWidgetCompleted ?? false;
  // Email is always complete
  const emailCompleted = true;

  // Use Redux-derived completion only after mount so server and first client render match
  const effectivePoints = mounted ? pointsTierSystemCompleted : false;
  const effectiveWaysToEarn = mounted ? waysToEarnCompleted : false;
  const effectiveWaysToRedeem = mounted ? waysToRedeemCompleted : false;
  const effectiveCustomise = mounted ? customiseWidgetCompleted : false;

  const handleEditSetup = () => {
    router.push("/setup/points-tier-system");
  };

  // Avoid hydration mismatch: render static shell until client has mounted, then show real steps
  if (!mounted) {
    return (
      <div className="dashboardbox setup-bar">
        <div className="card">
          <div className="flex items-center gap-2">
            <div className="flex gap-4 items-center w-full">
              <div className="flex gap-4 grow">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="h-[46px] flex-1 rounded-lg border border-gray-200 bg-gray-50 animate-pulse"
                  />
                ))}
              </div>
              <div className="h-10 w-24 rounded-lg bg-gray-100 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboardbox setup-bar">
      <div className="card">
        <div className="flex items-center gap-2">
          <div className="flex gap-4 items-center w-full">
            <div className="flex gap-4 grow">
              <SetupStep
                label="Point"
                completed={effectivePoints}
                route="/setup/points-tier-system"
              />

              <SetupStep 
                label="Earn" 
                completed={effectiveWaysToEarn}
                route="/setup/ways-to-earn"
              />

              <SetupStep 
                label="Redeem" 
                completed={effectiveWaysToRedeem}
                route="/setup/ways-to-redeem"
              />

              <SetupStep 
                label="Design" 
                completed={effectiveCustomise}
                route="/setup/customise-widget"
              />

              <SetupStep 
                label="Email" 
                completed={emailCompleted}
                route="/email"
              />
            </div>

            <Button className="custom-btn" onClick={handleEditSetup}>
              Edit Setup
            </Button>
          </div>
        </div>

        {/* <SetupNavigation /> */}
      </div>
    </div>
  );
}
