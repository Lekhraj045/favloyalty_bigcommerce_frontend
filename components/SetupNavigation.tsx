"use client";

import { useRouter, usePathname } from "next/navigation";
import { CircleCheck, Scan } from "lucide-react";

interface SetupNavigationProps {
  onNavigate?: (route: string) => void;
}

export default function SetupNavigation({ onNavigate }: SetupNavigationProps) {
  const router = useRouter();
  const pathname = usePathname();

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
      completed: true,
      route: "/setup/points-tier-system",
    },
    {
      label: "Ways to Earn",
      completed: false,
      route: "/setup/ways-to-earn",
    },
    {
      label: "Ways to Redeem",
      completed: false,
      route: "/setup/ways-to-redeem",
    },
    {
      label: "Customise Widget",
      completed: false,
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
