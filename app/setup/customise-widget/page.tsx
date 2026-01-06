"use client";

import SetupHeader from "@/components/SetupHeader";
import SetupNavigation from "@/components/SetupNavigation";
import { useAppSelector } from "@/store/hooks";
import { getStoreId, saveWidgetCustomization } from "@/utils/api";
import { Button } from "@heroui/button";
import { addToast } from "@heroui/toast";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CustomiseWidget() {
  const router = useRouter();
  const selectedChannel = useAppSelector(
    (state) => state.channel.selectedChannel
  );
  const storeId = getStoreId();
  const channelId = selectedChannel?.id || "";

  const [saveLoading, setSaveLoading] = useState(false);
  const [saveAndNextLoading, setSaveAndNextLoading] = useState(false);

  // Handle save
  const handleSave = async (isNext: boolean = false) => {
    console.log("handleSave called with isNext:", isNext);

    if (!storeId || !channelId) {
      addToast({
        title: "Error",
        description: "Store ID or Channel ID is missing",
        color: "danger",
      });
      return;
    }

    const loadingSetter = isNext ? setSaveAndNextLoading : setSaveLoading;
    loadingSetter(true);

    try {
      // Prepare widget customization data
      // TODO: Replace with actual form data when widget customization form is implemented
      const widgetData = {
        widgetIconUrlId: null,
        widgetBgColor: "#62a63f",
        backgroundPatternEnabled: false,
        widgetButton: "Bottom-Left",
        announcements: [],
        displayOption: [],
        backgroundPatternUrlId: null,
      };

      const response = await saveWidgetCustomization(
        storeId,
        channelId,
        widgetData
      );

      console.log("Save response:", response);

      // Check if response is successful (handle both response.success and response.data cases)
      const isSuccess =
        response && (response.success === true || response.data);

      if (isSuccess) {
        addToast({
          title: "Success",
          description:
            response.message || "Widget customization saved successfully",
          color: "success",
        });

        // If Save & Next, redirect to dashboard
        if (isNext) {
          console.log("Save successful, navigating to dashboard...");
          // Reset loading state
          loadingSetter(false);

          // Navigate immediately using window.location.href (most reliable)
          window.location.href = "/dashboard";
          return;
        }
      } else {
        throw new Error(
          response?.message || "Save operation did not return success"
        );
      }
    } catch (error: any) {
      console.error("Error saving widget customization:", error);
      addToast({
        title: "Error",
        description: error.message || "Failed to save widget customization",
        color: "danger",
      });
      loadingSetter(false);
    } finally {
      // Only reset loading if not navigating (isNext = false)
      if (!isNext) {
        loadingSetter(false);
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col gap-4">
        <div className="head">
          <SetupHeader />
          <SetupNavigation />
        </div>

        <div className="card">
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-2">Customise Widget</h2>
            <p className="text-sm text-gray-600 mb-4">
              Configure widget appearance and behavior settings.
            </p>

            {/* TODO: Add widget customization form components here */}
            <div className="text-sm text-gray-500">
              Widget customization form will be implemented here.
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 justify-end mt-4">
          <Button
            color="primary"
            variant="flat"
            className="custom-btn-default"
            onClick={() => handleSave(false)}
            isLoading={saveLoading}
            disabled={saveLoading || saveAndNextLoading}
          >
            Save
          </Button>
          <Button
            className="custom-btn"
            onClick={() => handleSave(true)}
            isLoading={saveAndNextLoading}
            disabled={saveLoading || saveAndNextLoading}
          >
            Save & Next
          </Button>
        </div>
      </div>
    </div>
  );
}
