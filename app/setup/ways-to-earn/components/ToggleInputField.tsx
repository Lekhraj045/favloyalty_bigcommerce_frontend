import {
  handleFloatInputChange,
  handleInputBlur,
  handleIntegerInputChange,
} from "@/utils/formHelpers";
import { Switch } from "@heroui/switch";
import { Tooltip } from "@heroui/tooltip";
import { AlertCircle, Info } from "lucide-react";
import { useEffect, useState } from "react";

interface ToggleInputFieldProps {
  label: string;
  enabled: boolean;
  points: string;
  onToggleChange: (enabled: boolean) => void;
  onPointsChange: (points: string) => void;
  tooltipContent?: string;
  inputType?: "integer" | "float";
  isPremium?: boolean;
  onPremiumClick?: () => void;
}

export default function ToggleInputField({
  label,
  enabled,
  points,
  onToggleChange,
  onPointsChange,
  tooltipContent,
  inputType = "integer",
  isPremium = false,
  onPremiumClick,
}: ToggleInputFieldProps) {
  const [hasError, setHasError] = useState(false);

  // Validate when enabled state or points value changes
  useEffect(() => {
    if (enabled) {
      const pointsValue =
        inputType === "float" ? parseFloat(points) || 0 : parseInt(points) || 0;
      setHasError(pointsValue === 0);
    } else {
      setHasError(false);
    }
  }, [enabled, points, inputType]);

  const handleChange = (value: string) => {
    if (inputType === "float") {
      handleFloatInputChange(value, onPointsChange);
    } else {
      handleIntegerInputChange(value, onPointsChange);
    }
  };

  const handleBlur = () => {
    handleInputBlur(points, onPointsChange);
    // Re-validate on blur
    if (enabled) {
      const pointsValue =
        inputType === "float" ? parseFloat(points) || 0 : parseInt(points) || 0;
      setHasError(pointsValue === 0);
    }
  };

  const handleToggleChange = (value: boolean) => {
    if (isPremium && value && onPremiumClick) {
      onPremiumClick();
      return;
    }
    onToggleChange(value);
  };

  const handleInputClick = () => {
    if (isPremium && onPremiumClick) {
      onPremiumClick();
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-bold">{label}</h4>
          {isPremium && (
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
          {tooltipContent && (
            <Tooltip
              content={tooltipContent}
              showArrow={true}
              closeDelay={0}
              size="sm"
              classNames={{
                content: "max-w-xs whitespace-normal break-words",
              }}
            >
              <Info width={16} height={16} />
            </Tooltip>
          )}
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-3">
            <div
              onClick={(e) => {
                if (isPremium && onPremiumClick) {
                  e.preventDefault();
                  e.stopPropagation();
                  onPremiumClick();
                }
              }}
              className={isPremium ? "cursor-pointer" : ""}
            >
              <Switch
                aria-label={label}
                size="sm"
                color="success"
                isSelected={enabled}
                onValueChange={handleToggleChange}
                isDisabled={isPremium}
                classNames={{
                  base: isPremium ? "opacity-50 cursor-not-allowed" : "",
                }}
              />
            </div>
            <input
              type="text"
              value={points}
              onChange={(e) => handleChange(e.target.value)}
              onBlur={handleBlur}
              onClick={handleInputClick}
              disabled={!enabled || isPremium}
              className={`w-[120px] h-8 border rounded-lg px-3 text-[13px] leading-none focus:outline-none transition-colors ${
                hasError && enabled
                  ? "border-red-500 bg-red-50 cursor-text"
                  : enabled && !isPremium
                    ? "border-[#8a8a8a] bg-[#fdfdfd] cursor-text"
                    : "border-[#8a8a8a] bg-gray-100 cursor-not-allowed opacity-50"
              }`}
            />
          </div>
          {hasError && enabled && (
            <div className="flex items-center gap-1 text-red-500 text-xs mt-1 w-[120px]">
              <AlertCircle size={12} className="flex-shrink-0" />
              <span>Value must be at least 1</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
