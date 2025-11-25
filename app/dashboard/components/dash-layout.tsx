"use client";

import { Tabs, Tab } from "@heroui/tabs";
import { Card, CardBody } from "@heroui/card";
import { DateRangePicker } from "@heroui/date-picker";
import { Divider } from "@heroui/divider";
import Image from "next/image";

export default function DashLayout() {
  return (
    <>
      <div className="card !p-0">
        <div className="flex w-full flex-col relative">
          <div className="absolute right-0 top-0">
            <DateRangePicker
              className="selectorButton"
              showMonthAndYearPickers
              visibleMonths={2}
            />
          </div>

          <Tabs
            aria-label="Options"
            variant="light"
            size="sm"
            color="success"
            classNames={{
              tabList: "bg-transparent gap-0 p-2",
              cursor: "bg-[#EBEBEB]",
              tabContent:
                "text-[#303030] group-data-[selected=true]:text-[#303030] font-medium",
            }}
          >
            <Tab
              key="photos"
              title="Reward Program Summary"
              className="text-[13px] p-2"
            >
              <div className="border-t border-[#e5e7eb] p-2 -m-2">
                <div className="card default-card ">
                  <div className="flex items-center mb-5">
                    <div className="flex gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-[#303030]">
                          Total Members:
                        </span>
                        <span className="text-xl font-bold text-[#219653]">
                          6
                        </span>
                      </div>

                      <Divider orientation="vertical" className="h-7 mx-2" />

                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-[#303030]">
                          New Members:
                        </span>
                        <span className="text-xl font-bold text-[#303030]">
                          0
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="card">
                      <div className="flex items-center gap-2.5">
                        <Image
                          src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/signup-dash-icon.svg`}
                          alt="Signup"
                          width={18}
                          height={18}
                        />
                        <span className="text-[15px] font-bold">
                          Sign Up Bonus
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* <div>
                    <p>No tiers configured yet</p>
                  </div> */}
                </div>
              </div>
            </Tab>

            <Tab
              key="music"
              title="Campaign Features Summary"
              className="text-[13px]"
            >
              <Card>
                <CardBody>
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco
                  laboris nisi ut aliquip ex ea commodo consequat. Duis aute
                  irure dolor in reprehenderit in voluptate velit esse cillum
                  dolore eu fugiat nulla pariatur.
                </CardBody>
              </Card>
            </Tab>
          </Tabs>
        </div>
      </div>
    </>
  );
}
