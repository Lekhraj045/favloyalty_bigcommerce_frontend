"use client";

import ChannelSelector from "@/components/ChannelSelector";
import { useAppSelector } from "@/store/hooks";
import {
  updateChannelAfterReset,
  updateChannelWidgetVisibility,
} from "@/store/slices/channelSlice";
import {
  resetChannelSettingsApi,
  updateWidgetVisibilityApi,
} from "@/utils/api";
import { Button } from "@heroui/button";
import { addToast } from "@heroui/toast";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import DashLayout from "./components/dash-layout";
import ResetSettingsModal from "./components/ResetSettingsModal";
import WhyWidgetDisable from "./components/why-widget-disbale";

const SetupBar = dynamic(() => import("./components/setup-bar"), { ssr: false });

export default function DashboardPage() {
  const dispatch = useDispatch();
  const selectedChannel = useAppSelector(
    (state) => state.channel.selectedChannel,
  );

  const [widgetToggleLoading, setWidgetToggleLoading] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Show the card when setupprogress is null, undefined, or less than 4
  const shouldShowWidgetDisabledCard =
    selectedChannel?.setupprogress == null || selectedChannel.setupprogress < 4;

  // Widget is considered "enabled" only when setup is complete AND widget_visibility is true
  const isWidgetEnabled =
    !!selectedChannel &&
    (selectedChannel.setupprogress || 0) === 4 &&
    selectedChannel.widget_visibility !== false;

  const effectiveWidgetEnabled = mounted ? isWidgetEnabled : false;

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

  const handleResetSettings = async () => {
    if (!selectedChannel?.id) {
      addToast({
        title: "No channel selected",
        description: "Please select a channel to reset settings.",
        color: "warning",
      });
      return;
    }

    setResetLoading(true);
    try {
      const result = await resetChannelSettingsApi(selectedChannel.id);
      if (result.success && result.data) {
        dispatch(
          updateChannelAfterReset({
            channelId: result.data.channelId,
            setupprogress: result.data.setupprogress,
            pointsTierSystemCompleted: result.data.pointsTierSystemCompleted,
            waysToEarnCompleted: result.data.waysToEarnCompleted,
            waysToRedeemCompleted: result.data.waysToRedeemCompleted,
            customiseWidgetCompleted: result.data.customiseWidgetCompleted,
            widget_visibility: result.data.widget_visibility,
          }),
        );
        setResetModalOpen(false);
        addToast({
          title: "Settings reset successfully",
          description:
            "All loyalty program settings have been reset to their default values for this channel.",
          color: "success",
        });
      }
    } catch (error: any) {
      console.error("Failed to reset settings:", error);
      addToast({
        title: "Reset failed",
        description:
          error?.message || "An error occurred while resetting settings.",
        color: "danger",
      });
    } finally {
      setResetLoading(false);
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
                className={`relative pl-6 ${effectiveWidgetEnabled ? "online-widget" : "offline-widget"}`}
              >
                <p className="font-bold">
                  {effectiveWidgetEnabled
                    ? "Loyalty program active"
                    : "Loyalty program not active"}
                </p>
              </div>
              <ChannelSelector />
              <Button
                className="custom-btn"
                onPress={handleToggleWidgetVisibility}
                isDisabled={!mounted || widgetToggleLoading || !selectedChannel?.id}
                isLoading={widgetToggleLoading}
              >
                {effectiveWidgetEnabled ? "Disable Widget" : "Enable Widget"}
              </Button>
              <Button
                className="custom-btn danger-btn"
                onPress={() => setResetModalOpen(true)}
                isDisabled={!mounted || !selectedChannel?.id}
              >
                Reset Settings
              </Button>
            </div>
          </div>

          {shouldShowWidgetDisabledCard && <WhyWidgetDisable />}

          <SetupBar />

          <DashLayout />

          <ResetSettingsModal
            isOpen={resetModalOpen}
            onClose={() => !resetLoading && setResetModalOpen(false)}
            onConfirm={handleResetSettings}
            isLoading={resetLoading}
          />
        </div>
      </div>
    </>
  );
}
