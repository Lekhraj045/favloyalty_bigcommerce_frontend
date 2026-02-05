"use client";

import ChannelSelector from "@/components/ChannelSelector";
import { useAppSelector } from "@/store/hooks";
import { updateChannelWidgetVisibility } from "@/store/slices/channelSlice";
import { updateWidgetVisibilityApi } from "@/utils/api";
import { Button } from "@heroui/button";
import { addToast } from "@heroui/toast";
import { useState } from "react";
import { useDispatch } from "react-redux";
import DashLayout from "./components/dash-layout";
import SetupBar from "./components/setup-bar";
import WhyWidgetDisable from "./components/why-widget-disbale";

export default function DashboardPage() {
  const dispatch = useDispatch();
  const selectedChannel = useAppSelector(
    (state) => state.channel.selectedChannel,
  );

  const [widgetToggleLoading, setWidgetToggleLoading] = useState(false);

  // Show the card when setupprogress is null, undefined, or less than 4
  const shouldShowWidgetDisabledCard =
    selectedChannel?.setupprogress == null || selectedChannel.setupprogress < 4;

  // Widget is considered "enabled" only when setup is complete AND widget_visibility is true
  const isWidgetEnabled =
    !!selectedChannel &&
    (selectedChannel.setupprogress || 0) === 4 &&
    selectedChannel.widget_visibility !== false;

  const handleToggleWidgetVisibility = async () => {
    if (!selectedChannel?.id) {
      console.error("No selected channel to toggle widget visibility");
      return;
    }

    const currentProgress = selectedChannel.setupprogress || 0;
    const nextVisible = !isWidgetEnabled;

    // If trying to enable but setup is not complete, just show toast and stop
    if (nextVisible && currentProgress < 4) {
      addToast({
        title: "Finish setup first",
        description: "To enable the widget, please finish the setup first",
        color: "warning",
      });
      return;
    }

    try {
      setWidgetToggleLoading(true);
      await updateWidgetVisibilityApi(selectedChannel.id, nextVisible);
      // Update local Redux state and localStorage
      // @ts-ignore - using thunk-like helper
      dispatch(updateChannelWidgetVisibility(selectedChannel.id, nextVisible));
      addToast({
        title: nextVisible ? "Widget enabled" : "Widget disabled",
        description: nextVisible
          ? "The loyalty widget has been enabled successfully."
          : "The loyalty widget has been disabled successfully.",
        color: "success",
      });
    } catch (error: any) {
      console.error("Failed to update widget visibility:", error);
      const message =
        error?.message || "An error occurred while updating widget visibility";
      addToast({
        title: "Widget update failed",
        description: message,
        color: "danger",
      });
    } finally {
      setWidgetToggleLoading(false);
    }
  };

  return (
    <>
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col gap-4">
          <div className="flex gap-2 justify-between items-center">
            <h1 className="text-xl font-bold">Dashboard</h1>

            <div className="flex gap-2.5 items-center">
              <div
                className={`relative pl-6 ${isWidgetEnabled ? "online-widget" : "offline-widget"}`}
              >
                <p className="font-bold">
                  {isWidgetEnabled
                    ? "Loyalty program active"
                    : "Loyalty program not active"}
                </p>
              </div>
              <ChannelSelector />
              <Button
                className="custom-btn"
                onPress={handleToggleWidgetVisibility}
                isDisabled={widgetToggleLoading || !selectedChannel?.id}
                isLoading={widgetToggleLoading}
              >
                {isWidgetEnabled ? "Disable Widget" : "Enable Widget"}
              </Button>
              <Button className="custom-btn danger-btn">Reset Settings</Button>
            </div>
          </div>

          {shouldShowWidgetDisabledCard && <WhyWidgetDisable />}

          <SetupBar />

          <DashLayout />
        </div>
      </div>
    </>
  );
}
