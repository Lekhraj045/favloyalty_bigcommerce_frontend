"use client";
import SetupHeader from "@/components/SetupHeader";
import SetupNavigation from "@/components/SetupNavigation";
import { Button } from "@heroui/button";
import { Switch } from "@heroui/switch";
import { ArrowLeft } from "lucide-react";
import ProductTable from "./components/ProductTable";

export default function PercentageDiscountPage() {
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
              <button
                className="text-gray-600 hover:text-gray-800 transition-colors">
                <ArrowLeft size={20} />
              </button>
              <h2 className="text-base font-bold">
                Create Percentage Discount Coupon
              </h2>
            </div>

            <div className="p-4 flex flex-col gap-4">
              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <label className="block mb-1 text-[13px] text-gray-700">
                    Select Coupon Value (Point Wise)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex. 500"
                    className="w-full h-8 border border-[#8a8a8a] rounded-lg px-3 text-[13px] leading-none focus:outline-none bg-[#fdfdfd]"
                  />
                </div>
                <div className="text-base text-[#303030] pb-1.5">=</div>
                <div className="flex-1">
                  <label className="block mb-1 text-[13px] text-gray-700">
                    Select Discount Amount (in % value)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex. 100"
                    className="w-full h-8 border border-[#8a8a8a] rounded-lg px-3 text-[13px] leading-none focus:outline-none bg-[#fdfdfd]"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 text-[13px] text-gray-700">
                  Expire Coupon After (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Ex. 30 Days (leave empty for no expiry)"
                  className="w-full h-8 border border-[#8a8a8a] rounded-lg px-3 text-[13px] leading-none focus:outline-none bg-[#fdfdfd]"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty for no expiry, or enter days (max 365 days)
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Section: Product Selection */}
          <div className="card !p-0">
            <div className="flex justify-between items-center gap-6 p-4 border-b border-[#DEDEDE]">
              <span className="text-base font-bold">
                Allow discount for selected products
              </span>
              <Switch
                aria-label="Allow discount for selected products"
                size="sm"
                color="success"
              />
            </div>

            <div className="p-4 flex flex-col gap-4">
              <h3 className="text-sm font-bold">Add Products/Collections</h3>

              <div className="flex gap-3">
                <div className="flex-1 max-w-[120px]">
                  <div className="w-full custom-dropi dropi-withoutLabel relative">
                    <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="Product">Product</option>
                      <option value="Collection">Collection</option>
                    </select>
                  </div>
                </div>

                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search Products"
                    className="w-full h-8 border border-[#8a8a8a] rounded-lg px-3 text-[13px] leading-none focus:outline-none bg-[#fdfdfd]"
                  />
                </div>
              </div>

              {/* Product Table */}

              <ProductTable />
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
