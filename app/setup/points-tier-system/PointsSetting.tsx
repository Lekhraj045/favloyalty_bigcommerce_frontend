"use client";

import UpgradeModal from "@/components/UpgradeModal";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateChannelCompletionStatus } from "@/store/slices/channelSlice";
import { setPointsData } from "@/store/slices/pointsSlice";
import { store } from "@/store/store";
import {
  CustomPointName,
  getPoints,
  getStoreId,
  getStorePlan,
  Logo,
  PointData,
  savePoints,
  StorePlan,
  Tier,
  updatePageCompletionStatus,
  updatePoints,
  updateSetupProgress,
} from "@/utils/api";
import { Button } from "@heroui/button";
import { Skeleton } from "@heroui/skeleton";
import { Switch } from "@heroui/switch";
import { addToast } from "@heroui/toast";
import { Upload } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
  const router = useRouter();

  // Form state
  const [pointName, setPointName] = useState<string>("Points");
  const [selectedPointNameOption, setSelectedPointNameOption] =
    useState<string>("Points");
  const [customPointNames, setCustomPointNames] = useState<CustomPointName[]>(
    [],
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
  const [loading, setLoading] = useState<boolean>(true);
  const [saveLoading, setSaveLoading] = useState<boolean>(false);
  const [saveAndNextLoading, setSaveAndNextLoading] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {},
  );
  const [showCustomNameModal, setShowCustomNameModal] =
    useState<boolean>(false);
  const [resetTierEditing, setResetTierEditing] = useState<boolean>(false);
  const [tierValidationErrors, setTierValidationErrors] = useState<Record<number, { pointRequired?: string; multiplier?: string }>>({});

  // Plan and upgrade modal state
  const [storePlan, setStorePlan] = useState<StorePlan | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState<boolean>(false);
  const [restrictedFeatureName, setRestrictedFeatureName] =
    useState<string>("");

  // Get selected channel from Redux store
  const selectedChannel = useAppSelector(
    (state) => state.channel.selectedChannel,
  );
  const dispatch = useAppDispatch();
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

  // Helper function to check if user is on free plan or order limit reached
  const isFreePlan = () => {
    return storePlan?.plan === "free" || storePlan?.limitReached === true;
  };

  // Helper function to show upgrade modal
  const showUpgradeModalForFeature = (featureName: string) => {
    setRestrictedFeatureName(featureName);
    setShowUpgradeModal(true);
  };

  // Load store plan and points data together to prevent flickering
  useEffect(() => {
    let isMounted = true;

    const loadAllData = async () => {
      if (!storeId || !channelId) {
        // Reset form if no channel selected
        resetFormToDefaults();
        setLoading(false);
        return;
      }

      try {
        // Load store plan first
        let plan: StorePlan;
        try {
          plan = await getStorePlan();
        } catch (error) {
          console.error("Error loading store plan:", error);
          // Default to free plan if error
          plan = {
            plan: "free",
            trialDaysRemaining: null,
            paypalSubscriptionId: null,
            limitReached: false,
            orderCount: 0,
            selectedOrderLimit: 0,
          };
        }

        if (!isMounted) return;

        setStorePlan(plan);

        // If free plan or limit reached, ensure expiry and tiers are turned off
        const isRestricted = plan.plan === "free" || plan.limitReached === true;
        if (isRestricted) {
          setExpiry(false);
          setTierStatus(false);
        }

        // Now load points data
        const data = await getPoints(storeId, channelId);

        if (!isMounted) return;

        if (data) {
          // Use _id if available, otherwise fallback to pointName (for backward compatibility)
          console.log("✅ Loaded points data for channel:", data);
          setPointId(data._id || data.pointName);
          setPointName(data.pointName);
          setSelectedPointNameOption(data.pointName);
          // If free plan or limit reached, ensure expiry and tiers are off regardless of saved data
          const isFree = plan.plan === "free" || plan.limitReached === true;
          setExpiry(isFree ? false : data.expiry);
          setExpiriesInDays(data.expiriesInDays || 1);
          setTierStatus(isFree ? false : data.tierStatus);
          const tiersToSet = data.tier || [
            { tierName: "Silver", pointRequired: 0, multiplier: 1 },
            { tierName: "Gold", pointRequired: 1000, multiplier: 1.2 },
            { tierName: "Platinum", pointRequired: 5000, multiplier: 1.5 },
          ];
          setTiers(tiersToSet);

          // Save to Redux store (only save tiers if tier system is enabled)
          dispatch(
            setPointsData({
              tierStatus: data.tierStatus,
              tiers: data.tierStatus ? tiersToSet : [],
              channelId: channelId,
            }),
          );
          if (data.logo) {
            setLogoDetails(data.logo);
            // Find logo index
            const logoIndex = logos.findIndex(
              (logo) => logo === data.logo?.name,
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
            "ℹ️ No points data found for this channel - resetting to defaults",
          );
          resetFormToDefaults();
          // Clear Redux store for this channel
          dispatch(
            setPointsData({
              tierStatus: false,
              tiers: [],
              channelId: channelId,
            }),
          );
        }
      } catch (error: any) {
        if (!isMounted) return;

        // If 404 or not found, reset to defaults
        if (
          error?.message?.includes("404") ||
          error?.message?.includes("not found")
        ) {
          console.log(
            "ℹ️ No points configuration found - resetting to defaults",
          );
          resetFormToDefaults();
        } else {
          console.error("Error loading points:", error);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadAllData();

    return () => {
      isMounted = false;
    };
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
        (tier) => !tier.tierName || tier.tierName.trim() === "",
      );
      const hasEmptyPointRequired = tiers.some(
        (tier) => tier.pointRequired === undefined || tier.pointRequired < 0,
      );
      const hasEmptyMultiplier = tiers.some(
        (tier) => tier.multiplier === undefined || tier.multiplier <= 0,
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

      // Validate progressive tier values
      for (let i = 1; i < tiers.length; i++) {
        const currentTier = tiers[i];
        const prevTier = tiers[i - 1];
        
        // Check Points Required progression
        if (currentTier.pointRequired <= prevTier.pointRequired) {
          errors.pointRequired = `Tier ${i + 1} points must be greater than Tier ${i} points`;
        }
        
        // Check Multiplier progression
        const currentMultiplier = currentTier.multiplier || 1;
        const prevMultiplier = prevTier.multiplier || 1;
        if (currentMultiplier <= prevMultiplier) {
          errors.multiplier = `Tier ${i + 1} multiplier must be greater than Tier ${i} multiplier`;
        }
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
    // Restrict logos: only first 3 are accessible for free users
    if (isFreePlan() && index >= 3) {
      showUpgradeModalForFeature("Premium Point Icon");
      return;
    }
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
    // Restrict custom logo upload for free users
    if (isFreePlan()) {
      showUpgradeModalForFeature("Custom Point Logo");
      return;
    }

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
    // Restrict expiry feature for free users - prevent turning on
    if (isFreePlan()) {
      if (checked) {
        showUpgradeModalForFeature("Set Point Expiry");
      }
      // Always keep it false for free users
      setExpiry(false);
      return;
    }
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
    // Restrict tiers feature for free users - prevent turning on
    if (isFreePlan()) {
      if (checked) {
        showUpgradeModalForFeature("Do you Want Tiers");
      }
      // Always keep it false for free users
      setTierStatus(false);
      return;
    }
    setTierStatus(checked);
    if (!checked) {
      setValidationErrors((prev) => ({
        ...prev,
        tierName: undefined,
        pointRequired: undefined,
        multiplier: undefined,
      }));
      // Clear tiers from Redux when tier system is disabled
      dispatch(
        setPointsData({
          tierStatus: false,
          tiers: [],
          channelId: channelId,
        }),
      );
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
          Boolean,
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
          `Store ID and Channel ID are required. Please select a channel.\nStore ID: ${currentStoreId || "missing"}\nChannel ID: ${currentChannelId || "missing"}`,
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
            customLogo || undefined,
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
            customLogo || undefined,
          );
          if (response.data?._id) {
            setPointId(response.data._id);
            setIsEditMode(true);
          }
        }

        // Update setup progress to 1 (only increases, never decreases)
        try {
          await updateSetupProgress(currentChannelId, 1);
        } catch (error) {
          console.error("Error updating setup progress:", error);
          // Don't fail the save if progress update fails
        }

        // Check if page is completed: pointName is selected AND logo is selected
        const isPageCompleted: boolean = !!(
          pointName &&
          pointName.trim() !== "" &&
          (logoDetails !== null || customLogo !== null)
        );

        // Update page completion status
        if (currentChannelId) {
          try {
            await updatePageCompletionStatus(
              currentChannelId,
              "pointsTierSystem",
              isPageCompleted,
            );
            // Update Redux store to reflect the new completion status
            dispatch(
              updateChannelCompletionStatus({
                channelId: currentChannelId,
                pageType: "pointsTierSystem",
                completed: isPageCompleted,
              }),
            );
          } catch (error) {
            console.error("Error updating page completion status:", error);
            // Don't fail the save if completion status update fails
          }
        }

        // Save tiers to Redux store
        dispatch(
          setPointsData({
            tierStatus: tierStatus,
            tiers: tierStatus ? tiers : [],
            channelId: currentChannelId,
          }),
        );

        // Reset tier editing state after successful save
        setResetTierEditing(true);
        setTimeout(() => setResetTierEditing(false), 100);

        // Stop loading first, then show success toast
        setLoadingState(false);

        // Show success toast after loading state is cleared
        addToast({
          title: "Saved Successfully",
          description: "Points settings have been saved successfully!",
          color: "success",
        });
      } catch (error: any) {
        setLoadingState(false);
        alert(error.message || "Failed to save points");
        console.error("Error saving points:", error);
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
      dispatch,
    ],
  );

  // Save function
  const handleSave = useCallback(async () => {
    console.log("🔵 handleSave called");
    await performSave(setSaveLoading);
  }, [performSave]);

  // Save and Next function
  const handleSaveAndNext = useCallback(async () => {
    await performSave(setSaveAndNextLoading);
    // Navigate to next step: Ways to Earn (using router to preserve Redux state)
    router.push("/setup/ways-to-earn");
  }, [performSave, router]);

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
                {logos.map((logo, index) => {
                  const isPremium = index >= 3;
                  const isRestricted = isFreePlan() && isPremium;
                  const isLastLogo = index === logos.length - 1;
                  return (
                    <button
                      key={index}
                      onClick={() => handleLogoSelect(index)}
                      className={`w-[50px] h-[50px] bg-white rounded-lg flex items-center justify-center relative ${
                        isRestricted
                          ? "cursor-pointer opacity-60"
                          : "cursor-pointer"
                      } ${
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
                        style={
                          isRestricted ? { filter: "grayscale(100%)" } : {}
                        }
                      />
                      {/* Show crown icon on premium logos (index >= 3) only for free users */}
                      {isPremium && isFreePlan() && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center z-10">
                          <svg
                            className="w-3 h-3 text-yellow-800"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </div>
                      )}
                    </button>
                  );
                })}
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
                  className={`w-[50px] h-[50px] bg-white border border-dashed border-[#abb1ba] rounded-lg flex items-center justify-center relative ${
                    isFreePlan()
                      ? "cursor-not-allowed opacity-60"
                      : "cursor-pointer"
                  }`}
                  onClick={handleCustomLogoUpload}
                  disabled={isFreePlan()}
                  title={
                    customLogo ? "Change custom logo" : "Upload custom logo"
                  }
                >
                  <Upload size={20} color="#616161" />
                  {/* Show crown icon for free users */}
                  {isFreePlan() && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center z-10">
                      <svg
                        className="w-3 h-3 text-yellow-800"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                  )}
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
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold">Set point expiry</h4>
                {isFreePlan() && (
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
              <div
                onClick={(e) => {
                  if (isFreePlan()) {
                    e.preventDefault();
                    e.stopPropagation();
                    showUpgradeModalForFeature("Set Point Expiry");
                  }
                }}
                className={isFreePlan() ? "cursor-pointer" : ""}
              >
                <Switch
                  isSelected={expiry}
                  onValueChange={handleExpiryToggle}
                  aria-label="Set point expiry"
                  size="sm"
                  color="success"
                  isDisabled={isFreePlan()}
                  classNames={{
                    base: isFreePlan() ? "opacity-50 cursor-not-allowed" : "",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tier System */}
      <div className="card !p-0">
        <div className="flex justify-between items-center gap-6 p-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold">Do you Want Tiers?</h2>
              {isFreePlan() && (
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
            <p>Reward loyal customers with higher tiers.</p>
          </div>
          <div
            onClick={(e) => {
              if (isFreePlan()) {
                e.preventDefault();
                e.stopPropagation();
                showUpgradeModalForFeature("Do you Want Tiers");
              }
            }}
            className={isFreePlan() ? "cursor-pointer" : ""}
          >
            <Switch
              isSelected={tierStatus}
              onValueChange={handleTierToggle}
              aria-label="Do you Want Tiers?"
              size="sm"
              color="success"
              isDisabled={isFreePlan()}
              classNames={{
                base: isFreePlan() ? "opacity-50 cursor-not-allowed" : "",
              }}
            />
          </div>
        </div>

        {tierStatus && (
          <div className="p-4 border-t border-[#DEDEDE]">
            <TierTable
              tiers={tiers}
              isEditMode={isEditMode}
              onTierUpdate={handleTierUpdate}
              validationErrors={validationErrors}
              resetEditing={resetTierEditing}
              onTierValidationError={setTierValidationErrors}
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

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        featureName={restrictedFeatureName}
      />
    </>
  );
}
