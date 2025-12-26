"use client";
import SetupHeader from "@/components/SetupHeader";
import SetupNavigation from "@/components/SetupNavigation";
import { Button } from "@heroui/button";
import { ArrowLeft, Search } from "lucide-react";
import FreeProductTable from "./components/FreeProductTable";

export default function FreeProductPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col gap-4">
        <div className="head">
          <SetupHeader />
          <SetupNavigation />
        </div>

        <div className="flex flex-col gap-4">
          {/* Section 1: Coupon Details */}
          <div className="card !p-0">
            <div className="flex items-center gap-3 p-4 border-b border-[#DEDEDE]">
              <button className="text-gray-600 hover:text-gray-800 transition-colors">
                <ArrowLeft size={20} />
              </button>
              <h2 className="text-base font-bold">
                Create Free Product Coupon
              </h2>
            </div>

            <div className="p-4">
              <h3 className="text-base font-bold mb-4">Coupon Details</h3>
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

          {/* Section 2: Eligible Free Products */}
          <div className="card !p-0">
            <div className="p-4 border-b border-[#DEDEDE]">
              <h3 className="text-base font-bold mb-1">Eligible Free Products</h3>
              <p className="text-sm text-gray-600">
                Select the products that customers can get for free with this coupon.
              </p>
            </div>

            <div className="p-4 flex flex-col gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search and add products"
                  className="w-full h-8 border border-[#8a8a8a] rounded-lg px-3 pl-9 text-[13px] leading-none focus:outline-none bg-[#fdfdfd]"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>

              {/* Empty State */}
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <Search className="text-gray-400 w-8 h-8" />
                </div>
                <h4 className="text-base font-bold mb-1">No Products Yet</h4>
                <p className="text-sm text-gray-500">
                  Use the search bar above to add products
                </p>
              </div>

              {/* Product Table */}
              <FreeProductTable />

              {/* Point Range Info */}
              <div className="mt-auto pt-4 border-t border-[#DEDEDE]">
                <p className="text-sm text-gray-600">
                  Point range for selected products: <span className="font-semibold">1 - 1 points.</span>
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