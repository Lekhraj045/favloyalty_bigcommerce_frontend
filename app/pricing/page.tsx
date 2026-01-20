

import PlanSliderArea from "./components/PlanSlider";
import PricingPlanArea from "./components/PricingPlan";

export default function PricingPage() {
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
            <PlanSliderArea />

            <PricingPlanArea />
          </div>
        </div>
      </div>
    </>
  );
}
