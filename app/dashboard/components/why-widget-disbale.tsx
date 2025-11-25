"use client";

import { Accordion, AccordionItem } from "@heroui/accordion";
import Image from "next/image";
export default function WhyWidgetDisable() {
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
              <div className="flex items-center gap-2">
                <Image
                  src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/incomplete-icon.svg`}
                  alt="Widget Disabled"
                  width={18}
                  height={18}
                />
                <p>Earn Setting is disabled or not yet setup</p>
              </div>

              <div className="flex items-center gap-2">
                <Image
                  src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/incomplete-icon.svg`}
                  alt="Widget Disabled"
                  width={18}
                  height={18}
                />
                <p>Redeem Setting is disabled or not yet setup</p>
              </div>
            </div>
          </div>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
