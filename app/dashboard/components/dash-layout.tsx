"use client";

import { Tabs, Tab } from "@heroui/tabs";
import { Card, CardBody } from "@heroui/card";
import { DateRangePicker } from "@heroui/date-picker";
import { Divider } from "@heroui/divider";
import Image from "next/image";
import { ArrowDown, ArrowUp, MoveHorizontal, } from "lucide-react";
import CampaignTableArea from "./CampaignTable";
import { DateValue } from "@internationalized/date";
import { Button } from "@heroui/button";

export default function DashLayout() {
  const today = new Date();
  today.setHours(23, 59, 59, 999); // Set to end of today

  const isDateUnavailable = (date: DateValue) => {
    const dateObj = date.toDate ? date.toDate("UTC") : new Date(date.toString());
    return dateObj > today;
  };
  return (
    <>
      <div className="card !p-0">
        <div className="flex w-full flex-col relative">
          <Tabs
            aria-label="Options"
            variant="solid"
            size="sm"
            color="success"
            classNames={{
              tabList: "bg-transparent gap-0 p-0 rounded-none",
              cursor: "bg-[#EBEBEB]",
              tabContent:
                "text-[#414141] group-data-[selected=true]:text-[#303030] group-data-[selected=true]:bg-[#EBEBEB] font-medium px-3 py-1 group-data-[selected=true]:rounded-md",
              tab: "text-[13px] p-0 rounded-md",
              panel: "p-0",
              base: "p-4",
            }}
          >
            <Tab
              key="reward-program-summary"
              title="Reward Program Summary"
            >
              <div className="absolute right-4 top-[14px]">
                <DateRangePicker
                  className="selectorButton"
                  showMonthAndYearPickers
                  visibleMonths={2}
                  variant="bordered"
                  isDateUnavailable={isDateUnavailable}
                  classNames={{
                    inputWrapper: "border border-[#EBEBEB] bg-white focus:ring-0 focus:border-[#EBEBEB] cursor-pointer",
                    input: "cursor-pointer",
                    selectorButton: "cursor-pointer",
                  }}
                  size="sm"
                />
              </div>

              <div className="border-t border-[#e5e7eb] p-4">
                <div className="flex flex-col gap-4">
                  {/* Member Overview Section */}
                  <div className="card default-card">
                    <div className="flex items-center mb-4">
                      <div className="flex gap-2 items-center">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-bold text-[#303030]">
                            Total Members:
                          </span>
                          <span className="text-base font-bold text-[#219653]">
                            20
                          </span>
                        </div>

                        <Divider orientation="vertical" className="h-5 mx-2" />

                        <div className="flex items-center gap-2">
                          <span className="text-base font-bold text-[#303030]">
                            New Members:
                          </span>
                          <span className="text-base font-bold text-[#303030]">
                            1
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      {/* Bronze Tier */}
                      <div className="card">
                        <div className="flex flex-col gap-2">
                          <span className="text-sm font-bold text-[#303030]">Bronze</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-[#303030]">0</span>
                            <span className="text-sm text-gray-500">
                              <MoveHorizontal className="w-4 h-4 text-[#303030]" />
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Silver Tier */}
                      <div className="card">
                        <div className="flex flex-col gap-2">
                          <span className="text-sm font-bold text-[#303030]">Silver</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-[#303030]">0</span>
                            <MoveHorizontal className="w-4 h-4 text-[#303030]" />
                          </div>
                        </div>
                      </div>

                      {/* Gold Tier */}
                      <div className="card">
                        <div className="flex flex-col gap-2">
                          <span className="text-sm font-bold text-[#303030]">Gold</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-[#303030]">20</span>
                            <div className="flex items-center gap-1 bg-[#219653] text-white px-2 py-0.5 rounded-full text-xs">
                              <span>1</span>
                              <span><ArrowUp strokeWidth={3} className="w-3 h-3 text-white" /></span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Points Awarded Section */}
                  <div className="card default-card">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-[#303030]">
                          Points Awarded:
                        </span>
                        <span className="text-base font-bold text-[#219653]">
                          8200
                        </span>
                      </div>
                      <div className="text-sm text-[#303030]">
                        <span className="font-bold">8200 = Rs. 8.20</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {/* Sign Up Bonus */}
                      <div className="card">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2.5">
                            <Image
                              src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/signup-dash-icon.svg`}
                              alt="Sign Up Bonus"
                              width={18}
                              height={18}
                            />
                            <span className="text-sm font-bold">Sign Up Bonus</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-[#303030]">100</span>
                            <div className="flex items-center gap-1 bg-[#219653] text-white px-2 py-0.5 rounded-full text-xs">
                              <span>100%</span>
                              <span><ArrowUp strokeWidth={3} className="w-3 h-3 text-white" /></span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Referral */}
                      <div className="card">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2.5">
                            <Image
                              src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/referral-dash-icon.svg`}
                              alt="Referral"
                              width={18}
                              height={18}
                            />
                            <span className="text-sm font-bold">Referral</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-[#303030]">0</span>
                            <MoveHorizontal className="w-4 h-4 text-[#303030]" />
                          </div>
                        </div>
                      </div>

                      {/* Purchase Product */}
                      <div className="card">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2.5">
                            <Image
                              src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/purchase-product-dash-icon.svg`}
                              alt="Purchase Product"
                              width={18}
                              height={18}
                            />
                            <span className="text-sm font-bold">Purchase Product</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-[#303030]">0</span>
                            <MoveHorizontal className="w-4 h-4 text-[#303030]" />
                          </div>
                        </div>
                      </div>

                      {/* Birthday Celebration */}
                      <div className="card">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2.5">
                            <Image
                              src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/birthday-dash-icon.svg`}
                              alt="Birthday Celebration"
                              width={18}
                              height={18}
                            />
                            <span className="text-sm font-bold">Birthday Celebration</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-[#303030]">20</span>
                            <div className="flex items-center gap-1 bg-[#F95353] text-white px-2 py-0.5 rounded-full text-xs">
                              <span>100%</span>
                              <span><ArrowDown strokeWidth={3} className="w-3 h-3 text-white" /></span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Newsletter Bonus */}
                      <div className="card">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2.5">
                            <Image
                              src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/newsletter-dash-icon.svg`}
                              alt="Newsletter Bonus"
                              width={18}
                              height={18}
                            />
                            <span className="text-sm font-bold">Newsletter Bonus</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-[#303030]">0</span>
                            <MoveHorizontal className="w-4 h-4 text-[#303030]" />
                          </div>
                        </div>
                      </div>

                      {/* Profile Completion */}
                      <div className="card">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2.5">
                            <Image
                              src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/profile-dash-icon.svg`}
                              alt="Profile Completion"
                              width={18}
                              height={18}
                            />
                            <span className="text-sm font-bold">Profile Completion</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-[#303030]">0</span>
                            <MoveHorizontal className="w-4 h-4 text-[#303030]" />
                          </div>
                        </div>
                      </div>

                      {/* Event Celebration */}
                      <div className="card">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2.5">
                            <Image
                              src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/event-dash-icon.svg`}
                              alt="Event Celebration"
                              width={18}
                              height={18}
                            />
                            <span className="text-sm font-bold">Event Celebration</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-[#303030]">8000</span>
                            <div className="flex items-center gap-1 bg-[#219653] text-white px-2 py-0.5 rounded-full text-xs">
                              <span>61%</span>
                              <span><ArrowUp strokeWidth={3} className="w-3 h-3 text-white" /></span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Rejoin Bonus */}
                      <div className="card">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2.5">
                            <Image
                              src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/rejoin-dash-icon.svg`}
                              alt="Rejoin Bonus"
                              width={18}
                              height={18}
                            />
                            <span className="text-sm font-bold">Rejoin Bonus</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-[#303030]">0</span>
                            <MoveHorizontal className="w-4 h-4 text-[#303030]" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Points Redeemed Section */}
                  <div className="card default-card">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-[#303030]">
                          Points Redeemed:
                        </span>
                        <span className="text-base font-bold text-[#219653]">
                          0
                        </span>
                      </div>
                      <div className="text-sm text-[#303030]">
                        <span className="font-bold">0 = Rs. 0.00</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {/* Percentage Discount */}
                      <div className="card">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2.5">
                            <Image
                              src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/percentage-dash-icon.svg`}
                              alt="Percentage Discount"
                              width={18}
                              height={18}
                            />
                            <span className="text-sm font-bold">Percentage Discount</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-[#303030]">0</span>
                            <MoveHorizontal className="w-4 h-4 text-[#303030]" />
                          </div>
                        </div>
                      </div>

                      {/* Fixed Discount */}
                      <div className="card">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2.5">
                            <Image
                              src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/fixed-discount-dash-icon.svg`}
                              alt="Fixed Discount"
                              width={18}
                              height={18}
                            />
                            <span className="text-sm font-bold">Fixed Discount</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-[#303030]">0</span>
                            <MoveHorizontal className="w-4 h-4 text-[#303030]" />
                          </div>
                        </div>
                      </div>

                      {/* Free Shipping */}
                      <div className="card">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2.5">
                            <Image
                              src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/free-shipping-dash-icon.svg`}
                              alt="Free Shipping"
                              width={18}
                              height={18}
                            />
                            <span className="text-sm font-bold">Free Shipping</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-[#303030]">0</span>
                            <MoveHorizontal className="w-4 h-4 text-[#303030]" />
                          </div>
                        </div>
                      </div>

                      {/* Free Product */}
                      <div className="card">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2.5">
                            <Image
                              src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/rejoin-dash-icon.svg`}
                              alt="Free Product"
                              width={18}
                              height={18}
                            />
                            <span className="text-sm font-bold">Free Product</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-[#303030]">0</span>
                            <MoveHorizontal className="w-4 h-4 text-[#303030]" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Tab>

            <Tab
              key="campaign-features-summary"
              title="Campaign Features Summary"
              className="text-[13px]"
            >
              <div className="absolute right-4 top-[14px]">
                <Button className="custom-btn">Eanble Tier</Button>
              </div>
              <div className="border-t border-[#e5e7eb] p-4">
                <CampaignTableArea />
              </div>
            </Tab>
          </Tabs>
        </div>
      </div>
    </>
  );
}
