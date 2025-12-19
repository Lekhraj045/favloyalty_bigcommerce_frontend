"use client";

import PointsSetting from "./setup/points-tier-system/PointsSetting";
import SetupNavigation from "@/components/SetupNavigation";
import SetupHeader from "@/components/SetupHeader";

export default function Home() {

  return (
    <>
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col gap-4">
          <div className="head">
            <SetupHeader />
            <SetupNavigation />
          </div>

          <PointsSetting />
        </div>
      </div>
    </>
  );
}
