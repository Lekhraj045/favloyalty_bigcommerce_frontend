"use client";

import React from "react";
import Image from "next/image";
import { CircleSlash2, Check } from "lucide-react";
import { useWidgetCustomization } from "../context/WidgetCustomizationContext";

export default function BackgroundPatternArea() {
  const { state, updateState } = useWidgetCustomization();
  const selectedPattern = state.selectedPattern;

  const patterns = [
    { id: "none", component: <CircleSlash2 />, image: undefined, alt: undefined },
    { id: "pattern1", component: undefined, image: "wizard-pattern1.svg", alt: "Background Pattern 1" },
    { id: "pattern2", component: undefined, image: "wizard-pattern2.svg", alt: "Background Pattern 2" },
    { id: "pattern3", component: undefined, image: "wizard-pattern3.svg", alt: "Background Pattern 3" },
    { id: "pattern4", component: undefined, image: "wizard-pattern4.svg", alt: "Background Pattern 4" },
  ];

  return (
    <>
      <div className="card">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-sm font-bold">Background Pattern</h2>
            <p>Choose a background pattern for your widget.</p>
          </div>

          <div className="flex gap-4">
            {patterns.map((pattern) => (
              <div
                key={pattern.id}
                className={`border rounded-md p-1 w-[70px] h-[46px] relative cursor-pointer transition-colors ${
                  selectedPattern === pattern.id
                    ? "border-2 border-[#392D5D] shadow-xs"
                    : "border-[#DEDEDE] hover:border-[#D4D1D1] hover:shadow-xs"
                }`}
                onClick={() => updateState({ selectedPattern: pattern.id })}
              >
                {pattern.component ? (
                  <div className="w-full h-full flex items-center justify-center">
                    {pattern.component}
                  </div>
                ) : pattern.image && pattern.alt ? (
                  <div className="w-full h-full overflow-hidden">
                    <Image
                      src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/${pattern.image}`}
                      alt={pattern.alt}
                      width={70}
                      height={36}
                      priority
                      style={{ width: "70px", height: "36px", objectFit: "contain" }}
                    />
                  </div>
                ) : null}
                {selectedPattern === pattern.id && (
                  <div className="absolute top-0 right-0 w-4 h-4 bg-[#22c55e] rounded-full flex items-center justify-center transform translate-x-1/2 -translate-y-1/2 shadow-[0_0_0_5px_rgba(255,255,255,100)]">
                    <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
