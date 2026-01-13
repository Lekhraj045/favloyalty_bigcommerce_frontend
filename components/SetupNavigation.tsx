"use client";

import { useRouter, usePathname } from "next/navigation";
import { CircleCheck, Scan } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { useEffect, useState } from "react";
import type { Channel } from "@/utils/api";

interface SetupNavigationProps {
  onNavigate?: (route: string) => void;
}

export default function SetupNavigation({ onNavigate }: SetupNavigationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const reduxSelectedChannel = useAppSelector(
    (state) => state.channel.selectedChannel
  );
  
  // Initialize from localStorage immediately (synchronous) to avoid delay on page reload
  const getInitialChannel = (): Channel | null => {
    if (typeof window === "undefined") return null;
    // First try Redux state if available
    if (reduxSelectedChannel) return reduxSelectedChannel;
    // Fallback to localStorage (synchronous read)
    const stored = localStorage.getItem("redux_selected_channel");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return null;
  };

  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(
    getInitialChannel
  );

  useEffect(() => {
    // Update when Redux state changes
    if (reduxSelectedChannel) {
      setSelectedChannel(reduxSelectedChannel);
    } else {
      // Fallback to localStorage if Redux state is cleared
      const stored = localStorage.getItem("redux_selected_channel");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setSelectedChannel(parsed);
        } catch (e) {
          console.error("Error parsing stored channel:", e);
        }
      }
    }
  }, [reduxSelectedChannel]);

  const handleNavigation = (route: string) => {
    if (onNavigate) {
      onNavigate(route);
    } else {
      router.push(route);
    }
  };

  const steps = [
    {
      label: "Points & Tier System",
      completed: selectedChannel?.pointsTierSystemCompleted || false,
      route: "/setup/points-tier-system",
    },
    {
      label: "Ways to Earn",
      completed: selectedChannel?.waysToEarnCompleted || false,
      route: "/setup/ways-to-earn",
    },
    {
      label: "Ways to Redeem",
      completed: selectedChannel?.waysToRedeemCompleted || false,
      route: "/setup/ways-to-redeem",
    },
    {
      label: "Customise Widget",
      completed: selectedChannel?.customiseWidgetCompleted || false,
      route: "/setup/customise-widget",
    },
  ];

  return (
    <>
      <div className="flex gap-3 mt-4 justify-between">
        <div className="flex gap-3">
          {steps.map((step) => {
            const isActive =
              pathname === step.route ||
              (pathname === "/" && step.route === "/setup/points-tier-system");

            return (
              <button
                key={step.label}
                onClick={() => handleNavigation(step.route)}
                className={`${isActive ? "custom-btn" : "custom-btn-default"} flex items-center gap-2 cursor-pointer`}
              >
                {step.label}
                {step.completed ? (
                  <CircleCheck size={16} />
                ) : (
                  <Scan size={16} />
                )}
              </button>
            );
          })}
        </div>

        <button className="custom-btn">Email</button>
      </div>
    </>
  );
}
