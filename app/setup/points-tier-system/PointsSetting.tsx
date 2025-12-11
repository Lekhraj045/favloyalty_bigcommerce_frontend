"use client";

import {
  CustomPointName,
  getPoints,
  Logo,
  PointData,
  savePoints,
  Tier,
  updatePoints,
} from "@/utils/api";
import { Button } from "@heroui/button";
import { Switch } from "@heroui/switch";
import { Upload } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import CustomPointNameModal from "./CustomPointNameModal";
import TierTable from "./TierTable";

interface ValidationErrors {
  pointName?: string;
  expiryDays?: string;
  tierName?: string;
  pointRequired?: string;
  multiplier?: string;
}

export default function PointsSetting() {
  // Form state
  const [pointName, setPointName] = useState<string>("");
  const [selectedPointNameOption, setSelectedPointNameOption] =
    useState<string>("");
  const [customPointNames, setCustomPointNames] = useState<CustomPointName[]>(
    []
  );
  const [selectedLogo, setSelectedLogo] = useState<number | null>(null);
  const [customLogo, setCustomLogo] = useState<File | null>(null);
  const [logoDetails, setLogoDetails] = useState<Logo | null>(null);
  const [expiry, setExpiry] = useState<boolean>(false);
  const [expiriesInDays, setExpiriesInDays] = useState<number>(1);
  const [tierStatus, setTierStatus] = useState<boolean>(false);
  const [tiers, setTiers] = useState<Tier[]>([
    { tierName: "Silver", pointRequired: 0, multiplier: 1 },
    { tierName: "Gold", pointRequired: 1000, multiplier: 1.2 },
    { tierName: "Platinum", pointRequired: 5000, multiplier: 1.5 },
  ]);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  // UI state
  const [loading, setLoading] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );
  const [showCustomNameModal, setShowCustomNameModal] =
    useState<boolean>(false);

  // Store and channel IDs (you'll need to get these from context/props)
  const [storeId, setStoreId] = useState<string>("6936c328351211fcbab8fcb0");
  const [channelId, setChannelId] = useState<string>(
    "6936c79fb9b67e2e195f4669"
  );
  const [pointId, setPointId] = useState<string | null>(null);

  const logos = [
    "point-icon1.svg",
    "point-icon2.svg",
    "point-icon3.svg",
    "point-icon4.svg",
    "point-icon5.svg",
    "point-icon6.svg",
  ];

  const pointNameOptions = [
    "Points",
    "Loyalty points",
    "Diamonds",
    "Gems",
    "Credits",
    "Stars",
    "Coins",
    "Tokens",
    "Bonus Points",
    "Reward points",
    "Hearts",
  ];

  // Load existing points data
  useEffect(() => {
    const loadPointsData = async () => {
      if (!storeId || !channelId) return;

      try {
        setLoading(true);
        const data = await getPoints(storeId, channelId);
        if (data) {
          // Use _id if available, otherwise fallback to pointName (for backward compatibility)
          console.log(data);
          setPointId(data._id || data.pointName);
          setPointName(data.pointName);
          setSelectedPointNameOption(data.pointName);
          setExpiry(data.expiry);
          setExpiriesInDays(data.expiriesInDays || 1);
          setTierStatus(data.tierStatus);
          if (data.tier) {
            setTiers(data.tier);
          }
          if (data.logo) {
            setLogoDetails(data.logo);
            // Find logo index
            const logoIndex = logos.findIndex(
              (logo) => logo === data.logo?.name
            );
            if (logoIndex !== -1) {
              setSelectedLogo(logoIndex);
            }
          }
          if (data.customPointName) {
            setCustomPointNames(data.customPointName);
          }
          setIsEditMode(true);
        }
      } catch (error) {
        console.error("Error loading points:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPointsData();
  }, [storeId, channelId]);

  // Validation functions
  const validateForm = useCallback((): boolean => {
    const errors: ValidationErrors = {};

    if (!pointName || pointName.trim() === "") {
      errors.pointName = "Point name is required";
    }

    if (expiry && (!expiriesInDays || expiriesInDays <= 0)) {
      errors.expiryDays = "Expiry days must be greater than 0";
    }

    if (tierStatus) {
      const hasEmptyTierName = tiers.some(
        (tier) => !tier.tierName || tier.tierName.trim() === ""
      );
      const hasEmptyPointRequired = tiers.some(
        (tier) => tier.pointRequired === undefined || tier.pointRequired < 0
      );
      const hasEmptyMultiplier = tiers.some(
        (tier) => tier.multiplier === undefined || tier.multiplier <= 0
      );

      if (hasEmptyTierName) {
        errors.tierName = "All tier names are required";
      }
      if (hasEmptyPointRequired) {
        errors.pointRequired = "All points required fields must be filled";
      }
      if (hasEmptyMultiplier) {
        errors.multiplier = "All multipliers are required";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [pointName, expiry, expiriesInDays, tierStatus, tiers]);

  // Handle point name selection
  const handlePointNameChange = (value: string) => {
    if (value === "Custom Name") {
      setShowCustomNameModal(true);
    } else {
      setSelectedPointNameOption(value);
      setPointName(value);
      setValidationErrors((prev) => ({ ...prev, pointName: undefined }));
    }
  };

  // Handle custom name save
  const handleCustomNameSave = (name: string) => {
    if (!name || name.trim() === "") {
      setValidationErrors((prev) => ({
        ...prev,
        pointName: "Custom point name is required",
      }));
      return;
    }

    const sanitized = name.replace(/[^a-zA-Z0-9 ]/g, "").slice(0, 30);

    const newCustomPoint: CustomPointName = {
      name: sanitized,
      active: true,
    };

    setCustomPointNames([newCustomPoint]);
    setPointName(sanitized);
    setSelectedPointNameOption(sanitized);
    setShowCustomNameModal(false);
    setValidationErrors((prev) => ({ ...prev, pointName: undefined }));
  };

  // Handle logo selection
  const handleLogoSelect = (index: number) => {
    setSelectedLogo(index);
    setLogoDetails({
      id: index + 1,
      src: logos[index],
      name: logos[index],
    });
    setCustomLogo(null);
  };

  // Handle custom logo upload
  const handleCustomLogoUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/svg+xml";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        if (file.type !== "image/svg+xml") {
          alert("Only SVG files are allowed");
          return;
        }
        setCustomLogo(file);
        setLogoDetails({
          src: URL.createObjectURL(file),
          name: file.name,
        });
        setSelectedLogo(null);
      }
    };
    input.click();
  };

  // Handle expiry toggle
  const handleExpiryToggle = (checked: boolean) => {
    setExpiry(checked);
    if (!checked) {
      setExpiriesInDays(1);
      setValidationErrors((prev) => ({ ...prev, expiryDays: undefined }));
    }
  };

  // Handle expiry days change
  const handleExpiryDaysChange = (value: string) => {
    const sanitized = value.replace(/[^0-9]/g, "");
    const numValue = sanitized === "" ? 1 : parseInt(sanitized, 10);
    setExpiriesInDays(numValue);
    if (expiry && numValue > 0) {
      setValidationErrors((prev) => ({ ...prev, expiryDays: undefined }));
    }
  };

  // Handle tier toggle
  const handleTierToggle = (checked: boolean) => {
    setTierStatus(checked);
    if (!checked) {
      setValidationErrors((prev) => ({
        ...prev,
        tierName: undefined,
        pointRequired: undefined,
        multiplier: undefined,
      }));
    }
  };

  // Handle tier update
  const handleTierUpdate = (index: number, field: keyof Tier, value: any) => {
    setTiers((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });

    // Clear validation error for this field
    if (field === "tierName" && value.trim() !== "") {
      setValidationErrors((prev) => ({ ...prev, tierName: undefined }));
    } else if (field === "pointRequired" && value >= 0) {
      setValidationErrors((prev) => ({ ...prev, pointRequired: undefined }));
    } else if (field === "multiplier" && value > 0) {
      setValidationErrors((prev) => ({ ...prev, multiplier: undefined }));
    }
  };

  // Save function
  const handleSave = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    if (!storeId || !channelId) {
      alert("Store ID and Channel ID are required");
      return;
    }

    try {
      setLoading(true);

      const pointData: PointData = {
        pointName,
        expiry,
        tierStatus,
        logo: logoDetails || undefined,
        customPointName:
          customPointNames.length > 0 ? customPointNames : undefined,
        tier: tierStatus ? tiers : undefined,
      };

      if (expiry) {
        pointData.expiriesInDays = expiriesInDays;
      }

      let response;
      if (isEditMode && pointId) {
        response = await updatePoints(
          pointId,
          pointData,
          customLogo || undefined
        );
      } else {
        response = await savePoints(
          storeId,
          channelId,
          pointData,
          customLogo || undefined
        );
        if (response.data?._id) {
          setPointId(response.data._id);
          setIsEditMode(true);
        }
      }

      alert(response.message || "Points saved successfully!");
    } catch (error: any) {
      alert(error.message || "Failed to save points");
      console.error("Error saving points:", error);
    } finally {
      setLoading(false);
    }
  }, [
    validateForm,
    storeId,
    channelId,
    pointName,
    expiry,
    expiriesInDays,
    tierStatus,
    tiers,
    logoDetails,
    customPointNames,
    customLogo,
    isEditMode,
    pointId,
  ]);

  // Save and Next function
  const handleSaveAndNext = useCallback(async () => {
    await handleSave();
    // Navigate to next step (you can implement navigation logic here)
    // Example: router.push('/setup/next-step');
  }, [handleSave]);

  return (
    <>
      <div className="card !p-0">
        <div className="flex flex-col gap-1 p-4 border-b border-[#DEDEDE]">
          <h2 className="text-base font-bold">Points Setting</h2>
          <p>Set point name, logo, expiry and tiers.</p>
        </div>

        <div className="flex flex-col gap-6 p-4">
          {/* Point Name Selection */}
          <div className="w-full custom-dropi relative">
            <label className="block mb-1 text-[13px]">
              Select Name For Point
            </label>
            <select
              value={selectedPointNameOption}
              onChange={(e) => handlePointNameChange(e.target.value)}
              className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validationErrors.pointName
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            >
              <option value="">Select Name</option>
              {pointNameOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
              {customPointNames.length > 0 && (
                <option value={customPointNames[0].name}>
                  {customPointNames[0].name}
                </option>
              )}
              <option value="Custom Name">Custom Name</option>
            </select>
            {validationErrors.pointName && (
              <p className="text-red-500 text-xs mt-1">
                {validationErrors.pointName}
              </p>
            )}
          </div>

          {/* Custom Name Modal */}
          <CustomPointNameModal
            isOpen={showCustomNameModal}
            onClose={() => setShowCustomNameModal(false)}
            onSave={handleCustomNameSave}
            initialValue={
              customPointNames.length > 0 ? customPointNames[0].name : ""
            }
            validationError={validationErrors.pointName}
          />

          {/* Point Logo */}
          <div className="relative">
            <label className="block mb-1 text-[13px]">Point Logo</label>
            <div className="flex gap-4">
              <div className="flex gap-4 items-center">
                {logos.map((logo, index) => (
                  <button
                    key={index}
                    onClick={() => handleLogoSelect(index)}
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
                  onClick={handleCustomLogoUpload}
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

          {/* Point Expiry */}
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
                  value={expiriesInDays}
                  onChange={(e) => handleExpiryDaysChange(e.target.value)}
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
                  disabled={!expiry}
                  className={`w-[70px] h-8 border rounded-lg px-3 text-[13px] leading-none focus:outline-none bg-[#fdfdfd] ${
                    validationErrors.expiryDays
                      ? "border-red-500"
                      : "border-[#8a8a8a]"
                  } ${!expiry ? "opacity-50 cursor-not-allowed" : ""}`}
                />
                <span className="text-[13px]">days</span>
              </div>
              <Switch
                isSelected={expiry}
                onValueChange={handleExpiryToggle}
                aria-label="Set point expiry"
                size="sm"
                color="success"
              />
            </div>
            {validationErrors.expiryDays && (
              <p className="text-red-500 text-xs mt-1">
                {validationErrors.expiryDays}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Tier System */}
      <div className="card !p-0">
        <div className="flex justify-between items-center gap-6 p-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-base font-bold">Do you Want Tiers?</h2>
            <p>Reward loyal customers with higher tiers.</p>
          </div>
          <Switch
            isSelected={tierStatus}
            onValueChange={handleTierToggle}
            aria-label="Do you Want Tiers?"
            size="sm"
            color="success"
          />
        </div>

        {tierStatus && (
          <div className="p-4 border-t border-[#DEDEDE]">
            <TierTable
              tiers={tiers}
              isEditMode={isEditMode}
              onTierUpdate={handleTierUpdate}
              validationErrors={validationErrors}
            />
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 justify-end mt-4">
        <Button
          color="primary"
          variant="flat"
          onPress={handleSave}
          isLoading={loading}
          className="custom-btn-default"
        >
          Save
        </Button>
        <Button
          className="custom-btn"
          onPress={handleSaveAndNext}
          isLoading={loading}
        >
          Save & Next
        </Button>
      </div>
    </>
  );
}
