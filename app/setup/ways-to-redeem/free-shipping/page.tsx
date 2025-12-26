"use client";
import SetupHeader from "@/components/SetupHeader";
import SetupNavigation from "@/components/SetupNavigation";
import { Button } from "@heroui/button";
import { Switch } from "@heroui/switch";
import { ArrowLeft } from "lucide-react";

export default function FreeShippingPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col gap-4">
        <div className="head">
          <SetupHeader />
          <SetupNavigation />
        </div>

        <div className="flex flex-col gap-4">
          {/* Top Section: Coupon Configuration */}
          <div className="card !p-0">
            <div className="flex items-center gap-3 p-4 border-b border-[#DEDEDE]">
              <button className="text-gray-600 hover:text-gray-800 transition-colors">
                <ArrowLeft size={20} />
              </button>
              <h2 className="text-base font-bold">
                Create Free Shipping Coupon
              </h2>
            </div>

            <div className="p-4 grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 text-[13px] text-gray-700">
                    Select Coupon Value (Point Wise)
                </label>
                <input
                  type="text"
                  placeholder="Ex: 1000"
                  className="w-full h-8 border border-[#8a8a8a] rounded-lg px-3 text-[13px] leading-none focus:outline-none bg-[#fdfdfd]"
                />
                <p className="text-xs text-gray-500 mt-1">
                Maximum 999,999 points allowed
                </p>
              </div>

              <div>
                <label className="block mb-1 text-[13px] text-gray-700">
                    Expire Coupon After (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Ex. 30 (leave empty for no expiry)"
                  className="w-full h-8 border border-[#8a8a8a] rounded-lg px-3 text-[13px] leading-none focus:outline-none bg-[#fdfdfd]"
                />
                <p className="text-xs text-gray-500 mt-1">
                    Leave empty for no expiry, or enter days (max 365 days)
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Section: Set minimum purchase amount */}
          <div className="card !p-0">
            <div className="flex justify-between items-center gap-6 p-4 border-b border-[#DEDEDE]">
              <span className="text-base font-bold">
                Set minimum purchase amount
              </span>
              <Switch
                aria-label="Set minimum purchase amount"
                size="sm"
                color="success"
                defaultSelected
              />
            </div>

            <div className="p-4 flex flex-col gap-4">
              <div>
                <label className="block mb-1 text-[13px] text-gray-700">
                Minimum Purchase Amount
                </label>
                <input
                  type="text"
                  placeholder="Enter Value (e.g., 50.00)"
                  className="w-full h-8 border border-[#8a8a8a] rounded-lg px-3 text-[13px] leading-none focus:outline-none bg-[#fdfdfd]"
                />
                <p className="text-xs text-gray-500 mt-1">
                Maximum 999,999.99 allowed
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end mt-4">
          <Button className="custom-btn">Create</Button>
        </div>
      </div>
    </div>
  );
}