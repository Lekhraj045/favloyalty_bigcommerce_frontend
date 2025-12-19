"use client";

import { Tier } from "@/utils/api";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/table";
import { SquarePen, X } from "lucide-react";
import { useState, useEffect } from "react";

interface TierTableProps {
  tiers: Tier[];
  isEditMode?: boolean;
  onTierUpdate?: (index: number, field: keyof Tier, value: any) => void;
  validationErrors?: {
    tierName?: string;
    pointRequired?: string;
    multiplier?: string;
  };
  resetEditing?: boolean;
}

export default function TierTable({
  tiers,
  isEditMode = false,
  onTierUpdate,
  validationErrors,
  resetEditing = false,
}: TierTableProps) {
  const [editing, setEditing] = useState<boolean>(false);
  // Track input strings for multipliers to allow smooth decimal typing
  const [multiplierInputs, setMultiplierInputs] = useState<Record<number, string>>({});

  // Reset editing state when resetEditing prop changes to true
  useEffect(() => {
    if (resetEditing && editing) {
      setEditing(false);
      setMultiplierInputs({}); // Clear input strings when resetting
    }
  }, [resetEditing, editing]);

  // Initialize multiplier inputs when editing starts or tiers change
  useEffect(() => {
    if (editing) {
      const inputs: Record<number, string> = {};
      tiers.forEach((tier, index) => {
        if (tier.multiplier !== undefined && tier.multiplier !== null) {
          inputs[index] = tier.multiplier.toString();
        }
      });
      setMultiplierInputs(inputs);
    }
  }, [editing, tiers.length]);

  const handleEdit = () => {
    setEditing(!editing);
  };

  const handleTierNameChange = (index: number, value: string) => {
    const sanitized = value.replace(/[^a-zA-Z0-9 ]/g, "").slice(0, 30);
    onTierUpdate?.(index, "tierName", sanitized);
  };

  const handlePointRequiredChange = (index: number, value: string) => {
    const sanitized = value.replace(/[^0-9]/g, "").slice(0, 6);
    const numValue = sanitized === "" ? 0 : parseInt(sanitized, 10);
    onTierUpdate?.(index, "pointRequired", numValue);
  };

  const handleMultiplierChange = (index: number, value: string) => {
    // Remove all non-numeric and non-decimal characters
    let sanitized = value.replace(/[^0-9.]/g, "");

    // Handle empty input
    if (sanitized === "" || sanitized === ".") {
      // Keep the input string but don't update the multiplier yet
      setMultiplierInputs((prev) => ({
        ...prev,
        [index]: sanitized,
      }));
      return;
    }

    // Ensure only one decimal point - keep the first one
    const firstDecimalIndex = sanitized.indexOf(".");
    if (firstDecimalIndex !== -1) {
      const beforeDecimal = sanitized.substring(0, firstDecimalIndex);
      const afterDecimal = sanitized.substring(firstDecimalIndex + 1).replace(/\./g, "");
      // Limit to 2 decimal places
      sanitized = beforeDecimal + "." + afterDecimal.substring(0, 2);
    }

    // Check if the value exceeds 9.99 before parsing
    const numValue = parseFloat(sanitized);
    if (!isNaN(numValue)) {
      // Enforce maximum value of 9.99
      if (numValue > 9.99) {
        sanitized = "9.99";
        setMultiplierInputs((prev) => ({
          ...prev,
          [index]: "9.99",
        }));
        onTierUpdate?.(index, "multiplier", 9.99);
        return;
      }
      
      // Update the input string state
      setMultiplierInputs((prev) => ({
        ...prev,
        [index]: sanitized,
      }));
      
      // Update multiplier
      onTierUpdate?.(index, "multiplier", numValue);
    } else {
      // Update input string even if not a valid number (for typing experience)
      setMultiplierInputs((prev) => ({
        ...prev,
        [index]: sanitized,
      }));
    }
  };

  return (
    <div className="tierTable border border-[#DEDEDE] rounded-lg overflow-hidden">
      <Table
        aria-label="Tier points table"
        shadow="none"
        removeWrapper
        classNames={{
          th: "bg-[#F7F7F7] text-xs font-normal text-[#616161] px-1.5 py-2",
          td: "text-xs text-foreground-600 px-3 py-2 border-t border-[#e3e3e3] px-1.5 py-2",
          tbody: "-mt-1",
        }}
      >
        <TableHeader>
          <TableColumn className="!rounded-bl-none pl-3">Title</TableColumn>
          <TableColumn className="">Tier 1</TableColumn>
          <TableColumn className="">Tier 2</TableColumn>
          <TableColumn className="">Tier 3</TableColumn>
          <TableColumn className="!rounded-br-none" align="end">
            <button
              className="bg-transparent border-none p-0 mr-2 cursor-pointer"
              onClick={handleEdit}
            >
              {editing ? (
                <X width={16} height={16} />
              ) : (
                <SquarePen width={16} height={16} />
              )}
            </button>
          </TableColumn>
        </TableHeader>

        <TableBody>
          {/* Tier Name Row */}
          <TableRow key="1">
            <TableCell className="pl-3">Tier Name</TableCell>
            {tiers.map((tier, index) => (
              <TableCell key={`tier-name-${index}`}>
                {editing ? (
                  <input
                    type="text"
                    value={tier.tierName}
                    onChange={(e) =>
                      handleTierNameChange(index, e.target.value)
                    }
                    className={`w-full border rounded px-2 py-1 text-xs ${
                      validationErrors?.tierName && tier.tierName.trim() === ""
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    maxLength={30}
                    placeholder="Enter tier name"
                  />
                ) : (
                  tier.tierName
                )}
              </TableCell>
            ))}
            <TableCell>&nbsp;</TableCell>
          </TableRow>

          {/* Points Required Row */}
          <TableRow key="2">
            <TableCell className="pl-3">Points Required</TableCell>
            {tiers.map((tier, index) => (
              <TableCell key={`points-required-${index}`}>
                {editing ? (
                  <input
                    type="text"
                    value={tier.pointRequired}
                    onChange={(e) =>
                      handlePointRequiredChange(index, e.target.value)
                    }
                    disabled={index === 0}
                    className={`w-full border rounded px-2 py-1 text-xs ${
                      validationErrors?.pointRequired &&
                      (tier.pointRequired === undefined ||
                        tier.pointRequired < 0)
                        ? "border-red-500"
                        : "border-gray-300"
                    } ${index === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                    placeholder="0"
                    maxLength={6}
                  />
                ) : (
                  tier.pointRequired
                )}
              </TableCell>
            ))}
            <TableCell>&nbsp;</TableCell>
          </TableRow>

          {/* Point Multiplier Row */}
          <TableRow key="3">
            <TableCell className="pl-3">Point Multiplier</TableCell>
            {tiers.map((tier, index) => (
              <TableCell key={`multiplier-${index}`}>
                {editing ? (
                  <input
                    type="text"
                    value={multiplierInputs[index] !== undefined 
                      ? multiplierInputs[index] 
                      : (tier.multiplier === undefined || tier.multiplier === null 
                          ? "" 
                          : tier.multiplier.toString())}
                    onChange={(e) =>
                      handleMultiplierChange(index, e.target.value)
                    }
                    onBlur={() => {
                      // On blur, ensure the value is properly formatted and within limits
                      const currentInput = multiplierInputs[index];
                      if (currentInput && currentInput !== "") {
                        let numValue = parseFloat(currentInput);
                        if (!isNaN(numValue)) {
                          // Enforce maximum value of 9.99
                          if (numValue > 9.99) {
                            numValue = 9.99;
                          }
                          onTierUpdate?.(index, "multiplier", numValue);
                          setMultiplierInputs((prev) => ({
                            ...prev,
                            [index]: numValue.toString(),
                          }));
                        }
                      }
                    }}
                    disabled={index === 0}
                    className={`w-full border rounded px-2 py-1 text-xs ${
                      validationErrors?.multiplier &&
                      (tier.multiplier === undefined || tier.multiplier <= 0)
                        ? "border-red-500"
                        : "border-gray-300"
                    } ${index === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                    placeholder="1.00"
                  />
                ) : (
                  tier.multiplier
                )}
              </TableCell>
            ))}
            <TableCell>&nbsp;</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
