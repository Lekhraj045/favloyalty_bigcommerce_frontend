"use client";

import React, { useState } from "react";
import { Gift, Check } from "lucide-react";
import Image from "next/image";
import ColorPickerField from "./ColorPickerField";

export default function WidgetIconArea() {
  const [selectedLauncher, setSelectedLauncher] = useState<string>("icon-only");
  const [selectedWidgetIcon, setSelectedWidgetIcon] =
    useState<string>("widget-icon1");
  const [selectedAlignment, setSelectedAlignment] =
    useState<string>("bottom-right");

  const launchers = [
    {
      id: "icon-only",
      label: "Icon only",
    },
    {
      id: "label-only",
      label: "Label only",
    },
    {
      id: "icon-label",
      label: "Icon & label",
    },
  ];

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

                return (
                  <div
                    key={launcher.id}
                    className="flex flex-col gap-2 items-center w-full"
                  >
                    <div
                      className={`border rounded-md p-3 relative cursor-pointer transition-colors w-full flex items-center justify-center ${
                        isSelected
                          ? "border-2 border-[#392D5D] shadow-xs"
                          : "border-[#DEDEDE] hover:border-[#D4D1D1] hover:shadow-xs"
                      }`}
                      onClick={() => setSelectedLauncher(launcher.id)}
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
                      {isSelected && (
                        <div className="absolute top-0 right-0 w-4 h-4 bg-[#22c55e] rounded-full flex items-center justify-center transform translate-x-1/2 -translate-y-1/2 shadow-[0_0_0_5px_rgba(255,255,255,100)]">
                          <Check
                            className="w-2.5 h-2.5 text-white"
                            strokeWidth={3}
                          />
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-[#616161]">
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
                  return (
                    <div
                      key={iconId}
                      className={`w-[60px] h-[60px] rounded-full bg-[#055a45] flex items-center justify-center relative cursor-pointer transition-colors `}
                      onClick={() => setSelectedWidgetIcon(iconId)}
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
                      {selectedWidgetIcon === iconId && (
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
              </div>

              <div className="">
                <input
                  type="text"
                  value={"Reward"}
                  className="w-full h-8 border border-[#8a8a8a] rounded-lg px-3 text-[13px] leading-none focus:outline-none bg-[#fdfdfd]"
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
                onClick={() => setSelectedAlignment("bottom-left")}
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
                onClick={() => setSelectedAlignment("bottom-right")}
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
    </div>
  );
}
