"use client";

import { useAppSelector } from "@/store/hooks";
import type { BigCommerceProduct } from "@/utils/api";
import {
  createRedeemCoupon,
  getStoreId,
  updateRedeemCoupon,
  type CreateRedeemCouponData,
  type RedeemCoupon,
} from "@/utils/api";
import { Button } from "@heroui/button";
import { addToast } from "@heroui/toast";
import { ArrowLeft, Search } from "lucide-react";
import { useEffect, useState } from "react";
import FreeProductTable from "../free-product/components/FreeProductTable";
import { validateTiers } from "../utils/tierValidation";
import CustomerTierSelection from "./CustomerTierSelection";
import ProductSearchDropdown from "./ProductSearchDropdown";

interface FreeProductFormProps {
  onBack: () => void;
  onSuccess?: () => void;
  coupon?: RedeemCoupon | null; // Optional coupon data for edit mode
}

interface SelectedProduct extends BigCommerceProduct {
  pointRequired: string;
}

export default function FreeProductForm({
  onBack,
  onSuccess,
  coupon,
}: FreeProductFormProps) {
  const selectedChannel = useAppSelector(
    (state) => state.channel.selectedChannel
  );
  const storeId = getStoreId();
  const channelId = selectedChannel?.id || null;
  const isEditMode = !!coupon;

  const [expireCoupon, setExpireCoupon] = useState<string>("");
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>(
    []
  );
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
    expireCoupon?: string;
    products?: string;
  }>({});

  // Load coupon data when editing, or reset form when creating new
  useEffect(() => {
    if (coupon && coupon.coupon) {
      // Handle expiry - convert days to string if hasExpiry is true
      if (coupon.coupon.hasExpiry && coupon.coupon.expire) {
        setExpireCoupon(coupon.coupon.expire.toString());
      } else {
        setExpireCoupon("");
      }

      // Load selected products
      if (coupon.coupon.restriction?.selectedItems?.items) {
        const products = coupon.coupon.restriction.selectedItems.items.map(
          (item) => ({
            id: parseInt(item.ids || "0"),
            name: item.value,
            sku: "",
            price: item.price || "0.00",
            description: "",
            imageUrl: item.imgUrl,
            url: item.itemUrl || "",
            isVisible: true,
            type: "physical",
            pointRequired: item.pointRequired || "1",
          })
        );
        setSelectedProducts(products);
      } else {
        setSelectedProducts([]);
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
      setExpireCoupon("");
      setSelectedProducts([]);
      setCustomerRestrictionEnabled(true);
      setSelectedTiers([]);
    }
  }, [coupon]);

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

  const handleProductSelect = (product: BigCommerceProduct) => {
    // Add product with default point value of 1
    const newProduct: SelectedProduct = {
      ...product,
      pointRequired: "1",
    };
    setSelectedProducts([...selectedProducts, newProduct]);
  };

  const handleRemoveProduct = (index: number) => {
    const newProducts = [...selectedProducts];
    newProducts.splice(index, 1);
    setSelectedProducts(newProducts);
  };

  const handlePointRequiredChange = (index: number, value: string) => {
    const newProducts = [...selectedProducts];
    // Remove any decimal points and non-numeric characters except empty string
    let wholeNumber = value.replace(/[^\d]/g, "");

    // Enforce maximum value of 999999
    if (wholeNumber && parseInt(wholeNumber) > 999999) {
      wholeNumber = "999999";
    }

    newProducts[index].pointRequired = wholeNumber;
    setSelectedProducts(newProducts);
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    // Validate expireCoupon (optional, but if provided must be 1-365) - only whole numbers
    if (expireCoupon.trim() !== "") {
      const expireNum = parseInt(expireCoupon);
      if (isNaN(expireNum) || expireNum < 1 || expireNum > 365) {
        newErrors.expireCoupon =
          "Expiry days must be between 1 and 365 (whole numbers only)";
      }
    }

    // Validate that at least one product is selected
    if (selectedProducts.length === 0) {
      newErrors.products = "Please select at least one product";
    }

    // Validate point required for each product
    selectedProducts.forEach((product, index) => {
      const points = parseInt(product.pointRequired);
      if (
        !product.pointRequired ||
        isNaN(points) ||
        points < 1 ||
        points > 999999
      ) {
        newErrors.products = "All products must have valid points (1-999,999)";
      }
    });

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
      // Convert selected products to selectedItems format
      const selectedItems = selectedProducts.map((product) => ({
        value: product.name,
        type: "product",
        src: product.imageUrl || "",
        pointRequired: product.pointRequired,
        productUrl: product.url || "",
        ids: product.id.toString(),
        price: product.price || "0.00",
        variantId: "", // Variant ID not available from product list
        productId: product.id.toString(),
      }));

      // Validate and fix tierIds to ensure they're valid ObjectIds
      const validatedTiers = validateTiers(selectedTiers);

      // Prepare coupon data for free product (pointValue = min of product points for list/widget display)
      const pointRange = selectedProducts.length
        ? (() => {
            const points = selectedProducts
              .map((p) => parseInt(p.pointRequired, 10) || 0)
              .filter((p) => p > 0);
            return points.length
              ? { min: Math.min(...points), max: Math.max(...points) }
              : { min: 0, max: 0 };
          })()
        : { min: 0, max: 0 };

      const couponData: CreateRedeemCouponData = {
        redeemType: "freeProduct",
        target_type: "line_item",
        pointValue: pointRange.min || 0,
        expire: expireCoupon.trim() === "" ? null : expireCoupon.trim(),
        selectedItems: selectedItems,
        selectedCollections: [],
        seletedCust: {
          tier: validatedTiers,
          tag: [],
        },
        seletedCustDisable: customerRestrictionEnabled, // true = disabled (no restriction)
        seletedProductDisable: false, // Product restriction is enabled for free products
        currentRestrictionType: "product",
        onlineStoreDashBoardDisable: false,
        redemptionLimitDisable: true,
        minimumnPurchaseAmountDisable: true,
      };

      let result;
      if (isEditMode && coupon?._id) {
        // Update existing coupon
        result = await updateRedeemCoupon(
          coupon._id,
          storeId,
          channelId,
          couponData
        );

        if (result.success) {
          addToast({
            title: "Success",
            description: "Free product coupon updated successfully",
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
            description: "Free product coupon created successfully",
            color: "success",
          });

          // Reset form
          setExpireCoupon("");
          setSelectedProducts([]);
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
      console.error("Error creating free product coupon:", error);
      addToast({
        title: "Error",
        description: error.message || "Failed to create free product coupon",
        color: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate point range
  const calculatePointRange = () => {
    if (selectedProducts.length === 0) {
      return { min: 0, max: 0 };
    }
    const points = selectedProducts
      .map((p) => parseInt(p.pointRequired) || 0)
      .filter((p) => p > 0);
    if (points.length === 0) {
      return { min: 0, max: 0 };
    }
    return {
      min: Math.min(...points),
      max: Math.max(...points),
    };
  };

  const pointRange = calculatePointRange();

  return (
    <div className="flex flex-col gap-4">
      {/* Section 1: Coupon Details */}
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
              ? "Edit Free Product Coupon"
              : "Create Free Product Coupon"}
          </h2>
        </div>

        <div className="p-4">
          <h3 className="text-base font-bold mb-4">Coupon Details</h3>
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

      {/* Section 2: Eligible Free Products */}
      <div className="card !p-0">
        <div className="p-4 border-b border-[#DEDEDE]">
          <h3 className="text-base font-bold mb-1">Eligible Free Products</h3>
          <p className="text-sm text-gray-600">
            Select the products that customers can get for free with this
            coupon.
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Only products visible on the selected channel&apos;s storefront are
            shown.
          </p>
        </div>

        <div className="p-4 flex flex-col gap-4">
          <ProductSearchDropdown
            type="product"
            onSelectProduct={handleProductSelect}
            selectedProducts={selectedProducts.map((p) => ({
              id: p.id,
              name: p.name,
              sku: p.sku,
              price: p.price,
              description: p.description,
              imageUrl: p.imageUrl,
              url: p.url,
              isVisible: p.isVisible,
              type: p.type,
            }))}
          />

          {errors.products && (
            <p className="text-xs text-red-500">{errors.products}</p>
          )}

          {/* Empty State */}
          {selectedProducts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Search className="text-gray-400 w-8 h-8" />
              </div>
              <h4 className="text-base font-bold mb-1">No Products Yet</h4>
              <p className="text-sm text-gray-500">
                Use the search bar above to add products
              </p>
            </div>
          )}

          {/* Product Table */}
          {selectedProducts.length > 0 && (
            <FreeProductTable
              products={selectedProducts}
              onRemove={handleRemoveProduct}
              onPointRequiredChange={handlePointRequiredChange}
            />
          )}

          {/* Point Range Info */}
          {selectedProducts.length > 0 && (
            <div className="mt-auto pt-4 border-t border-[#DEDEDE]">
              <p className="text-sm text-gray-600">
                Point range for selected products:{" "}
                <span className="font-semibold">
                  {pointRange.min === pointRange.max
                    ? `${pointRange.min} points`
                    : `${pointRange.min} - ${pointRange.max} points`}
                </span>
              </p>
            </div>
          )}
        </div>
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
