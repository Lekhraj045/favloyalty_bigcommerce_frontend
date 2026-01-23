"use client";

import SetupHeader from "@/components/SetupHeader";
import SetupNavigation from "@/components/SetupNavigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateChannelCompletionStatus } from "@/store/slices/channelSlice";
import {
  getStoreId,
  getWidgetCustomization,
  saveWidgetCustomization,
  updatePageCompletionStatus,
  updateSetupProgress,
} from "@/utils/api";
import { Button } from "@heroui/button";
import { addToast } from "@heroui/toast";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AnnouncementsArea from "./components/Announcements";
import BackgroundPatternArea from "./components/BackgroundPattern";
import CustomiseWidgetArea from "./components/CustomiseWidget";
import LoadingSkeleton from "./components/LoadingSkeleton";
import WidgetIconArea from "./components/WidgetIcon";
import WidgetPreviewArea from "./components/WidgetPreview";
import {
  WidgetCustomizationProvider,
  useWidgetCustomization,
} from "./context/WidgetCustomizationContext";

function CustomiseWidgetContent() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const selectedChannel = useAppSelector(
    (state) => state.channel.selectedChannel
  );
  const storeId = getStoreId();
  const channelId = selectedChannel?.id || "";
  const { state, loadData } = useWidgetCustomization();

  const [saveLoading, setSaveLoading] = useState(false);
  const [saveAndNextLoading, setSaveAndNextLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load existing widget customization data on mount (only once when storeId/channelId changes)
  useEffect(() => {
    let isMounted = true;

    const loadWidgetData = async () => {
      if (!storeId || !channelId) {
        if (isMounted) {
          setLoading(false);
        }
        return;
      }

      try {
        const data = await getWidgetCustomization(storeId, channelId);
        if (isMounted && data) {
          loadData(data);
        }
      } catch (error: any) {
        console.error("Error loading widget customization:", error);
        // Don't show error toast, just use defaults
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadWidgetData();

    return () => {
      isMounted = false;
    };
  }, [storeId, channelId]); // Removed loadData from dependencies

  // Map launcher type from frontend format to backend format
  const mapLauncherType = (
    launcher: string
  ): "IconOnly" | "LabelOnly" | "Icon&Label" => {
    switch (launcher) {
      case "icon-only":
        return "IconOnly";
      case "label-only":
        return "LabelOnly";
      case "icon-label":
        return "Icon&Label";
      default:
        return "IconOnly";
    }
  };

  // Map widget button position from frontend format to backend format
  const mapWidgetButton = (alignment: string): string => {
    const mapping: Record<string, string> = {
      "bottom-left": "Bottom-Left",
      "bottom-right": "Bottom-Right",
      "top-left": "Top-Left",
      "top-right": "Top-Right",
    };
    return mapping[alignment] || "Bottom-Left";
  };

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
      // Prepare widget customization data from context state
      // Remove temporary _id from announcements before sending to backend
      const cleanedAnnouncements = state.announcements.map(
        ({ _id, ...announcement }) => ({
          enable: announcement.enable,
          image: announcement.image,
          link: announcement.link,
        })
      );

      const widgetData = {
        widgetIconUrlId: state.selectedWidgetIcon || null,
        widgetIconColor: state.widgetIconColor,
        widgetBgColor: state.widgetBgColor,
        headingColor: state.headingColor,
        LauncherType: mapLauncherType(state.selectedLauncher),
        Label:
          state.selectedLauncher === "label-only" ||
          state.selectedLauncher === "icon-label"
            ? state.label
            : null,
        backgroundPatternEnabled:
          state.selectedPattern !== "none" && state.selectedPattern !== null,
        widgetButton: mapWidgetButton(state.widgetButton),
        announcements: cleanedAnnouncements,
        displayOption: state.displayOption,
        backgroundPatternUrlId:
          state.selectedPattern && state.selectedPattern !== "none"
            ? state.selectedPattern
            : null,
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
        // Update setup progress to 4 (only increases, never decreases)
        try {
          await updateSetupProgress(channelId, 4);
        } catch (error) {
          console.error("Error updating setup progress:", error);
          // Don't fail the save if progress update fails
        }

        // Check if page is completed: Brand colors, Background Pattern, and Widget Icon are selected
        // Note: "none" is a valid background pattern selection - any selection (including "none") means the page is complete
        // A pattern is considered selected if it's a non-empty string (including "none")
        const hasValidBgColor = !!(state.widgetBgColor && state.widgetBgColor.trim() !== "");
        // Check that selectedPattern is a truthy string value (this includes "none", "pattern1", etc.)
        const hasValidPattern = typeof state.selectedPattern === "string" && state.selectedPattern.trim() !== "";
        const hasValidWidgetIcon = !!(state.selectedWidgetIcon && state.selectedWidgetIcon.trim() !== "");
        
        const isPageCompleted: boolean = hasValidBgColor && hasValidPattern && hasValidWidgetIcon;
        
        console.log("Page completion check:", {
          hasValidBgColor,
          hasValidPattern,
          hasValidWidgetIcon,
          selectedPattern: state.selectedPattern,
          selectedPatternType: typeof state.selectedPattern,
          isPageCompleted
        });

        // Update page completion status
        if (channelId) {
          try {
            await updatePageCompletionStatus(
              channelId,
              "customiseWidget",
              isPageCompleted
            );
            // Update Redux store to reflect the new completion status
            dispatch(
              updateChannelCompletionStatus({
                channelId: channelId,
                pageType: "customiseWidget",
                completed: isPageCompleted,
              })
            );
          } catch (error) {
            console.error("Error updating page completion status:", error);
            // Don't fail the save if completion status update fails
          }
        }

        // Reload data from backend to get updated _id fields and ensure sync
        try {
          const updatedData = await getWidgetCustomization(storeId, channelId);
          if (updatedData) {
            loadData(updatedData);
          }
        } catch (error) {
          console.error("Error reloading widget customization:", error);
          // Don't fail the save if reload fails
        }

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

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col gap-4">
        <div className="head">
          <SetupHeader />
          <SetupNavigation />
        </div>

        <div className="flex gap-4 items-start">
          <div className="flex-1">
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center gap-6">
                <div className="flex flex-col gap-1">
                  <h2 className="text-base font-bold">Customise Widget</h2>
                </div>
              </div>

              <CustomiseWidgetArea />

              <BackgroundPatternArea />

              <WidgetIconArea />

              <AnnouncementsArea />
            </div>
          </div>

          <div className="sticky top-1 w-[330px] min-h-[300px]">
            <div className="flex justify-between items-center gap-6 mb-4">
              <div className="flex flex-col gap-1">
                <h2 className="text-base font-bold">Preview</h2>
              </div>
            </div>

            <WidgetPreviewArea />
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

export default function CustomiseWidget() {
  return (
    <WidgetCustomizationProvider>
      <CustomiseWidgetContent />
    </WidgetCustomizationProvider>
  );
}
