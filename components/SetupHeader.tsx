"use client";

import ChannelSelector from "@/components/ChannelSelector";
import { Button } from "@heroui/button";

export default function SetupHeader() {
  return (
    <div className="flex gap-2 justify-between items-center">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold">Setup FavLoyalty</h1>
        <p>Configure how customers earn and use rewards.</p>
      </div>

      <div className="flex gap-2.5 items-center">
        <ChannelSelector />
        <div className="relative">
          {(() => {
            // Dynamic progress calculation
            const completed = 4; // Update this based on your app state 1, 2, 3, 4
            const total = 4;
            const progress = Math.round((completed / total) * 100);

            // Color configuration based on progress
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

            // Helper to generate conic-gradient according to progress
            const getConic = (
              val: number,
              completedColor: string,
              backgroundColor: string
            ) => {
              if (val === 0)
                return `conic-gradient(${backgroundColor} 0 100%)`;
              if (val === 25)
                return `conic-gradient(${completedColor} 0 25%, ${backgroundColor} 25% 100%)`;
              if (val === 50)
                return `conic-gradient(${completedColor} 0 50%, ${backgroundColor} 50% 100%)`;
              if (val === 75)
                return `conic-gradient(${completedColor} 0 75%, ${backgroundColor} 75% 100%)`;
              if (val === 100)
                return `conic-gradient(${completedColor} 0 100%)`;
              return `conic-gradient(${backgroundColor} 0 100%)`;
            };

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
                        colors.backgroundColor
                      ),
                      borderColor: colors.borderColor,
                    }}
                  />
                )}
              </span>
            );
          })()}
        </div>
        <Button className="custom-btn">Upgrade</Button>
      </div>
    </div>
  );
}
