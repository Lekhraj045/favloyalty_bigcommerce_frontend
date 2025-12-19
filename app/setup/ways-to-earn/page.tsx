"use client";

import React from "react";
import SetupNavigation from "@/components/SetupNavigation";
import SetupHeader from "@/components/SetupHeader";
import { Switch } from "@heroui/switch";
import { Tooltip } from "@heroui/tooltip";
import { Button } from "@heroui/button";
import { Info, Search } from "lucide-react";
import { DatePicker } from "@heroui/date-picker";
import { Input } from "@heroui/input";
import EventsTable from "./eventsTable";

export default function WaysToEarn() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col gap-4">
        <div className="head">
          <SetupHeader />
          <SetupNavigation />
        </div>

        <div className="card !p-0">
          <div className="flex flex-col gap-1 p-4 border-b border-[#DEDEDE]">
            <h2 className="text-base font-bold">Ways to Earn</h2>
            <p>Set ways to earn points.</p>
          </div>

          <div className="grid grid-cols-2 gap-8 p-4">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-bold">Sign up</h4>
              <div className="flex items-center gap-3">
                <Switch aria-label="Sign up" size="sm" color="success" />

                <input
                  type="text"
                  className="w-[120px] h-8 border border-[#8a8a8a] rounded-lg px-3 text-[13px] leading-none focus:outline-none bg-[#fdfdfd]"
                />
              </div>
            </div>

            <div className="flex justify-between items-center">
              <h4 className="text-sm font-bold">
                Every purchase (Per INR spent)
              </h4>
              <div className="flex items-center gap-3">
                <Switch
                  aria-label="Every purchase (Per INR spent)"
                  size="sm"
                  color="success"
                />

                <input
                  type="text"
                  className="w-[120px] h-8 border border-[#8a8a8a] rounded-lg px-3 text-[13px] leading-none focus:outline-none bg-[#fdfdfd]"
                />
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold">Birthday</h4>
                <Tooltip
                  content="Customers receive birthday points upon entering their birthdate via the widget. Once set, the birthdate cannot be modified for a period of 365 days to prevent potential misuse."
                  showArrow={true}
                  closeDelay={0}
                  size="sm"
                  classNames={{
                    content: "max-w-xs whitespace-normal break-words",
                  }}
                >
                  <Info width={16} height={16} />
                </Tooltip>
              </div>

              <div className="flex items-center gap-3">
                <Switch aria-label="Birthday" size="sm" color="success" />

                <input
                  type="text"
                  className="w-[120px] h-8 border border-[#8a8a8a] rounded-lg px-3 text-[13px] leading-none focus:outline-none bg-[#fdfdfd]"
                />
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold">Refer & Earn</h4>
                <Tooltip
                  content="When a customer refers a friend: The friend gets points upon signing up, and customer will receive points after the friend makes their first purchase upon fullfillment of the order."
                  showArrow={true}
                  closeDelay={0}
                  size="sm"
                  classNames={{
                    content: "max-w-xs whitespace-normal break-words",
                  }}
                >
                  <Info width={16} height={16} />
                </Tooltip>
              </div>
              <div className="flex items-center gap-3">
                <Switch aria-label="Refer & Earn" size="sm" color="success" />

                <input
                  type="text"
                  className="w-[120px] h-8 border border-[#8a8a8a] rounded-lg px-3 text-[13px] leading-none focus:outline-none bg-[#fdfdfd]"
                />
              </div>
            </div>

            <div className="flex justify-between items-center">
              <h4 className="text-sm font-bold">Profile Completion</h4>
              <div className="flex items-center gap-3">
                <Switch
                  aria-label="Profile Completion"
                  size="sm"
                  color="success"
                />

                <input
                  type="text"
                  className="w-[120px] h-8 border border-[#8a8a8a] rounded-lg px-3 text-[13px] leading-none focus:outline-none bg-[#fdfdfd]"
                />
              </div>
            </div>

            <div className="flex justify-between items-center">
              <h4 className="text-sm font-bold">Subscribing to newsletter</h4>
              <div className="flex items-center gap-3">
                <Switch
                  aria-label="Subscribing to newsletter"
                  size="sm"
                  color="success"
                />

                <input
                  type="text"
                  className="w-[120px] h-8 border border-[#8a8a8a] rounded-lg px-3 text-[13px] leading-none focus:outline-none bg-[#fdfdfd]"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="card !p-0">
          <div className="flex justify-between items-center gap-6 p-4 border-b border-[#DEDEDE]">
            <div className="flex flex-col gap-1">
              <h2 className="text-base font-bold">Points on Events</h2>
              <p>
                Configure special events where customers can earn loyalty
                points. You can set up multiple events with their dates and
                point values.
              </p>
            </div>
            <Switch aria-label="Points on Events" size="sm" color="success" />
          </div>

          <div className="card !p-0 m-4">
            <div className="flex justify-between items-center gap-4 p-4 border-b border-[#DEDEDE]">
              <div className="flex flex-col gap-1">
                <h2 className="text-sm font-bold">Add New Event</h2>
                <p>
                  Events allow you to award points for special occasions.
                  Same-day events are processed immediately in the background.
                </p>
              </div>
              <Button className="custom-btn">Add Event</Button>
            </div>

            <div className="grid grid-cols-3 gap-4 p-4">
              <div>
                <div className="w-full custom-dropi relative">
                  <label className="block mb-1 text-[13px]">
                    Select Name For Point
                  </label>
                  <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select Event</option>
                    <option value="Birthday">Birthday</option>
                    <option value="Refer & Earn">Refer & Earn</option>
                    <option value="Profile Completion">
                      Profile Completion
                    </option>
                    <option value="Subscribing to newsletter">
                      Subscribing to newsletter
                    </option>
                  </select>
                </div>
              </div>

              <div className="w-full">
                <label className="block mb-1 text-[13px]">Date of Event</label>
                <DatePicker
                  showMonthAndYearPickers
                  size="sm"
                  classNames={{
                    base: "w-full",
                    inputWrapper: [
                      "bg-[#fdfdfd]",
                      "border",
                      "border-[#8a8a8a]",
                      "rounded-lg",
                      "h-8",
                      "px-3",
                    ],
                  }}
                />
              </div>

              <div className="">
                <label className="block mb-1 text-[13px]">
                  Points (1-10000)
                </label>
                <input
                  type="text"
                  onKeyDown={(e) => {
                    if (
                      !/[0-9]/.test(e.key) &&
                      e.key !== "Backspace" &&
                      e.key !== "Delete" &&
                      e.key !== "ArrowLeft" &&
                      e.key !== "ArrowRight" &&
                      e.key !== "Tab"
                    ) {
                      e.preventDefault();
                    }
                  }}
                  className="w-full h-8 border border-[#8a8a8a] rounded-lg px-3 text-[13px] leading-none focus:outline-none bg-[#fdfdfd]"
                />
              </div>
            </div>
          </div>

          <div className="card !p-0 m-4">
            <div className="flex justify-between items-center gap-4 p-4 border-b border-[#DEDEDE]">
              <div className="flex flex-col gap-1">
                <h2 className="text-sm font-bold">Scheduled Events</h2>
                <p>View and manage scheduled events.</p>
              </div>

              <div className="h-8">
                <Input
                  variant="bordered"
                  placeholder="you@example.com"
                  startContent={
                    <Search className="text-lg text-default-400 pointer-events-none shrink-0 w-4" />
                  }
                  type="email"
                  classNames={{
                    base: "w-full",
                    inputWrapper: [
                      "h-8",
                      "min-h-8",
                      "bg-[#fdfdfd]",
                      "border",
                      "border-[#8a8a8a]",
                      "rounded-lg",
                      "w-[200px]",
                      "px-2",
                    ].join(" "),
                    input: ["text-xs"].join(" "),
                  }}
                />
              </div>
            </div>

            <div className="p-4">
              <EventsTable />
            </div>
          </div>
        </div>

        <div className="card !p-0">
          <div className="flex justify-between items-center gap-4 p-4 border-b border-[#DEDEDE]">
            <div className="flex flex-col gap-1">
              <h2 className="text-sm font-bold">Points on Rejoining</h2>
              <p>
                Recall period is the time for which customer has not visited the
                website. You can award points as a reminder for the customer to
                visit the website after this time has elapsed
              </p>
            </div>
            <Switch
              aria-label="Points on Rejoining"
              size="sm"
              color="success"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 p-4">
            <div className="">
              <label className="block mb-1 text-[13px]">
                Recall Days (1-365)
              </label>
              <input
                type="text"
                onKeyDown={(e) => {
                  if (
                    !/[0-9]/.test(e.key) &&
                    e.key !== "Backspace" &&
                    e.key !== "Delete" &&
                    e.key !== "ArrowLeft" &&
                    e.key !== "ArrowRight" &&
                    e.key !== "Tab"
                  ) {
                    e.preventDefault();
                  }
                }}
                className="w-full h-8 border border-[#8a8a8a] rounded-lg px-3 text-[13px] leading-none focus:outline-none bg-[#fdfdfd]"
              />
              <p className="block mb-1 text-[13px] mt-1">
                Enter a number between 1-365 days
              </p>
            </div>

            <div className="">
              <label className="block mb-1 text-[13px]">
                Rejoin Points (1-10000)
              </label>
              <input
                type="text"
                onKeyDown={(e) => {
                  if (
                    !/[0-9]/.test(e.key) &&
                    e.key !== "Backspace" &&
                    e.key !== "Delete" &&
                    e.key !== "ArrowLeft" &&
                    e.key !== "ArrowRight" &&
                    e.key !== "Tab"
                  ) {
                    e.preventDefault();
                  }
                }}
                className="w-full h-8 border border-[#8a8a8a] rounded-lg px-3 text-[13px] leading-none focus:outline-none bg-[#fdfdfd]"
              />
              <p className="block mb-1 text-[13px] mt-1">
                Enter a number between 1-10000 points
              </p>
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
