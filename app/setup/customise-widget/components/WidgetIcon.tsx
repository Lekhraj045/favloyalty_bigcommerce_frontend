"use client";

import React, { useEffect, useRef } from "react";
import { Gift, Check } from "lucide-react";
import Image from "next/image";
import ColorPickerField from "./ColorPickerField";
import { useWidgetCustomization } from "../context/WidgetCustomizationContext";
import { getStorePlan, StorePlan } from "@/utils/api";
import UpgradeModal from "@/components/UpgradeModal";

export default function WidgetIconArea() {
  const { state, updateState } = useWidgetCustomization();
  const selectedLauncher = state.selectedLauncher;
  const selectedWidgetIcon = state.selectedWidgetIcon;
  const selectedAlignment = state.widgetButton;
  const [storePlan, setStorePlan] = React.useState<StorePlan | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = React.useState<boolean>(false);
  const hasDisabledRestrictedOptionsRef = useRef<boolean>(false);

  // Helper function to check if user is on free plan or order limit reached
  const isFreePlan = () => {
    return storePlan?.plan === "free" || storePlan?.limitReached === true;
  };

  // Load store plan information
  useEffect(() => {
    const loadStorePlan = async () => {
      try {
        const plan = await getStorePlan();
        setStorePlan(plan);
      } catch (error) {
        console.error("Error loading store plan:", error);
        // Default to free plan if error
        setStorePlan({ plan: "free", trialDaysRemaining: null, paypalSubscriptionId: null, limitReached: false, orderCount: 0, selectedOrderLimit: 0 });
      }
    };
    loadStorePlan();
  }, []);

  // Disable restricted options for free users or when limit reached if they're selected
  useEffect(() => {
    if (
      storePlan &&
      (storePlan.plan === "free" || storePlan.limitReached === true) &&
      !hasDisabledRestrictedOptionsRef.current
    ) {
      // Disable restricted launcher options
      if (selectedLauncher !== "icon-only") {
        updateState({ selectedLauncher: "icon-only" });
      }
      // Disable restricted placement options
      if (selectedAlignment !== "bottom-left") {
        updateState({ widgetButton: "bottom-left" });
      }
      // Disable restricted widget icons (only allow widget-icon1)
      if (selectedWidgetIcon && selectedWidgetIcon !== "widget-icon1") {
        updateState({ selectedWidgetIcon: "widget-icon1" });
      }
      hasDisabledRestrictedOptionsRef.current = true;
    }
  }, [storePlan, selectedLauncher, selectedAlignment, selectedWidgetIcon, updateState]);

  const launchers = [
    {
      id: "icon-only",
      label: "Icon only",
      isPremium: false,
    },
    {
      id: "label-only",
      label: "Label only",
      isPremium: true,
    },
    {
      id: "icon-label",
      label: "Icon & label",
      isPremium: true,
    },
  ];

  const handleLauncherClick = (launcherId: string, isPremium: boolean) => {
    if (isFreePlan() && isPremium) {
      setShowUpgradeModal(true);
      return;
    }
    updateState({ selectedLauncher: launcherId });
  };

  const handleWidgetIconClick = (iconId: string, isPremium: boolean) => {
    if (isFreePlan() && isPremium) {
      setShowUpgradeModal(true);
      return;
    }
    updateState({ selectedWidgetIcon: iconId });
  };

  const handlePlacementClick = (placement: string, isPremium: boolean) => {
    if (isFreePlan() && isPremium) {
      setShowUpgradeModal(true);
      return;
    }
    updateState({ widgetButton: placement });
  };

  return (
    <div className="card !p-0">
      <div className="flex flex-col">
        <div className="flex flex-col gap-1 border-b border-[#DEDEDE] p-4">
          <h2 className="text-sm font-bold">Widget Icon</h2>
          <p>Choose a widget icon for your widget.</p>
        </div>

        <div className="p-4 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-1">
              <h2 className="text-[13px] font-bold">Launcher</h2>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {launchers.map((launcher) => {
                const isSelected = selectedLauncher === launcher.id;
                const bgColor = isSelected ? "bg-[#055a45]" : "bg-[#999999]";
                const isPremium = isFreePlan() && launcher.isPremium;

                return (
                  <div
                    key={launcher.id}
                    className="flex flex-col gap-2 items-center w-full relative"
                  >
                    <div
                      className={`border rounded-md p-3 relative transition-colors w-full flex items-center justify-center ${
                        isPremium
                          ? "cursor-not-allowed opacity-60 blur-[0.5px]"
                          : "cursor-pointer hover:border-[#D4D1D1] hover:shadow-xs"
                      } ${
                        isSelected
                          ? "border-2 border-[#392D5D] shadow-xs"
                          : "border-[#DEDEDE]"
                      }`}
                      onClick={() => handleLauncherClick(launcher.id, launcher.isPremium)}
                    >
                      {launcher.id === "icon-only" && (
                        <div
                          className={`w-12 h-12 ${bgColor} rounded-full flex items-center justify-center`}
                        >
                          <Image
                            src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/widget-icon1.svg`}
                            alt="widget-icon1"
                            width={24}
                            height={24}
                            priority
                          />
                        </div>
                      )}
                      {launcher.id === "label-only" && (
                        <div
                          className={`${bgColor} rounded-full px-4 py-2 w-full h-12 flex items-center justify-center`}
                        >
                          <span className="text-white text-sm font-medium">
                            Reward
                          </span>
                        </div>
                      )}
                      {launcher.id === "icon-label" && (
                        <div
                          className={`${bgColor} rounded-full px-4 py-2 w-full h-12 flex items-center justify-center gap-2`}
                        >
                          <Image
                            src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/widget-icon1.svg`}
                            alt="widget-icon1"
                            width={24}
                            height={24}
                            priority
                          />
                          <span className="text-white text-sm font-medium">
                            Reward
                          </span>
                        </div>
                      )}
                      {isPremium && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center z-10">
                          <svg
                            className="w-3 h-3 text-yellow-800"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </div>
                      )}
                      {isSelected && !isPremium && (
                        <div className="absolute top-0 right-0 w-4 h-4 bg-[#22c55e] rounded-full flex items-center justify-center transform translate-x-1/2 -translate-y-1/2 shadow-[0_0_0_5px_rgba(255,255,255,100)]">
                          <Check
                            className="w-2.5 h-2.5 text-white"
                            strokeWidth={3}
                          />
                        </div>
                      )}
                    </div>
                    <span className={`text-xs text-[#616161] ${isPremium ? "opacity-60 blur-[0.5px]" : ""}`}>
                      {launcher.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {(selectedLauncher === "icon-only" || selectedLauncher === "icon-label") && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <h2 className="text-[13px] font-bold">Select Widget Icon</h2>
              </div>

              <div className="flex gap-4">
                {[1, 2, 3, 4].map((num) => {
                  const iconId = `widget-icon${num}`;
                  const isPremium = isFreePlan() && num !== 1; // Only first icon (widget-icon1) is free
                  return (
                    <div
                      key={iconId}
                      className={`w-[60px] h-[60px] rounded-full bg-[#055a45] flex items-center justify-center relative transition-colors ${
                        isPremium
                          ? "cursor-not-allowed opacity-60 blur-[0.5px]"
                          : "cursor-pointer"
                      }`}
                      onClick={() => handleWidgetIconClick(iconId, isPremium)}
                    >
                      <Image
                        src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/${iconId}.svg`}
                        alt={iconId}
                        width={30}
                        height={30}
                        priority
                        style={{
                          width: "30px",
                          height: "30px",
                          objectFit: "contain",
                        }}
                      />
                      {isPremium && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center z-10">
                          <svg
                            className="w-3 h-3 text-yellow-800"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </div>
                      )}
                      {selectedWidgetIcon === iconId && !isPremium && (
                        <div className="absolute top-1.5 right-1 w-4 h-4 bg-[#22c55e] rounded-full flex items-center justify-center transform translate-x-1/2 -translate-y-1/2 shadow-[0_0_0_5px_rgba(255,255,255,100)]">
                          <Check
                            className="w-2.5 h-2.5 text-white"
                            strokeWidth={3}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {(selectedLauncher === "label-only" || selectedLauncher === "icon-label") && (
            <div className="flex flex-col gap-1">
              <div className="flex flex-col gap-1">
                <h2 className="text-[13px] font-bold">Label</h2>
                <p className="text-xs text-[#616161]">
                  {state.label.length}/10 characters (letters and numbers only)
                </p>
              </div>

              <div className="">
                <input
                  type="text"
                  value={state.label}
                  maxLength={10}
                  onChange={(e) => {
                    // Only allow alphanumeric characters (letters and numbers)
                    const filteredValue = e.target.value.replace(/[^a-zA-Z0-9]/g, "");
                    updateState({ label: filteredValue });
                  }}
                  className="w-full h-8 border border-[#8a8a8a] rounded-lg px-3 text-[13px] leading-none focus:outline-none bg-[#fdfdfd]"
                  placeholder="Enter label"
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-1">
              <h2 className="text-[13px] font-bold">
                Placement of widget on your website
              </h2>
            </div>

            <div className="flex gap-4">
              <div
                className="flex flex-col gap-2 items-center cursor-pointer relative"
                onClick={() => updateState({ widgetButton: "bottom-left" })}
              >
                <div
                  className={`w-[90px] h-[60px] rounded-lg bg-white relative ${
                    selectedAlignment === "bottom-left"
                      ? "border-2 border-[#392D5D]"
                      : "border border-[#DEDEDE]"
                  }`}
                >
                  <div
                    className={`absolute bottom-2 left-2 w-6 h-6 rounded ${
                      selectedAlignment === "bottom-left"
                        ? "bg-[#392D5D]"
                        : "bg-[#DEDEDE]"
                    }`}
                  />
                  {selectedAlignment === "bottom-left" && (
                    <div className="absolute top-0 right-0 w-4 h-4 bg-[#22c55e] rounded-full flex items-center justify-center transform translate-x-1/2 -translate-y-1/2 shadow-[0_0_0_5px_rgba(255,255,255,100)]">
                      <Check
                        className="w-2.5 h-2.5 text-white"
                        strokeWidth={3}
                      />
                    </div>
                  )}
                </div>
                <span className="text-xs text-[#616161]">Bottom left</span>
              </div>

              <div
                className="flex flex-col gap-2 items-center cursor-pointer relative"
                onClick={() => updateState({ widgetButton: "bottom-right" })}
              >
                <div
                  className={`w-[90px] h-[60px] rounded-lg bg-white relative ${
                    selectedAlignment === "bottom-right"
                      ? "border-2 border-[#392D5D]"
                      : "border border-[#DEDEDE]"
                  }`}
                >
                  <div
                    className={`absolute bottom-2 right-2 w-6 h-6 rounded ${
                      selectedAlignment === "bottom-right"
                        ? "bg-[#392D5D]"
                        : "bg-[#DEDEDE]"
                    }`}
                  />
                  {selectedAlignment === "bottom-right" && (
                    <div className="absolute top-0 right-0 w-4 h-4 bg-[#22c55e] rounded-full flex items-center justify-center transform translate-x-1/2 -translate-y-1/2 shadow-[0_0_0_5px_rgba(255,255,255,100)]">
                      <Check
                        className="w-2.5 h-2.5 text-white"
                        strokeWidth={3}
                      />
                    </div>
                  )}
                </div>
                <span className="text-xs text-[#616161]">Bottom right</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        featureName="Premium Widget Customization"
      />
    </div>
  );
}
