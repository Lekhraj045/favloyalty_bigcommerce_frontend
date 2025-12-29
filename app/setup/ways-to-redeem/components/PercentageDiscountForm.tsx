"use client";

import { useState } from "react";
import { Button } from "@heroui/button";
import { Switch } from "@heroui/switch";
import { ArrowLeft } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { getStoreId } from "@/utils/api";
import { createRedeemCoupon, updateRedeemCoupon, type CreateRedeemCouponData, type RedeemCoupon } from "@/utils/api";
import { addToast } from "@heroui/toast";
import { useEffect } from "react";
import ProductTable from "../percentage-discount/components/ProductTable";

interface PercentageDiscountFormProps {
  onBack: () => void;
  onSuccess?: () => void;
  coupon?: RedeemCoupon | null; // Optional coupon data for edit mode
}

export default function PercentageDiscountForm({
  onBack,
  onSuccess,
  coupon,
}: PercentageDiscountFormProps) {
  const selectedChannel = useAppSelector(
    (state) => state.channel.selectedChannel
  );
  const storeId = getStoreId();
  const channelId = selectedChannel?.id || null;
  const isEditMode = !!coupon;

  // Form state
  const [pointValue, setPointValue] = useState<string>("");
  const [discountAmount, setDiscountAmount] = useState<string>("");
  const [expireCoupon, setExpireCoupon] = useState<string>("");
  const [allowCouponForProduct, setAllowCouponForProduct] = useState<boolean>(true); // true = OFF (no restriction)
  const [currentRestrictionType, setCurrentRestrictionType] = useState<"product" | "collection">("product");
  const [selectedItems, setSelectedItems] = useState<CreateRedeemCouponData["selectedItems"]>([]);
  const [selectedCollections, setSelectedCollections] = useState<CreateRedeemCouponData["selectedCollections"]>([]);
  const [loading, setLoading] = useState(false);

  // Load coupon data when editing, or reset form when creating new
  useEffect(() => {
    if (coupon && coupon.coupon) {
      // Pre-populate form fields with existing coupon data
      setPointValue(coupon.coupon.value?.toString() || "");
      setDiscountAmount(coupon.coupon.discountAmount?.toString() || "");
      
      // Handle expiry - convert days to string if hasExpiry is true
      if (coupon.coupon.hasExpiry && coupon.coupon.expire) {
        // expire might be a number (days) or string, convert to string
        setExpireCoupon(coupon.coupon.expire.toString());
      } else {
        setExpireCoupon("");
      }

      // Handle product/collection restrictions
      if (coupon.coupon.restriction) {
        // Check if product restriction is enabled
        const productRestrictionEnabled = coupon.coupon.restriction.selectedItems?.status || false;
        const collectionRestrictionEnabled = coupon.coupon.restriction.selectedCollections?.status || false;
        
        // Set restriction toggle (true = OFF, false = ON)
        setAllowCouponForProduct(!(productRestrictionEnabled || collectionRestrictionEnabled));
        
        // Set restriction type
        if (productRestrictionEnabled) {
          setCurrentRestrictionType("product");
        } else if (collectionRestrictionEnabled) {
          setCurrentRestrictionType("collection");
        }

        // Load selected items
        if (coupon.coupon.restriction.selectedItems?.items) {
          const items = coupon.coupon.restriction.selectedItems.items.map((item) => ({
            value: item.value,
            type: item.types,
            src: item.imgUrl,
            pointRequired: item.pointRequired,
            productUrl: item.itemUrl,
            ids: item.ids,
            price: item.price,
            variantId: item.variantId,
            productId: item.productId,
          }));
          setSelectedItems(items);
        }

        // Load selected collections
        if (coupon.coupon.restriction.selectedCollections?.collections) {
          const collections = coupon.coupon.restriction.selectedCollections.collections.map((col) => ({
            value: col.value,
            src: col.imgUrl,
            collectionUrl: col.collectionUrl,
            ids: col.ids,
            pointRequired: col.pointRequired,
          }));
          setSelectedCollections(collections);
        }
      } else {
        // No restrictions, reset to defaults
        setAllowCouponForProduct(true);
        setCurrentRestrictionType("product");
        setSelectedItems([]);
        setSelectedCollections([]);
      }
    } else {
      // Reset form when creating new coupon
      setPointValue("");
      setDiscountAmount("");
      setExpireCoupon("");
      setAllowCouponForProduct(true);
      setCurrentRestrictionType("product");
      setSelectedItems([]);
      setSelectedCollections([]);
    }
  }, [coupon]);

  // Validation errors
  const [errors, setErrors] = useState<{
    pointValue?: string;
    discountAmount?: string;
    expireCoupon?: string;
  }>({});

  // Handler to prevent decimal input and enforce max values
  const handlePointValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Remove any decimal points and non-numeric characters except empty string
    let wholeNumber = value.replace(/[^\d]/g, '');
    
    // Enforce maximum value of 100000
    if (wholeNumber && parseInt(wholeNumber) > 100000) {
      wholeNumber = '100000';
    }
    
    setPointValue(wholeNumber);
    
    // Clear error if value is now valid
    if (errors.pointValue && wholeNumber) {
      const num = parseInt(wholeNumber);
      if (!isNaN(num) && num >= 1 && num <= 100000) {
        setErrors(prev => ({ ...prev, pointValue: undefined }));
      }
    }
  };

  const handleDiscountAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Remove any decimal points and non-numeric characters except empty string
    let wholeNumber = value.replace(/[^\d]/g, '');
    
    // Enforce maximum value of 100
    if (wholeNumber && parseInt(wholeNumber) > 100) {
      wholeNumber = '100';
    }
    
    setDiscountAmount(wholeNumber);
    
    // Clear error if value is now valid
    if (errors.discountAmount && wholeNumber) {
      const num = parseInt(wholeNumber);
      if (!isNaN(num) && num >= 1 && num <= 100) {
        setErrors(prev => ({ ...prev, discountAmount: undefined }));
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

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    // Validate pointValue (1-100,000) - only whole numbers
    const pointValueNum = parseInt(pointValue);
    if (!pointValue || isNaN(pointValueNum) || pointValueNum < 1 || pointValueNum > 100000) {
      newErrors.pointValue = "Point value must be between 1 and 1,00,000 (whole numbers only)";
    }

    // Validate discountAmount (1-100) - only whole numbers
    const discountAmountNum = parseInt(discountAmount);
    if (!discountAmount || isNaN(discountAmountNum) || discountAmountNum < 1 || discountAmountNum > 100) {
      newErrors.discountAmount = "Discount amount must be between 1 and 100 (whole numbers only)";
    }

    // Validate expireCoupon (optional, but if provided must be 1-365) - only whole numbers
    if (expireCoupon.trim() !== "") {
      const expireNum = parseInt(expireCoupon);
      if (isNaN(expireNum) || expireNum < 1 || expireNum > 365) {
        newErrors.expireCoupon = "Expiry days must be between 1 and 365 (whole numbers only)";
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
      // Prepare coupon data according to migration report
      const couponData: CreateRedeemCouponData = {
        redeemType: "purchase",
        target_type: "line_item",
        pointValue: parseInt(pointValue),
        discountAmount: parseInt(discountAmount),
        expire: expireCoupon.trim() === "" ? null : expireCoupon.trim(),
        selectedItems: allowCouponForProduct ? [] : selectedItems,
        selectedCollections: allowCouponForProduct ? [] : selectedCollections,
        seletedCust: {
          tier: [],
          tag: [],
        },
        seletedCustDisable: true, // No customer restriction by default
        seletedProductDisable: allowCouponForProduct, // true = no restriction
        currentRestrictionType: currentRestrictionType,
        onlineStoreDashBoardDisable: false,
        redemptionLimitDisable: true,
        minimumnPurchaseAmountDisable: true,
      };

      let result;
      if (isEditMode && coupon?._id) {
        // Update existing coupon
        result = await updateRedeemCoupon(coupon._id, storeId, channelId, couponData);
        
        if (result.success) {
          addToast({
            title: "Success",
            description: "Percentage discount coupon updated successfully",
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
            description: "Percentage discount coupon created successfully",
            color: "success",
          });
          
          // Reset form
          setPointValue("");
          setDiscountAmount("");
          setExpireCoupon("");
          setAllowCouponForProduct(true);
          setSelectedItems([]);
          setSelectedCollections([]);
          
          // Call success callback or go back
          if (onSuccess) {
            onSuccess();
          } else {
            onBack();
          }
        }
      }
    } catch (error: any) {
      console.error("Error creating coupon:", error);
      addToast({
        title: "Error",
        description: error.message || "Failed to create coupon",
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
            {isEditMode ? "Edit Percentage Discount Coupon" : "Create Percentage Discount Coupon"}
          </h2>
        </div>

        <div className="p-4 flex flex-col gap-4">
          <div className="flex items-end gap-4">
            <div className="flex-1">
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
                  if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                    e.preventDefault();
                  }
                }}
                onBlur={() => {
                  // Validate on blur
                  if (pointValue) {
                    const num = parseInt(pointValue);
                    if (isNaN(num) || num < 1 || num > 100000) {
                      setErrors(prev => ({ ...prev, pointValue: "Point value must be between 1 and 1,00,000 (whole numbers only)" }));
                    }
                  }
                }}
                placeholder="Ex. 500"
                className={`w-full h-8 border rounded-lg px-3 text-[13px] leading-none focus:outline-none bg-[#fdfdfd] ${
                  errors.pointValue ? "border-red-500" : "border-[#8a8a8a]"
                }`}
              />
              {errors.pointValue && (
                <p className="text-xs text-red-500 mt-1">{errors.pointValue}</p>
              )}
            </div>
            <div className="text-base text-[#303030] pb-1.5">=</div>
            <div className="flex-1">
              <label className="block mb-1 text-[13px] text-gray-700">
                Select Discount Amount (in % value)
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={discountAmount}
                onChange={handleDiscountAmountChange}
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
                  if (discountAmount) {
                    const num = parseInt(discountAmount);
                    if (isNaN(num) || num < 1 || num > 100) {
                      setErrors(prev => ({ ...prev, discountAmount: "Discount amount must be between 1 and 100 (whole numbers only)" }));
                    }
                  }
                }}
                placeholder="Ex. 100"
                className={`w-full h-8 border rounded-lg px-3 text-[13px] leading-none focus:outline-none bg-[#fdfdfd] ${
                  errors.discountAmount ? "border-red-500" : "border-[#8a8a8a]"
                }`}
              />
              {errors.discountAmount && (
                <p className="text-xs text-red-500 mt-1">{errors.discountAmount}</p>
              )}
            </div>
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
              placeholder="Ex. 30 Days (leave empty for no expiry)"
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

      {/* Bottom Section: Product Selection */}
      <div className="card !p-0">
        <div className="flex justify-between items-center gap-6 p-4 border-b border-[#DEDEDE]">
          <span className="text-base font-bold">
            Allow discount for selected products
          </span>
          <Switch
            aria-label="Allow discount for selected products"
            size="sm"
            color="success"
            isSelected={!allowCouponForProduct}
            onValueChange={(value) => setAllowCouponForProduct(!value)}
          />
        </div>

        {!allowCouponForProduct && (
          <div className="p-4 flex flex-col gap-4">
            <h3 className="text-sm font-bold">Add Products/Collections</h3>

            <div className="flex gap-3">
              <div className="flex-1 max-w-[120px]">
                <div className="w-full custom-dropi dropi-withoutLabel relative">
                  <select
                    value={currentRestrictionType}
                    onChange={(e) => setCurrentRestrictionType(e.target.value as "product" | "collection")}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="product">Product</option>
                    <option value="collection">Collection</option>
                  </select>
                </div>
              </div>

              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search Products"
                  className="w-full h-8 border border-[#8a8a8a] rounded-lg px-3 text-[13px] leading-none focus:outline-none bg-[#fdfdfd]"
                />
              </div>
            </div>

            {/* Product Table */}
            <ProductTable />
          </div>
        )}
      </div>

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

