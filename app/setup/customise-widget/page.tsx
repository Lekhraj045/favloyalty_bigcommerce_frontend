"use client";

import SetupHeader from "@/components/SetupHeader";
import SetupNavigation from "@/components/SetupNavigation";
import AnnouncementsArea from "./components/Announcements";
import BackgroundPatternArea from "./components/BackgroundPattern";
import CustomiseWidgetArea from "./components/CustomiseWidget";
import WidgetIconArea from "./components/WidgetIcon";
import WidgetPreviewArea from "./components/WidgetPreview";

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
      </div>
    </div>
  );
}
