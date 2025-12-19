"use client";

import { useAppSelector } from "@/store/hooks";
import { store } from "@/store/store";
import {
  CustomPointName,
  getPoints,
  getStoreId,
  Logo,
  PointData,
  savePoints,
  Tier,
  updatePoints,
} from "@/utils/api";
import { Button } from "@heroui/button";
import { Skeleton } from "@heroui/skeleton";
import { Switch } from "@heroui/switch";
import { addToast } from "@heroui/toast";
import { Upload } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import CustomPointNameModal from "./CustomPointNameModal";
import TierTable from "./TierTable";

interface ValidationErrors {
  pointName?: string;
  logo?: string;
  expiryDays?: string;
  tierName?: string;
  pointRequired?: string;
  multiplier?: string;
}

export default function PointsSetting() {
  // Form state
  const [pointName, setPointName] = useState<string>("Points");
  const [selectedPointNameOption, setSelectedPointNameOption] =
    useState<string>("Points");
  const [customPointNames, setCustomPointNames] = useState<CustomPointName[]>(
    []
  );
  const [selectedLogo, setSelectedLogo] = useState<number | null>(0);
  const [customLogo, setCustomLogo] = useState<File | null>(null);
  const [logoDetails, setLogoDetails] = useState<Logo | null>({
    id: 1,
    src: "point-icon1.svg",
    name: "point-icon1.svg",
  });
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
  const [saveLoading, setSaveLoading] = useState<boolean>(false);
  const [saveAndNextLoading, setSaveAndNextLoading] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );
  const [showCustomNameModal, setShowCustomNameModal] =
    useState<boolean>(false);
  const [resetTierEditing, setResetTierEditing] = useState<boolean>(false);

  // Get selected channel from Redux store
  const selectedChannel = useAppSelector(
    (state) => state.channel.selectedChannel
  );
  const storeId = getStoreId();
  const channelId = selectedChannel?.id || null;
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

  // Reset form to default values
  const resetFormToDefaults = useCallback(() => {
    setPointId(null);
    setPointName("Points");
    setSelectedPointNameOption("Points");
    setCustomPointNames([]);
    setSelectedLogo(0);
    setCustomLogo(null);
    setLogoDetails({
      id: 1,
      src: "point-icon1.svg",
      name: "point-icon1.svg",
    });
    setExpiry(false);
    setExpiriesInDays(1);
    setTierStatus(false);
    setTiers([
      { tierName: "Silver", pointRequired: 0, multiplier: 1 },
      { tierName: "Gold", pointRequired: 1000, multiplier: 1.2 },
      { tierName: "Platinum", pointRequired: 5000, multiplier: 1.5 },
    ]);
    setIsEditMode(false);
    setValidationErrors({});
  }, []);

  // Load existing points data
  useEffect(() => {
    const loadPointsData = async () => {
      if (!storeId || !channelId) {
        // Reset form if no channel selected
        resetFormToDefaults();
        return;
      }

      try {
        setLoading(true);
        const data = await getPoints(storeId, channelId);
        if (data) {
          // Use _id if available, otherwise fallback to pointName (for backward compatibility)
          console.log("✅ Loaded points data for channel:", data);
          setPointId(data._id || data.pointName);
          setPointName(data.pointName);
          setSelectedPointNameOption(data.pointName);
          setExpiry(data.expiry);
          setExpiriesInDays(data.expiriesInDays || 1);
          setTierStatus(data.tierStatus);
          if (data.tier) {
            setTiers(data.tier);
          } else {
            // Reset to default tiers if no tiers in data
            setTiers([
              { tierName: "Silver", pointRequired: 0, multiplier: 1 },
              { tierName: "Gold", pointRequired: 1000, multiplier: 1.2 },
              { tierName: "Platinum", pointRequired: 5000, multiplier: 1.5 },
            ]);
          }
          if (data.logo) {
            setLogoDetails(data.logo);
            // Find logo index
            const logoIndex = logos.findIndex(
              (logo) => logo === data.logo?.name
            );
            if (logoIndex !== -1) {
              // Predefined logo found
              setSelectedLogo(logoIndex);
              setCustomLogo(null); // Clear any custom logo
            } else {
              // Custom logo from database (not in predefined list)
              setSelectedLogo(null);
              setCustomLogo(null); // No File object, just URL from database
            }
          } else {
            // No logo in data, default to first logo
            setSelectedLogo(0);
            setCustomLogo(null);
            setLogoDetails({
              id: 1,
              src: "point-icon1.svg",
              name: "point-icon1.svg",
            });
          }
          if (data.customPointName) {
            setCustomPointNames(data.customPointName);
          } else {
            setCustomPointNames([]);
          }
          setIsEditMode(true);
        } else {
          // No data found - reset to default values
          console.log(
            "ℹ️ No points data found for this channel - resetting to defaults"
          );
          resetFormToDefaults();
        }
      } catch (error: any) {
        // If 404 or not found, reset to defaults
        if (
          error?.message?.includes("404") ||
          error?.message?.includes("not found")
        ) {
          console.log(
            "ℹ️ No points configuration found - resetting to defaults"
          );
          resetFormToDefaults();
        } else {
          console.error("Error loading points:", error);
        }
      } finally {
        setLoading(false);
      }
    };

    loadPointsData();
  }, [storeId, channelId, selectedChannel?.id, resetFormToDefaults]);

  // Validation functions
  const validateForm = useCallback((): {
    isValid: boolean;
    errors: ValidationErrors;
  } => {
    const errors: ValidationErrors = {};

    if (!pointName || pointName.trim() === "") {
      errors.pointName = "Point name is required";
    }

    // Validate logo - must have either selectedLogo, logoDetails, or customLogo
    if (selectedLogo === null && !logoDetails && !customLogo) {
      errors.logo = "Point logo is required";
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
    return { isValid: Object.keys(errors).length === 0, errors };
  }, [
    pointName,
    selectedLogo,
    logoDetails,
    customLogo,
    expiry,
    expiriesInDays,
    tierStatus,
    tiers,
  ]);

  // Handle point name selection
  const handlePointNameChange = (value: string) => {
    // Prevent selecting empty value
    if (!value || value === "") {
      return;
    }
    if (value === "Custom Name") {
      setShowCustomNameModal(true);
    } else {
      setSelectedPointNameOption(value);
      setPointName(value);
      // Clear validation error when point name is selected
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
    // Clear logo validation error when logo is selected
    setValidationErrors((prev) => ({ ...prev, logo: undefined }));
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
        // Clear logo validation error when custom logo is uploaded
        setValidationErrors((prev) => ({ ...prev, logo: undefined }));
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

  // Shared save logic
  const performSave = useCallback(
    async (setLoadingState: (loading: boolean) => void) => {
      console.log("🔵 Save button clicked");
      console.log("Current state:", {
        storeId,
        channelId,
        selectedChannel,
        pointName,
      });

      // Get fresh values from Redux store
      const currentState = store.getState();
      const currentSelectedChannel = currentState.channel.selectedChannel;
      const currentStoreId = getStoreId();
      const currentChannelId = currentSelectedChannel?.id || null;

      console.log("Fresh values:", {
        currentStoreId,
        currentChannelId,
        currentSelectedChannel,
      });

      const validationResult = validateForm();
      if (!validationResult.isValid) {
        console.log("❌ Form validation failed", validationResult.errors);

        // Show error toast with list of missing fields
        const errorMessages = Object.values(validationResult.errors).filter(
          Boolean
        );
        const errorMessage =
          errorMessages.length > 0
            ? `Please fill in the following required fields: ${errorMessages.join(", ")}`
            : "Please fill in all required fields";

        addToast({
          title: "Validation Error",
          description: errorMessage,
          color: "danger",
        });

        // Scroll to first error
        const firstErrorKey = Object.keys(validationResult.errors)[0];
        if (firstErrorKey) {
          const errorElement =
            document.querySelector(`[data-field="${firstErrorKey}"]`) ||
            document.querySelector(`[data-error="${firstErrorKey}"]`) ||
            document.querySelector(`input[name="${firstErrorKey}"]`) ||
            document.querySelector(`select[name="${firstErrorKey}"]`);
          if (errorElement) {
            errorElement.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }
        }
        return;
      }

      if (!currentStoreId || !currentChannelId) {
        console.error("❌ Missing IDs:", {
          storeId: currentStoreId,
          channelId: currentChannelId,
        });
        alert(
          `Store ID and Channel ID are required. Please select a channel.\nStore ID: ${currentStoreId || "missing"}\nChannel ID: ${currentChannelId || "missing"}`
        );
        return;
      }

      try {
        setLoadingState(true);

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
          console.log("📤 Calling savePoints API with:", {
            storeId: currentStoreId,
            channelId: currentChannelId,
            pointData,
          });
          response = await savePoints(
            currentStoreId,
            currentChannelId,
            pointData,
            customLogo || undefined
          );
          if (response.data?._id) {
            setPointId(response.data._id);
            setIsEditMode(true);
          }
        }

        addToast({
          title: "Saved Successfully",
          description: "Points settings have been saved successfully!",
          color: "success",
          promise: new Promise((resolve) => setTimeout(resolve, 1000)),
        });

        // Reset tier editing state after successful save
        setResetTierEditing(true);
        setTimeout(() => setResetTierEditing(false), 100);
      } catch (error: any) {
        alert(error.message || "Failed to save points");
        console.error("Error saving points:", error);
      } finally {
        setLoadingState(false);
      }
    },
    [
      validateForm,
      storeId,
      channelId,
      selectedChannel?.id,
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
    ]
  );

  // Save function
  const handleSave = useCallback(async () => {
    console.log("🔵 handleSave called");
    await performSave(setSaveLoading);
  }, [performSave]);

  // Save and Next function
  const handleSaveAndNext = useCallback(async () => {
    await performSave(setSaveAndNextLoading);
    // Navigate to next step (you can implement navigation logic here)
    // Example: router.push('/setup/next-step');
  }, [performSave]);

  // Show message if no channel is selected
  if (!selectedChannel) {
    return (
      <div className="card !p-0">
        <div className="p-4">
          <p className="text-sm text-gray-600">
            Please select a channel from the header to configure points
            settings.
          </p>
        </div>
      </div>
    );
  }

  // Show skeleton loading state
  if (loading) {
    return (
      <>
        <div className="card !p-0">
          <div className="flex flex-col gap-1 p-4 border-b border-[#DEDEDE]">
            <Skeleton className="h-5 w-32 rounded" />
            <Skeleton className="h-4 w-64 rounded mt-1" />
          </div>

          <div className="flex flex-col gap-6 p-4">
            {/* Point Name Selection Skeleton */}
            <div className="w-full">
              <Skeleton className="h-4 w-40 rounded mb-2" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>

            {/* Point Logo Skeleton */}
            <div className="relative">
              <Skeleton className="h-4 w-24 rounded mb-2" />
              <div className="flex gap-4">
                <div className="flex gap-4 items-center">
                  {[1, 2, 3, 4, 5, 6].map((index) => (
                    <Skeleton
                      key={index}
                      className="w-[50px] h-[50px] rounded-lg"
                    />
                  ))}
                  <Skeleton className="w-[50px] h-[50px] rounded-lg" />
                </div>
                <Skeleton className="h-16 w-64 rounded-lg" />
              </div>
            </div>

            {/* Point Expiry Skeleton */}
            <div className="card !bg-[#F8FAFC] flex justify-between gap-2">
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-32 rounded" />
                <Skeleton className="h-3 w-64 rounded" />
              </div>
              <div className="flex gap-2 items-center">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-10 rounded" />
                  <Skeleton className="h-8 w-[70px] rounded-lg" />
                  <Skeleton className="h-4 w-12 rounded" />
                </div>
                <Skeleton className="h-6 w-12 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Tier System Skeleton */}
        <div className="card !p-0">
          <div className="flex justify-between items-center gap-6 p-4">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-5 w-40 rounded" />
              <Skeleton className="h-3 w-64 rounded" />
            </div>
            <Skeleton className="h-6 w-12 rounded-full" />
          </div>
        </div>

        {/* Action Buttons Skeleton */}
        <div className="flex items-center gap-3 justify-end mt-4">
          <Skeleton className="h-10 w-24 rounded" />
          <Skeleton className="h-10 w-32 rounded" />
        </div>
      </>
    );
  }

  return (
    <>
      <div className="card !p-0">
        <div className="flex flex-col gap-1 p-4 border-b border-[#DEDEDE]">
          <h2 className="text-base font-bold">Points Setting</h2>
          <p>Set point name, logo, expiry and tiers.</p>
        </div>

        <div className="flex flex-col gap-6 p-4">
          {/* Point Name Selection */}
          <div className="w-full custom-dropi relative" data-field="pointName">
            <label className="block mb-1 text-[13px]">
              Select Name For Point
            </label>
            <select
              value={selectedPointNameOption}
              onChange={(e) => handlePointNameChange(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="" disabled>
                Select Name
              </option>
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
          <div className="relative" data-field="logo">
            <label className="block mb-1 text-[13px]">Point Logo</label>
            <div className="flex gap-4">
              <div className="flex gap-4 items-center">
                {logos.map((logo, index) => (
                  <button
                    key={index}
                    onClick={() => handleLogoSelect(index)}
                    className={`w-[50px] h-[50px] bg-white rounded-lg flex items-center justify-center cursor-pointer ${
                      selectedLogo === index && !customLogo
                        ? "border-solid border-[#007f5f]"
                        : "border-dashed border-[#abb1ba]"
                    } border`}
                    style={{
                      borderColor:
                        selectedLogo === index && !customLogo
                          ? "#007f5f"
                          : "#abb1ba",
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
                {/* Custom Logo Display - appears after predefined logos */}
                {/* Only show if there's a custom logo (either uploaded locally or from database) */}
                {(() => {
                  // Check if logoDetails contains a custom logo (not in predefined list)
                  const isCustomLogoFromDB =
                    logoDetails &&
                    !logos.includes(logoDetails.name) &&
                    selectedLogo === null;
                  // Show if user uploaded a custom logo OR if there's a custom logo from database
                  return (customLogo || isCustomLogoFromDB) && logoDetails ? (
                    <button
                      onClick={handleCustomLogoUpload}
                      className="w-[50px] h-[50px] bg-white rounded-lg flex items-center justify-center cursor-pointer border-solid border-[#007f5f] border"
                      style={{
                        borderColor: "#007f5f",
                      }}
                      title="Click to change custom logo"
                    >
                      <img
                        src={logoDetails.src}
                        alt="Custom Logo"
                        width={25}
                        height={25}
                        className="object-contain"
                      />
                    </button>
                  ) : null;
                })()}
                {/* Upload Button - always visible */}
                <button
                  className="w-[50px] h-[50px] bg-white border border-dashed border-[#abb1ba] rounded-lg flex items-center justify-center cursor-pointer"
                  onClick={handleCustomLogoUpload}
                  title={
                    customLogo ? "Change custom logo" : "Upload custom logo"
                  }
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
                  className={`w-[70px] h-8 border border-[#8a8a8a] rounded-lg px-3 text-[13px] leading-none focus:outline-none bg-[#fdfdfd] ${
                    !expiry ? "opacity-50 cursor-not-allowed" : ""
                  }`}
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
              resetEditing={resetTierEditing}
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
          isLoading={saveLoading}
          className="custom-btn-default"
        >
          Save
        </Button>
        <Button
          className="custom-btn"
          onPress={handleSaveAndNext}
          isLoading={saveAndNextLoading}
        >
          Save & Next
        </Button>
      </div>
    </>
  );
}
