'use client'

import { useState } from 'react';
import PlanSliderArea from "./components/PlanSlider";
import PricingPlanArea from "./components/PricingPlan";
import { Button } from '@heroui/button';
import PricingFaqsArea from './components/PricingFaqs';

export default function PricingPage() {
  const [orderValue, setOrderValue] = useState<number>(750);
  const minValue = 750;
  const basePrice = 20.00;
  const pricePer50Orders = 1.00;

  // Calculate monthly price based on orders
  const calculatePrice = (orders: number) => {
    const ordersAboveBase = orders - minValue;
    const increments = Math.floor(ordersAboveBase / 50);
    return basePrice + (increments * pricePer50Orders);
  };

  const monthlyPrice = calculatePrice(orderValue);

  const handleOrderChange = (value: number) => {
    setOrderValue(value);
  };

  return (
    <>
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col gap-4">
          <div className="flex gap-2 justify-between items-center">
            <div className="flex flex-col gap-1">
              <h1 className="text-xl font-bold">Pricing</h1>
              <p>Set up your pricing tiers and rewards</p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <PlanSliderArea value={orderValue} onChange={handleOrderChange} />

            <PricingPlanArea orderCount={orderValue} price={monthlyPrice} />

            {/* Enterprise Solutions Section */}
            <div className="bg-[#2d2d2d] rounded-2xl p-8 flex flex-col items-center gap-4 text-center">
              <h2 className="text-xl font-bold text-white">
                Customized Enterprise Solutions
              </h2>
              <p className="text-sm !text-white mx-auto max-w-2xl">
                Scale your loyalty program with a tailored enterprise plan. Get premium features, dedicated account management, priority support, and a solution customized to your unique business requirements.
              </p>
              <Button className="custom-btn-default">
                Get a Custom Plan
              </Button>
            </div>

            <PricingFaqsArea />
          </div>
        </div>
      </div>
    </>
  );
}
