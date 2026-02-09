"use client";

import { useAppSelector } from "@/store/hooks";
import { Accordion, AccordionItem } from "@heroui/accordion";
import Image from "next/image";

// Map of completion flags to their corresponding messages
const DISABLED_REASONS_MAP: {
  key: "pointsTierSystemCompleted" | "waysToEarnCompleted" | "waysToRedeemCompleted" | "customiseWidgetCompleted";
  message: string;
}[] = [
  { key: "pointsTierSystemCompleted", message: "Point Setting is not yet setup" },
  { key: "waysToEarnCompleted", message: "Earn Setting is disabled or not yet setup" },
  { key: "waysToRedeemCompleted", message: "Redeem Setting is disabled or not yet setup" },
  { key: "customiseWidgetCompleted", message: "Design Setting is not yet setup" },
];

export default function WhyWidgetDisable() {
  const selectedChannel = useAppSelector(
    (state) => state.channel.selectedChannel,
  );

  // Filter to only show reasons for incomplete settings
  const incompleteReasons = DISABLED_REASONS_MAP.filter(
    (reason) => !selectedChannel?.[reason.key]
  );

  // If all settings are complete, don't render anything
  if (incompleteReasons.length === 0) {
    return null;
  }

  return (
    <div className="card !px-2">
      <Accordion
        variant="splitted"
        selectionMode="multiple"
        defaultExpandedKeys={["widgetDisabled"]}
        itemClasses={{
          base: "bg-transparent shadow-none px-0",
          title: "text-sm font-semibold text-[#111]",
          trigger: "cursor-pointer py-0",
          indicator:
            "border border-[#E4E4E7] rounded-full p-1 text-[#1D1D1F] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.1)] -rotate-90 transition-transform duration-300 ease-out data-[open=true]:rotate-90",
          content: "text-sm text-[#3F3F46]",
        }}
      >
        <AccordionItem
          key="widgetDisabled"
          aria-label="Why my widget is disabled?"
          title="Why my widget is disabled?"
        >
          <div className="mt-2">
            <div className="flex flex-col gap-3">
              {incompleteReasons.map((reason) => (
                <div key={reason.key} className="flex items-center gap-2">
                  <Image
                    src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/incomplete-icon.svg`}
                    alt="Widget Disabled"
                    width={18}
                    height={18}
                  />
                  <p>{reason.message}</p>
                </div>
              ))}
            </div>
          </div>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
