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
}

export default function ToggleInputField({
  label,
  enabled,
  points,
  onToggleChange,
  onPointsChange,
  tooltipContent,
  inputType = "integer",
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

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-bold">{label}</h4>
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
            <Switch
              aria-label={label}
              size="sm"
              color="success"
              isSelected={enabled}
              onValueChange={(value) => {
                // onToggleChange will handle both enabled state and points value
                onToggleChange(value);
              }}
            />
            <input
              type="text"
              value={points}
              onChange={(e) => handleChange(e.target.value)}
              onBlur={handleBlur}
              disabled={!enabled}
              className={`w-[120px] h-8 border rounded-lg px-3 text-[13px] leading-none focus:outline-none transition-colors ${
                hasError && enabled
                  ? "border-red-500 bg-red-50 cursor-text"
                  : enabled
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
