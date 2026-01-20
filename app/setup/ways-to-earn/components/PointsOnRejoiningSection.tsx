import { handleInputBlur, handleIntegerInputChange } from "@/utils/formHelpers";
import { Switch } from "@heroui/switch";
import { AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";

interface PointsOnRejoiningSectionProps {
  enabled: boolean;
  recallDays: string;
  points: string;
  onToggleChange: (enabled: boolean) => void;
  onRecallDaysChange: (days: string) => void;
  onPointsChange: (points: string) => void;
  isFreePlan?: boolean;
  onPremiumClick?: (featureName: string) => void;
}

export default function PointsOnRejoiningSection({
  enabled,
  recallDays,
  points,
  onToggleChange,
  onRecallDaysChange,
  onPointsChange,
  isFreePlan = false,
  onPremiumClick,
}: PointsOnRejoiningSectionProps) {
  const [pointsError, setPointsError] = useState(false);

  // Validate points when enabled state or points value changes
  useEffect(() => {
    if (enabled) {
      const pointsValue = parseInt(points) || 0;
      setPointsError(pointsValue === 0);
    } else {
      setPointsError(false);
    }
  }, [enabled, points]);

  const handleToggle = (value: boolean) => {
    if (isFreePlan && value && onPremiumClick) {
      onPremiumClick("Points on Rejoining");
      return;
    }
    onToggleChange(value);
    // Points and recall days remain unchanged when toggle is turned off
  };

  const handlePointsBlur = () => {
    handleInputBlur(points, onPointsChange);
    // Re-validate on blur
    if (enabled) {
      const pointsValue = parseInt(points) || 0;
      setPointsError(pointsValue === 0);
    }
  };

  return (
    <div className="card !p-0">
      <div className="flex justify-between items-center gap-4 p-4 border-b border-[#DEDEDE]">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold">Points on Rejoining</h2>
            {isFreePlan && (
              <div className="w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-yellow-800"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
            )}
          </div>
          <p>
            Recall period is the time for which customer has not visited the
            website. You can award points as a reminder for the customer to
            visit the website after this time has elapsed
          </p>
        </div>
        <div
          onClick={(e) => {
            if (isFreePlan && onPremiumClick) {
              e.preventDefault();
              e.stopPropagation();
              onPremiumClick("Points on Rejoining");
            }
          }}
          className={isFreePlan ? "cursor-pointer" : ""}
        >
          <Switch
            aria-label="Points on Rejoining"
            size="sm"
            color="success"
            isSelected={enabled}
            onValueChange={handleToggle}
            isDisabled={isFreePlan}
            classNames={{
              base: isFreePlan ? "opacity-50 cursor-not-allowed" : "",
            }}
          />
        </div>
      </div>

      {enabled && (
        <div className="grid grid-cols-2 gap-4 p-4">
          <div className="">
            <label className="block mb-1 text-[13px]">
              Recall Days (1-365)
            </label>
            <input
              type="text"
              value={recallDays}
              onChange={(e) =>
                handleIntegerInputChange(e.target.value, onRecallDaysChange)
              }
              onBlur={() => handleInputBlur(recallDays, onRecallDaysChange)}
              disabled={!enabled}
              className={`w-full h-8 border border-[#8a8a8a] rounded-lg px-3 text-[13px] leading-none focus:outline-none ${
                enabled
                  ? "bg-[#fdfdfd] cursor-text"
                  : "bg-gray-100 cursor-not-allowed opacity-50"
              }`}
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
              value={points}
              onChange={(e) =>
                handleIntegerInputChange(e.target.value, onPointsChange)
              }
              onBlur={handlePointsBlur}
              disabled={!enabled}
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
              className={`w-full h-8 border rounded-lg px-3 text-[13px] leading-none focus:outline-none transition-colors ${
                pointsError && enabled
                  ? "border-red-500 bg-red-50 cursor-text"
                  : enabled
                  ? "border-[#8a8a8a] bg-[#fdfdfd] cursor-text"
                  : "border-[#8a8a8a] bg-gray-100 cursor-not-allowed opacity-50"
              }`}
            />
            {pointsError && enabled ? (
              <div className="flex items-center gap-1 text-red-500 text-xs mt-1">
                <AlertCircle size={12} className="flex-shrink-0" />
                <span>Value must be at least 1</span>
              </div>
            ) : (
              <p className="block mb-1 text-[13px] mt-1">
                Enter a number between 1-10000 points
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
