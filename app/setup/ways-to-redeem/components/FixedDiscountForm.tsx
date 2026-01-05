"use client";

import { useState, useEffect } from "react";
import { Button } from "@heroui/button";
import { Switch } from "@heroui/switch";
import { ArrowLeft } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { getStoreId } from "@/utils/api";
import { createRedeemCoupon, updateRedeemCoupon, type CreateRedeemCouponData, type RedeemCoupon } from "@/utils/api";
import { addToast } from "@heroui/toast";
import CustomerTierSelection from "./CustomerTierSelection";
import { validateTiers } from "../utils/tierValidation";

interface FixedDiscountFormProps {
  onBack: () => void;
  onSuccess?: () => void;
  coupon?: RedeemCoupon | null; // Optional coupon data for edit mode
}

export default function FixedDiscountForm({
  onBack,
  onSuccess,
  coupon,
}: FixedDiscountFormProps) {
  const selectedChannel = useAppSelector(
    (state) => state.channel.selectedChannel
  );
  const storeId = getStoreId();
  const channelId = selectedChannel?.id || null;
  const isEditMode = !!coupon;

  const [points, setPoints] = useState<string>("");
  const [expireCoupon, setExpireCoupon] = useState<string>("");
  const [maxPointsEnabled, setMaxPointsEnabled] = useState<boolean>(false); // OFF by default
  const [maxPoints, setMaxPoints] = useState<string>("1");
  const [selectedTiers, setSelectedTiers] = useState<Array<{
    status: boolean;
    name: string;
    tierId: string;
    tierIndex: number;
  }>>([]);
  const [customerRestrictionEnabled, setCustomerRestrictionEnabled] = useState<boolean>(true); // true = disabled (no restriction)
  const [loading, setLoading] = useState(false);

  // Validation errors
  const [errors, setErrors] = useState<{
    points?: string;
    expireCoupon?: string;
    maxPoints?: string;
  }>({});

  // Load coupon data when editing, or reset form when creating new
  useEffect(() => {
    if (coupon && coupon.coupon) {
      // Pre-populate form fields with existing coupon data
      setPoints(coupon.coupon.value?.toString() || "");
      
      // Handle expiry - convert days to string if hasExpiry is true
      if (coupon.coupon.hasExpiry && coupon.coupon.expire) {
        setExpireCoupon(coupon.coupon.expire.toString());
      } else {
        setExpireCoupon("");
      }

      // Handle maximum points redeemable
      if (coupon.coupon.restriction?.maxReduption) {
        const maxRedemption = coupon.coupon.restriction.maxReduption;
        setMaxPointsEnabled(maxRedemption.status || false);
        if (maxRedemption.status && maxRedemption.value) {
          setMaxPoints(maxRedemption.value.toString());
        }
      } else {
        setMaxPointsEnabled(false);
        setMaxPoints("1");
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
      setPoints("");
      setExpireCoupon("");
      setMaxPointsEnabled(false); // OFF by default
      setMaxPoints("1");
      setCustomerRestrictionEnabled(true);
      setSelectedTiers([]);
    }
  }, [coupon]);

  // Handler to prevent decimal input and enforce max values
  const handlePointsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Remove any decimal points and non-numeric characters except empty string
    let wholeNumber = value.replace(/[^\d]/g, '');
    
    // Enforce maximum value of 100000
    if (wholeNumber && parseInt(wholeNumber) > 100000) {
      wholeNumber = '100000';
    }
    
    setPoints(wholeNumber);
    
    // Clear error if value is now valid
    if (errors.points && wholeNumber) {
      const num = parseInt(wholeNumber);
      if (!isNaN(num) && num >= 1 && num <= 100000) {
        setErrors(prev => ({ ...prev, points: undefined }));
      }
    }
  };

  const handleExpireCouponChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Remove any decimal points and non-numeric characters except empty string
    let wholeNumber = value.replace(/[^\d]/g, '');
    
    // Enforce maximum value of 365
    if (wholeNumber && parseInt(wholeNumber) > 365) {
      wholeNumber = '365';
    }
    
    setExpireCoupon(wholeNumber);
    
    // Clear error if value is now valid
    if (errors.expireCoupon && wholeNumber) {
      const num = parseInt(wholeNumber);
      if (!isNaN(num) && num >= 1 && num <= 365) {
        setErrors(prev => ({ ...prev, expireCoupon: undefined }));
      }
    }
  };

  const handleMaxPointsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Remove any decimal points and non-numeric characters except empty string
    let wholeNumber = value.replace(/[^\d]/g, '');
    
    // Enforce maximum value of 100000
    if (wholeNumber && parseInt(wholeNumber) > 100000) {
      wholeNumber = '100000';
    }
    
    setMaxPoints(wholeNumber);
    
    // Clear error if value is now valid
    if (errors.maxPoints && wholeNumber) {
      const num = parseInt(wholeNumber);
      if (!isNaN(num) && num >= 1 && num <= 100000) {
        setErrors(prev => ({ ...prev, maxPoints: undefined }));
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    // Validate points (1-100,000) - only whole numbers
    const pointsNum = parseInt(points);
    if (!points || isNaN(pointsNum) || pointsNum < 1 || pointsNum > 100000) {
      newErrors.points = "Points must be between 1 and 1,00,000 (whole numbers only)";
    }

    // Validate expireCoupon (optional, but if provided must be 1-365) - only whole numbers
    if (expireCoupon.trim() !== "") {
      const expireNum = parseInt(expireCoupon);
      if (isNaN(expireNum) || expireNum < 1 || expireNum > 365) {
        newErrors.expireCoupon = "Expiry days must be between 1 and 365 (whole numbers only)";
      }
    }

    // Validate maxPoints if enabled
    if (maxPointsEnabled) {
      const maxPointsNum = parseInt(maxPoints);
      if (!maxPoints || isNaN(maxPointsNum) || maxPointsNum < 1 || maxPointsNum > 100000) {
        newErrors.maxPoints = "Maximum points must be between 1 and 1,00,000 (whole numbers only)";
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

      // Prepare coupon data for fixed discount (storeCredit)
      const couponData: CreateRedeemCouponData = {
        redeemType: "storeCredit",
        target_type: "line_item",
        pointValue: parseInt(points),
        discountAmount: 1, // Fixed discount is always ₹1
        expire: expireCoupon.trim() === "" ? null : expireCoupon.trim(),
        selectedItems: [],
        selectedCollections: [],
        seletedCust: {
          tier: validatedTiers,
          tag: [],
        },
        seletedCustDisable: customerRestrictionEnabled, // true = disabled (no restriction)
        seletedProductDisable: true, // No product restriction for fixed discount
        currentRestrictionType: "product",
        onlineStoreDashBoardDisable: false,
        redemptionLimitDisable: !maxPointsEnabled, // false = enabled, true = disabled
        redemptionLimit: maxPointsEnabled ? parseInt(maxPoints) : 0,
        minimumnPurchaseAmountDisable: true,
      };

      let result;
      if (isEditMode && coupon?._id) {
        // Update existing coupon
        result = await updateRedeemCoupon(coupon._id, storeId, channelId, couponData);
        
        if (result.success) {
          addToast({
            title: "Success",
            description: "Fixed discount coupon updated successfully",
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
            description: "Fixed discount coupon created successfully",
            color: "success",
          });
          
          // Reset form
          setPoints("");
          setExpireCoupon("");
          setMaxPointsEnabled(true);
          setMaxPoints("1");
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
      console.error("Error creating fixed discount coupon:", error);
      addToast({
        title: "Error",
        description: error.message || "Failed to create fixed discount coupon",
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
            {isEditMode ? "Edit Fixed Discount Coupon" : "Create Fixed Discount Coupon"}
          </h2>
        </div>

        <div className="p-4 grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 text-[13px] text-gray-700">
              Discount Amount
            </label>
            <input
              type="text"
              disabled
              value="₹ 1"
              className="w-full h-8 border border-[#8a8a8a] rounded-lg px-3 text-[13px] leading-none focus:outline-none bg-[#fdfdfd]"
            />
          </div>

          <div>
            <label className="block mb-1 text-[13px] text-gray-700">
              Enter Points
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={points}
              onChange={handlePointsChange}
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
                if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                  e.preventDefault();
                }
              }}
              onBlur={() => {
                // Validate on blur
                if (points) {
                  const num = parseInt(points);
                  if (isNaN(num) || num < 1 || num > 100000) {
                    setErrors(prev => ({ ...prev, points: "Points must be between 1 and 1,00,000 (whole numbers only)" }));
                  }
                }
              }}
              placeholder="Enter a value between 1 and 100000"
              className={`w-full h-8 border rounded-lg px-3 text-[13px] leading-none focus:outline-none bg-[#fdfdfd] ${
                errors.points ? "border-red-500" : "border-[#8a8a8a]"
              }`}
            />
            {errors.points ? (
              <p className="text-xs text-red-500 mt-1">{errors.points}</p>
            ) : (
              <p className="text-xs text-gray-500 mt-1">
                Please enter the number of points required for every INR 1 discount.
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
                if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                  e.preventDefault();
                }
              }}
              onBlur={() => {
                // Validate on blur
                if (expireCoupon.trim()) {
                  const num = parseInt(expireCoupon);
                  if (isNaN(num) || num < 1 || num > 365) {
                    setErrors(prev => ({ ...prev, expireCoupon: "Expiry days must be between 1 and 365 (whole numbers only)" }));
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

      {/* Bottom Section: Maximum Points Redeemable */}
      <div className="card !p-0">
        <div className="flex justify-between items-center gap-6 p-4 border-b border-[#DEDEDE]">
          <span className="text-base font-bold">
            Maximum Points Redeemable at One Time
          </span>
          <Switch
            aria-label="Maximum Points Redeemable at One Time"
            size="sm"
            color="success"
            isSelected={maxPointsEnabled}
            onValueChange={setMaxPointsEnabled}
          />
        </div>

        {maxPointsEnabled && (
          <div className="p-4 flex flex-col gap-4">
            <div>
              <label className="block mb-1 text-[13px] text-gray-700">
                Maximum points (minimum: 1)
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={maxPoints}
                onChange={handleMaxPointsChange}
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
                  if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                    e.preventDefault();
                  }
                }}
                onBlur={() => {
                  // Validate on blur
                  if (maxPointsEnabled && maxPoints) {
                    const num = parseInt(maxPoints);
                    if (isNaN(num) || num < 1 || num > 100000) {
                      setErrors(prev => ({ ...prev, maxPoints: "Maximum points must be between 1 and 1,00,000 (whole numbers only)" }));
                    }
                  }
                }}
                placeholder="Minimum: 1"
                className={`w-full h-8 border rounded-lg px-3 text-[13px] leading-none focus:outline-none bg-[#fdfdfd] ${
                  errors.maxPoints ? "border-red-500" : "border-[#8a8a8a]"
                }`}
              />
              {errors.maxPoints ? (
                <p className="text-xs text-red-500 mt-1">{errors.maxPoints}</p>
              ) : (
                <p className="text-xs text-gray-500 mt-1">
                  Enter a value between 1 and 100000.
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

