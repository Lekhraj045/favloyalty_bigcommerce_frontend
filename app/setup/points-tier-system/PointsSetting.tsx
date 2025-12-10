"use client";

import Image from "next/image";
import { useState } from "react";
import { Upload } from "lucide-react";
import { Switch } from "@heroui/switch";
import TierTable from "./TierTable";

export default function PointsSetting() {
  const [selectedLogo, setSelectedLogo] = useState<number | null>(null);

  const logos = [
    "point-icon1.svg",
    "point-icon2.svg",
    "point-icon3.svg",
    "point-icon4.svg",
    "point-icon5.svg",
    "point-icon6.svg",
  ];

  return (
    <>
      <div className="card !p-0">
        <div className="flex flex-col gap-1 p-4 border-b border-[#DEDEDE]">
          <h2 className="text-base font-bold">Points Setting</h2>
          <p>Set point name, logo, expiry and tiers.</p>
        </div>

        <div className="flex flex-col gap-6 p-4">
          <div className="w-full custom-dropi relative">
            <label className="block mb-1 text-[13px]">
              Select Name For Point
            </label>

            <select
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Name</option>
              <option value="Custom Name">Custom Name</option>
              <option value="Points">Points</option>
              <option value="Loyalty points">Loyalty points</option>
              <option value="Diamonds">Diamonds</option>
              <option value="Gems">Gems</option>
              <option value="Credits">Credits</option>
              <option value="Stars">Stars</option>
              <option value="Coins">Coins</option>
              <option value="Tokens">Tokens</option>
              <option value="Bonus Points">Bonus Points</option>
              <option value="Reward points">Reward points</option>
              <option value="Hearts">Hearts</option>
            </select>
          </div>

          <div className="relative">
            <label className="block mb-1 text-[13px]">Point Logo</label>

            <div className="flex gap-4">
              <div className="flex gap-4 items-center">
                {logos.map((logo, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedLogo(index)}
                    className={`w-[50px] h-[50px] bg-white rounded-lg flex items-center justify-center cursor-pointer ${
                      selectedLogo === index
                        ? "border-solid border-[#007f5f]"
                        : "border-dashed border-[#abb1ba]"
                    } border`}
                    style={{
                      borderColor:
                        selectedLogo === index ? "#007f5f" : "#abb1ba",
                    }}
                  >
                    <Image
                      src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/${logo}`}
                      alt="Point Logo"
                      width={25}
                      height={25}
                    />
                  </button>
                ))}

                <button
                  className="w-[50px] h-[50px] bg-white border border-dashed border-[#abb1ba] rounded-lg flex items-center justify-center cursor-pointer"
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = "image/*";
                    input.click();
                  }}
                >
                  <Upload size={20} color="#616161" />
                </button>
              </div>

              <div className="bg-amber-50 rounded-lg py-2 px-4">
                <h4>Preferred size : 25px × 25px</h4>
                <p>File type must be .svg</p>
              </div>
            </div>
          </div>

          <div className="card !bg-[#F8FAFC] flex justify-between gap-2">
            <div className="flex flex-col">
              <h4 className="text-sm font-bold">Set point expiry</h4>
              <p>Expire unused points automatically after a certain time.</p>
            </div>

            <div className="flex gap-2 items-center">
              <div className="flex items-center gap-2">
                <span className="text-[13px]">After</span>
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
                  className="w-[70px] h-8 border border-[#8a8a8a] rounded-lg px-3 text-[13px] leading-none focus:outline-none focus:box-shadow-none bg-[#fdfdfd]"
                />
                <span className="text-[13px]">days</span>
              </div>

              <div>
                <Switch
                  defaultSelected
                  aria-label="Automatic updates"
                  size="sm"
                  color="success"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card !p-0">
        <div className="flex justify-between items-center gap-6 p-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-base font-bold">Do you Want Tiers?</h2>
            <p>Reward loyal customers with higher tiers.</p>
          </div>

          <div>
            <Switch
              defaultSelected
              aria-label="Do you Want Tiers?"
              size="sm"
              color="success"
            />
          </div>
        </div>

        <div className="p-4 border-t border-[#DEDEDE]">
            <TierTable />
        </div>
      </div>
    </>
  );
}
