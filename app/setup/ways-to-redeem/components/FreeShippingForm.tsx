"use client";

import { useAppSelector } from "@/store/hooks";
import {
  createRedeemCoupon,
  getStoreId,
  updateRedeemCoupon,
  type CreateRedeemCouponData,
  type RedeemCoupon,
} from "@/utils/api";
import { Button } from "@heroui/button";
import { Switch } from "@heroui/switch";
import { addToast } from "@heroui/toast";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { validateTiers } from "../utils/tierValidation";
import CustomerTierSelection from "./CustomerTierSelection";

interface FreeShippingFormProps {
  onBack: () => void;
  onSuccess?: () => void;
  coupon?: RedeemCoupon | null; // Optional coupon data for edit mode
}

export default function FreeShippingForm({
  onBack,
  onSuccess,
  coupon,
}: FreeShippingFormProps) {
  const selectedChannel = useAppSelector(
    (state) => state.channel.selectedChannel,
  );
  const storeId = getStoreId();
  const channelId = selectedChannel?.id || null;
  const isEditMode = !!coupon;

  const [pointValue, setPointValue] = useState<string>("");
  const [expireCoupon, setExpireCoupon] = useState<string>("");
  const [minPurchaseEnabled, setMinPurchaseEnabled] = useState<boolean>(false); // OFF by default
  const [minPurchaseAmount, setMinPurchaseAmount] = useState<string>("");
  const [selectedTiers, setSelectedTiers] = useState<
    Array<{
      status: boolean;
      name: string;
      tierId: string;
      tierIndex: number;
    }>
  >([]);
  const [customerRestrictionEnabled, setCustomerRestrictionEnabled] =
    useState<boolean>(true); // true = disabled (no restriction)
  const [loading, setLoading] = useState(false);

  // Validation errors
  const [errors, setErrors] = useState<{
    pointValue?: string;
    expireCoupon?: string;
    minPurchaseAmount?: string;
    customerTierSelection?: string;
  }>({});

  // Load coupon data when editing, or reset form when creating new
  useEffect(() => {
    if (coupon && coupon.coupon) {
      // Pre-populate form fields with existing coupon data
      setPointValue(coupon.coupon.value?.toString() || "");

      // Handle expiry - convert days to string if hasExpiry is true
      if (coupon.coupon.hasExpiry && coupon.coupon.expire) {
        setExpireCoupon(coupon.coupon.expire.toString());
      } else {
        setExpireCoupon("");
      }

      // Handle minimum purchase amount
      if (coupon.coupon.restriction?.minimumPurchaseAmount) {
        const minPurchase = coupon.coupon.restriction.minimumPurchaseAmount;
        setMinPurchaseEnabled(minPurchase.status || false);
        // Always load the value if it exists, regardless of status
        if (minPurchase.value != null && minPurchase.value > 0) {
          setMinPurchaseAmount(minPurchase.value.toString());
        } else {
          setMinPurchaseAmount("");
        }
      } else {
        setMinPurchaseEnabled(false);
        setMinPurchaseAmount("");
      }

      // Handle customer tier restrictions
      // Backend stores at coupon.restriction.selectedCustomber
      const selectedCustomber = coupon.coupon?.restriction?.selectedCustomber;
      if (selectedCustomber) {
        // status: true = restriction enabled, false = restriction disabled
        // customerRestrictionEnabled: true = disabled (no restriction), false = enabled (restriction ON)
        // So: customerRestrictionEnabled = !selectedCustomber.status
        setCustomerRestrictionEnabled(!selectedCustomber.status);
        if (selectedCustomber.tier && selectedCustomber.tier.length > 0) {
          // Validate tierIds when loading from existing coupon
          const validatedTiers = validateTiers(selectedCustomber.tier);
          setSelectedTiers(validatedTiers);
        } else {
          setSelectedTiers([]);
        }
      } else {
        setCustomerRestrictionEnabled(true); // Default: no restriction
        setSelectedTiers([]);
      }
    } else {
      // Reset form when creating new coupon
      setPointValue("");
      setExpireCoupon("");
      setMinPurchaseEnabled(false); // OFF by default
      setMinPurchaseAmount("");
      setCustomerRestrictionEnabled(true);
      setSelectedTiers([]);
    }
  }, [coupon]);

  // Handler to prevent decimal input and enforce max values
  const handlePointValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Remove any decimal points and non-numeric characters except empty string
    let wholeNumber = value.replace(/[^\d]/g, "");

    // Enforce maximum value of 999999
    if (wholeNumber && parseInt(wholeNumber) > 999999) {
      wholeNumber = "999999";
    }

    setPointValue(wholeNumber);

    // Clear error if value is now valid
    if (errors.pointValue && wholeNumber) {
      const num = parseInt(wholeNumber);
      if (!isNaN(num) && num >= 1 && num <= 999999) {
        setErrors((prev) => ({ ...prev, pointValue: undefined }));
      }
    }
  };

  const handleExpireCouponChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Remove any decimal points and non-numeric characters except empty string
    let wholeNumber = value.replace(/[^\d]/g, "");

    // Enforce maximum value of 365
    if (wholeNumber && parseInt(wholeNumber) > 365) {
      wholeNumber = "365";
    }

    setExpireCoupon(wholeNumber);

    // Clear error if value is now valid
    if (errors.expireCoupon && wholeNumber) {
      const num = parseInt(wholeNumber);
      if (!isNaN(num) && num >= 1 && num <= 365) {
        setErrors((prev) => ({ ...prev, expireCoupon: undefined }));
      }
    }
  };

  const handleMinPurchaseAmountChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.target.value;
    // Allow decimal numbers for purchase amount
    // Remove any non-numeric characters except decimal point
    let numericValue = value.replace(/[^\d.]/g, "");

    // Ensure only one decimal point
    const parts = numericValue.split(".");
    if (parts.length > 2) {
      numericValue = parts[0] + "." + parts.slice(1).join("");
    }

    // Enforce maximum value of 999999.99
    const numValue = parseFloat(numericValue);
    if (!isNaN(numValue) && numValue > 999999.99) {
      numericValue = "999999.99";
    }

    setMinPurchaseAmount(numericValue);

    // Clear error if value is now valid
    if (errors.minPurchaseAmount && numericValue) {
      const num = parseFloat(numericValue);
      if (!isNaN(num) && num >= 0.01 && num <= 999999.99) {
        setErrors((prev) => ({ ...prev, minPurchaseAmount: undefined }));
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    // Validate pointValue (1-999,999) - only whole numbers
    const pointValueNum = parseInt(pointValue);
    if (
      !pointValue ||
      isNaN(pointValueNum) ||
      pointValueNum < 1 ||
      pointValueNum > 999999
    ) {
      newErrors.pointValue =
        "Point value must be between 1 and 999,999 (whole numbers only)";
    }

    // Validate expireCoupon (optional, but if provided must be 1-365) - only whole numbers
    if (expireCoupon.trim() !== "") {
      const expireNum = parseInt(expireCoupon);
      if (isNaN(expireNum) || expireNum < 1 || expireNum > 365) {
        newErrors.expireCoupon =
          "Expiry days must be between 1 and 365 (whole numbers only)";
      }
    }

    // Validate minPurchaseAmount if enabled
    if (minPurchaseEnabled) {
      const minPurchaseNum = parseFloat(minPurchaseAmount);
      if (
        !minPurchaseAmount ||
        isNaN(minPurchaseNum) ||
        minPurchaseNum < 0.01 ||
        minPurchaseNum > 999999.99
      ) {
        newErrors.minPurchaseAmount =
          "Minimum purchase amount must be between 0.01 and 999,999.99";
      }
    }

    // Validate customer tier selection when restriction is enabled
    // customerRestrictionEnabled: true = disabled (no restriction), false = enabled (restriction ON)
    if (!customerRestrictionEnabled) {
      // Restriction is enabled, check if at least one tier is selected
      const hasSelectedTier = selectedTiers.some(
        (tier) => tier.status === true,
      );
      if (!hasSelectedTier) {
        newErrors.customerTierSelection =
          "Please select at least one customer tier or disable the customer restriction";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      addToast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        color: "danger",
      });
      return;
    }

    if (!storeId || !channelId) {
      addToast({
        title: "Error",
        description: "Store ID or Channel ID is missing",
        color: "danger",
      });
      return;
    }

    setLoading(true);

    try {
      // Validate and fix tierIds to ensure they're valid ObjectIds
      const validatedTiers = validateTiers(selectedTiers);

      // Prepare coupon data for free shipping
      const couponData: CreateRedeemCouponData = {
        redeemType: "freeShipping",
        target_type: "shipping",
        pointValue: parseInt(pointValue),
        expire: expireCoupon.trim() === "" ? null : expireCoupon.trim(),
        selectedItems: [],
        selectedCollections: [],
        seletedCust: {
          tier: validatedTiers,
          tag: [],
        },
        seletedCustDisable: customerRestrictionEnabled, // true = disabled (no restriction)
        seletedProductDisable: true, // No product restriction for free shipping
        currentRestrictionType: "product",
        onlineStoreDashBoardDisable: false,
        redemptionLimitDisable: true,
        minimumnPurchaseAmountDisable: !minPurchaseEnabled, // false = enabled, true = disabled
        minimumnPurchaseAmount: minPurchaseAmount
          ? parseFloat(minPurchaseAmount)
          : 0, // Preserve value even when disabled
      };

      let result;
      if (isEditMode && coupon?._id) {
        // Update existing coupon
        result = await updateRedeemCoupon(
          coupon._id,
          storeId,
          channelId,
          couponData,
        );

        if (result.success) {
          addToast({
            title: "Success",
            description: "Free shipping coupon updated successfully",
            color: "success",
          });

          // Call success callback or go back
          if (onSuccess) {
            onSuccess();
          } else {
            onBack();
          }
        }
      } else {
        // Create new coupon
        result = await createRedeemCoupon(storeId, channelId, couponData);

        if (result.success) {
          addToast({
            title: "Success",
            description: "Free shipping coupon created successfully",
            color: "success",
          });

          // Reset form
          setPointValue("");
          setExpireCoupon("");
          setMinPurchaseEnabled(false);
          setMinPurchaseAmount("");
          setCustomerRestrictionEnabled(true);
          setSelectedTiers([]);

          // Call success callback or go back
          if (onSuccess) {
            onSuccess();
          } else {
            onBack();
          }
        }
      }
    } catch (error: any) {
      console.error("Error creating free shipping coupon:", error);
      addToast({
        title: "Error",
        description: error.message || "Failed to create free shipping coupon",
        color: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Top Section: Coupon Configuration */}
      <div className="card !p-0">
        <div className="flex items-center gap-3 p-4 border-b border-[#DEDEDE]">
          <button
            onClick={onBack}
            className="text-black hover:text-black transition-colors cursor-pointer flex items-center justify-center"
          >
            <ArrowLeft size={20} color="#000000" strokeWidth={2} />
          </button>
          <h2 className="text-base font-bold">
            {isEditMode
              ? "Edit Free Shipping Coupon"
              : "Create Free Shipping Coupon"}
          </h2>
        </div>

        <div className="p-4 grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 text-[13px] text-gray-700">
              Select Coupon Value (Point Wise)
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={pointValue}
              onChange={handlePointValueChange}
              onKeyDown={(e) => {
                // Allow: backspace, delete, tab, escape, enter, and numbers
                if (
                  [46, 8, 9, 27, 13, 110, 190].indexOf(e.keyCode) !== -1 ||
                  // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                  (e.keyCode === 65 && e.ctrlKey === true) ||
                  (e.keyCode === 67 && e.ctrlKey === true) ||
                  (e.keyCode === 86 && e.ctrlKey === true) ||
                  (e.keyCode === 88 && e.ctrlKey === true) ||
                  // Allow: home, end, left, right
                  (e.keyCode >= 35 && e.keyCode <= 39)
                ) {
                  return;
                }
                // Ensure that it is a number and stop the keypress
                if (
                  (e.shiftKey || e.keyCode < 48 || e.keyCode > 57) &&
                  (e.keyCode < 96 || e.keyCode > 105)
                ) {
                  e.preventDefault();
                }
              }}
              onBlur={() => {
                // Validate on blur
                if (pointValue) {
                  const num = parseInt(pointValue);
                  if (isNaN(num) || num < 1 || num > 999999) {
                    setErrors((prev) => ({
                      ...prev,
                      pointValue:
                        "Point value must be between 1 and 999,999 (whole numbers only)",
                    }));
                  }
                }
              }}
              placeholder="Ex: 1000"
              className={`w-full h-8 border rounded-lg px-3 text-[13px] leading-none focus:outline-none bg-[#fdfdfd] ${
                errors.pointValue ? "border-red-500" : "border-[#8a8a8a]"
              }`}
            />
            {errors.pointValue ? (
              <span className="text-xs text-red-500 mt-1">
                {errors.pointValue}
              </span>
            ) : (
              <p className="text-xs text-gray-500 mt-1">
                Maximum 999,999 points allowed
              </p>
            )}
          </div>

          <div>
            <label className="block mb-1 text-[13px] text-gray-700">
              Expire Coupon After (Optional)
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={expireCoupon}
              onChange={handleExpireCouponChange}
              onKeyDown={(e) => {
                // Allow: backspace, delete, tab, escape, enter, and numbers
                if (
                  [46, 8, 9, 27, 13, 110, 190].indexOf(e.keyCode) !== -1 ||
                  // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                  (e.keyCode === 65 && e.ctrlKey === true) ||
                  (e.keyCode === 67 && e.ctrlKey === true) ||
                  (e.keyCode === 86 && e.ctrlKey === true) ||
                  (e.keyCode === 88 && e.ctrlKey === true) ||
                  // Allow: home, end, left, right
                  (e.keyCode >= 35 && e.keyCode <= 39)
                ) {
                  return;
                }
                // Ensure that it is a number and stop the keypress
                if (
                  (e.shiftKey || e.keyCode < 48 || e.keyCode > 57) &&
                  (e.keyCode < 96 || e.keyCode > 105)
                ) {
                  e.preventDefault();
                }
              }}
              onBlur={() => {
                // Validate on blur
                if (expireCoupon.trim()) {
                  const num = parseInt(expireCoupon);
                  if (isNaN(num) || num < 1 || num > 365) {
                    setErrors((prev) => ({
                      ...prev,
                      expireCoupon:
                        "Expiry days must be between 1 and 365 (whole numbers only)",
                    }));
                  }
                }
              }}
              placeholder="Ex. 30 (leave empty for no expiry)"
              className={`w-full h-8 border rounded-lg px-3 text-[13px] leading-none focus:outline-none bg-[#fdfdfd] ${
                errors.expireCoupon ? "border-red-500" : "border-[#8a8a8a]"
              }`}
            />
            {errors.expireCoupon ? (
              <p className="text-xs text-red-500 mt-1">{errors.expireCoupon}</p>
            ) : (
              <p className="text-xs text-gray-500 mt-1">
                Leave empty for no expiry, or enter days (max 365 days)
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section: Set minimum purchase amount */}
      <div className="card !p-0">
        <div className="flex justify-between items-center gap-6 p-4 border-b border-[#DEDEDE]">
          <span className="text-base font-bold">
            Set minimum purchase amount
          </span>
          <Switch
            aria-label="Set minimum purchase amount"
            size="sm"
            color="success"
            isSelected={minPurchaseEnabled}
            onValueChange={setMinPurchaseEnabled}
          />
        </div>

        {minPurchaseEnabled && (
          <div className="p-4 flex flex-col gap-4">
            <div>
              <label className="block mb-1 text-[13px] text-gray-700">
                Minimum Purchase Amount
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={minPurchaseAmount}
                onChange={handleMinPurchaseAmountChange}
                onBlur={() => {
                  // Validate on blur
                  if (minPurchaseEnabled && minPurchaseAmount) {
                    const num = parseFloat(minPurchaseAmount);
                    if (isNaN(num) || num < 0.01 || num > 999999.99) {
                      setErrors((prev) => ({
                        ...prev,
                        minPurchaseAmount:
                          "Minimum purchase amount must be between 0.01 and 999,999.99",
                      }));
                    }
                  }
                }}
                placeholder="Enter Value (e.g., 50.00)"
                className={`w-full h-8 border rounded-lg px-3 text-[13px] leading-none focus:outline-none bg-[#fdfdfd] ${
                  errors.minPurchaseAmount
                    ? "border-red-500"
                    : "border-[#8a8a8a]"
                }`}
              />
              {errors.minPurchaseAmount ? (
                <p className="text-xs text-red-500 mt-1">
                  {errors.minPurchaseAmount}
                </p>
              ) : (
                <p className="text-xs text-gray-500 mt-1">
                  Maximum 999,999.99 allowed
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Customer Tier Selection */}
      <CustomerTierSelection
        selectedTiers={selectedTiers}
        customerRestrictionEnabled={customerRestrictionEnabled}
        onTiersChange={setSelectedTiers}
        onRestrictionToggle={setCustomerRestrictionEnabled}
        error={errors.customerTierSelection}
        onErrorClear={() =>
          setErrors((prev) => ({ ...prev, customerTierSelection: undefined }))
        }
      />

      <div className="flex items-center justify-end mt-4">
        <Button
          className="custom-btn"
          onPress={handleSubmit}
          isLoading={loading}
          disabled={loading}
        >
          {isEditMode ? "Update" : "Create"}
        </Button>
      </div>
    </div>
  );
}
