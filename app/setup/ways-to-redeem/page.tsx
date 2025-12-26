"use client";

import React from "react";
import SetupNavigation from "@/components/SetupNavigation";
import SetupHeader from "@/components/SetupHeader";
import { Switch } from "@heroui/switch";
import { Button } from "@heroui/button";
import Image from "next/image";
import WaysModal from "./components/WaysRedeemModal";
import WaysRedeemTable from "./components/WaysRedeemTable";
import { Trash2 } from "lucide-react";

export default function WaysToRedeem() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col gap-4">
        <div className="head">
          <SetupHeader />
          <SetupNavigation />
        </div>

        <div className="flex flex-col gap-4">
          <div className="card !p-0">
            <div className="flex justify-between items-center gap-6 p-4 border-b border-[#DEDEDE]">
              <div className="flex flex-col gap-1">
                <h2 className="text-base font-bold">Ways to Redeem</h2>
              </div>

              <div className="flex gap-4">
                <Button className="custom-btn-default ">
                  <Trash2 className="w-4 h-4" />
                  Delete All
                </Button>
                <WaysModal />
              </div>
            </div>

            <div className="p-4">
            <div className="flex flex-col gap-4 justify-center items-center">
                <div className="flex flex-col gap-4 items-center">
                  <Image
                    src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/redeam-gift-icon.svg`}
                    alt="FavLoyalty"
                    width={176}
                    height={174}
                    priority
                  />

                  <div className="flex flex-col gap-1 items-center">
                    <h3 className="text-base font-bold">No redeem methods yet</h3>
                    <p className="text-sm text-gray-500">
                      Let your customers use their points to claim rewards such as
                      discounts, free products, free shipping, and other perks.
                    </p>
                  </div>
                </div>
              </div>

              <WaysRedeemTable />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 justify-end mt-4">
          <Button
            color="primary"
            variant="flat"
            className="custom-btn-default"
          >
            Save
          </Button>
          <Button
            className="custom-btn"
          >
            Save & Next
          </Button>
        </div>
      </div>
    </div>
  );
}
