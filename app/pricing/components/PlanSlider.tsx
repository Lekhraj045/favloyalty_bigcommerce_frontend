"use client";

import { Slider } from "@heroui/slider";
import { StorePlan } from "@/utils/api";

interface PlanSliderAreaProps {
  value: number;
  onChange: (value: number) => void;
  storePlan?: StorePlan | null;
}

export default function PlanSliderArea({
  value,
  onChange,
  storePlan,
}: PlanSliderAreaProps) {
  const minValue = 750;
  const maxValue = 10000;
  const step = 50;
  const basePrice = 20.0; // Price at 750 orders
  const pricePer50Orders = 1.0; // Price increase per 50 orders

  // Calculate monthly price based on orders
  const calculatePrice = (orders: number) => {
    const ordersAboveBase = orders - minValue;
    const increments = Math.floor(ordersAboveBase / 50);
    return basePrice + increments * pricePer50Orders;
  };

  const monthlyPrice = calculatePrice(value);

  const handleChange = (val: number | number[]) => {
    let newValue: number;
    if (typeof val === "number") {
      newValue = val;
    } else if (Array.isArray(val) && val.length > 0) {
      newValue = val[0];
    } else {
      return;
    }
    // Ensure value is always a multiple of 50
    const roundedValue = Math.round(newValue / step) * step;
    const clampedValue = Math.max(minValue, Math.min(maxValue, roundedValue));
    onChange(clampedValue);
  };

  // Check if user is on paid plan
  const isPaidUser = storePlan?.plan === "paid";

  // For paid users, show current usage
  if (isPaidUser) {
    const usedOrders = storePlan?.orderCount || 0;
    const totalOrders = storePlan?.selectedOrderLimit || 750;
    const usagePercentage = Math.min((usedOrders / totalOrders) * 100, 100);

    return (
      <div className="card">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-base font-bold">Current Usage This Cycle</h2>
            <p className="text-sm font-medium !text-[#303030]">
              Used: {usedOrders.toLocaleString()} / {totalOrders.toLocaleString()} orders
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Slider
                  label="Used Orders"
                  step={1}
                  minValue={0}
                  maxValue={totalOrders}
                  size="md"
                  value={usedOrders}
                  isDisabled
                  className="w-full"
                  color="foreground"
                  classNames={{
                    label: "text-xs",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // For free users, show the configurable slider
  return (
    <div className="card">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-bold">Configure Your Pro Plan</h2>
          <p className="text-sm font-medium !text-[#303030]">
            Monthly (${monthlyPrice.toFixed(2)}/month)
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Slider
                label="Select Your Estimated Monthly Orders"
                step={step}
                minValue={minValue}
                maxValue={maxValue}
                size="md"
                value={value}
                onChange={handleChange}
                showTooltip
                className="w-full"
                color="foreground"
                classNames={{
                  label: "text-xs",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
