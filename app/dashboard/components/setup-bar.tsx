"use client";

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
  const selectedChannel = useAppSelector(
    (state) => state.channel.selectedChannel
  );

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

  const handleEditSetup = () => {
    router.push("/setup/points-tier-system");
  };

  return (
    <div className="dashboardbox setup-bar">
      <div className="card">
        <div className="flex items-center gap-2">
          <div className="flex gap-4 items-center w-full">
            <div className="flex gap-4 grow">
              <SetupStep
                label="Point"
                completed={pointsTierSystemCompleted}
                route="/setup/points-tier-system"
              />

              <SetupStep 
                label="Earn" 
                completed={waysToEarnCompleted}
                route="/setup/ways-to-earn"
              />

              <SetupStep 
                label="Redeem" 
                completed={waysToRedeemCompleted}
                route="/setup/ways-to-redeem"
              />

              <SetupStep 
                label="Design" 
                completed={customiseWidgetCompleted}
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
