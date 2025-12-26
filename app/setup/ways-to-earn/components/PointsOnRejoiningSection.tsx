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
}

export default function PointsOnRejoiningSection({
  enabled,
  recallDays,
  points,
  onToggleChange,
  onRecallDaysChange,
  onPointsChange,
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
          isSelected={enabled}
          onValueChange={handleToggle}
        />
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
