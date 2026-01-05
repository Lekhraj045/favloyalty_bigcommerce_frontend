"use client";

import React from "react";
import SetupNavigation from "@/components/SetupNavigation";
import SetupHeader from "@/components/SetupHeader";
import CustomiseWidgetArea from "./components/CustomiseWidget";
import BackgroundPatternArea from "./components/BackgroundPattern";
import WidgetIconArea from "./components/WidgetIcon";
import WidgetPreviewArea from "./components/WidgetPreview";
import AnnouncementsArea from "./components/Announcements";

export default function CustomiseWidget() {
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
