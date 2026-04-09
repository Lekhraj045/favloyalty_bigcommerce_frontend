"use client";

import SetupHeader from "@/components/SetupHeader";
import SetupNavigation from "@/components/SetupNavigation";
import React from "react";
import PointsSetting from "./PointsSetting";

export default function PointsTierSystem() {
  const [onNavigate, setOnNavigate] =
    React.useState<((route: string) => void)>();

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col gap-4">
        <div className="head">
          <SetupHeader />
          <SetupNavigation onNavigate={onNavigate} />
        </div>
        <PointsSetting exposeNavigate={setOnNavigate} />
      </div>
    </div>
  );
}
