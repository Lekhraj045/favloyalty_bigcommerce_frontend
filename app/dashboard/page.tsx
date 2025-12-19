"use client";

import ChannelSelector from "@/components/ChannelSelector";
import { Button } from "@heroui/button";
import DashLayout from "./components/dash-layout";
import SetupBar from "./components/setup-bar";
import WhyWidgetDisable from "./components/why-widget-disbale";

export default function DashboardPage() {
  return (
    <>
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col gap-4">
          <div className="flex gap-2 justify-between items-center">
            <h1 className="text-xl font-bold">Dashboard</h1>

            <div className="flex gap-2.5 items-center">
              <div className="relative offline-widget pl-6">
                <p className="font-bold">Loyalty program not active</p>
              </div>
              <ChannelSelector />
              <Button className="custom-btn">Disable Widget</Button>
              <Button className="custom-btn danger-btn">Reset Settings</Button>
            </div>
          </div>

          <WhyWidgetDisable />

          <SetupBar />

          <DashLayout />
        </div>
      </div>
    </>
  );
}
