import { useAppSelector } from "@/store/hooks";
import type { RedeemCoupon } from "@/utils/api";
import { Switch } from "@heroui/switch";
import type { Selection } from "@heroui/table";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/table";
import { Tooltip } from "@heroui/tooltip";
import { SquarePen, Trash2 } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { getCurrencyIcon } from "../../ways-to-earn/utils";
import DeleteCouponModal from "./DeleteCouponModal";

interface WaysRedeemTableProps {
  coupons: RedeemCoupon[];
  onToggleCoupon?: (couponId: string, active: boolean) => void;
  onDeleteCoupon?: (couponId: string) => void;
  onEditCoupon?: (coupon: RedeemCoupon) => void;
  selectedKeys?: Selection;
  onSelectionChange?: (keys: Selection) => void;
  isFreePlan?: boolean;
  onPremiumClick?: (featureName: string) => void;
}

// Helper function to get icon path based on redeem type
const getRedeemTypeIcon = (redeemType: string): string => {
  switch (redeemType) {
    case "purchase":
      return `${process.env.NEXT_PUBLIC_BASE_PATH}/images/percentage-discount.svg`;
    case "freeShipping":
      return `${process.env.NEXT_PUBLIC_BASE_PATH}/images/free-shipping.svg`;
    case "freeProduct":
      return `${process.env.NEXT_PUBLIC_BASE_PATH}/images/free-products.svg`;
    case "storeCredit":
      return `${process.env.NEXT_PUBLIC_BASE_PATH}/images/fixed-discount.svg`;
    default:
      return `${process.env.NEXT_PUBLIC_BASE_PATH}/images/percentage-discount.svg`;
  }
};

// Helper function to format redeem type name
const formatRedeemType = (redeemType: string): string => {
  switch (redeemType) {
    case "purchase":
      return "Percentage Discount";
    case "freeShipping":
      return "Free Shipping";
    case "freeProduct":
      return "Free Products";
    case "storeCredit":
      return "Fixed Discount";
    case "orderPoint":
      return "Order Points";
    default:
      return redeemType;
  }
};

// Helper function to format coupon name/description
const getCouponDisplayName = (
  coupon: RedeemCoupon,
  storeCurrency: string,
): string => {
  // For freeProduct, show the product name from selectedItems
  if (coupon.redeemType === "freeProduct") {
    const items = coupon.coupon?.restriction?.selectedItems?.items;
    if (items?.length) {
      return items[0].value;
    }
    if (coupon.coupon?.name) {
      return coupon.coupon.name;
    }
    return "Free Product";
  }
  // For freeShipping, always show "Free Shipping"
  if (coupon.redeemType === "freeShipping") {
    return "Free Shipping";
  }
  // Custom name if set
  if (coupon.coupon?.name) {
    return coupon.coupon.name;
  }
  // For storeCredit (fixed discount), use discountAmount with $
  if (coupon.redeemType === "storeCredit") {
    if (coupon.coupon?.discountAmount) {
      return `${getCurrencyIcon(storeCurrency)}${coupon.coupon.discountAmount} off`;
    }
    if (coupon.coupon?.value) {
      return `${getCurrencyIcon(storeCurrency)}${coupon.coupon.value} off`;
    }
    return "Fixed Discount";
  }
  // For purchase (percentage discount), use value with %
  if (coupon.redeemType === "purchase") {
    if (coupon.coupon?.discountAmount) {
      return `${coupon.coupon.discountAmount}% off`;
    }
    if (coupon.coupon?.value) {
      return `${coupon.coupon.value}% off`;
    }
    return "Percentage Discount";
  }
  return formatRedeemType(coupon.redeemType);
};

// Helper to get the first free product image URL
const getFreeProductImageUrl = (coupon: RedeemCoupon): string | null => {
  if (coupon.redeemType !== "freeProduct") return null;
  const items = coupon.coupon?.restriction?.selectedItems?.items;
  if (items?.length && items[0].imgUrl) {
    return items[0].imgUrl;
  }
  return null;
};

// Helper to get display points (for freeProduct use coupon.value or min of product points)
const getDisplayPoints = (coupon: RedeemCoupon): number => {
  const value = coupon.coupon?.value;
  if (coupon.redeemType === "freeProduct") {
    if (value != null && value > 0) return value;
    const items = coupon.coupon?.restriction?.selectedItems?.items;
    if (items?.length) {
      const points = items
        .map((i) => parseInt(String(i.pointRequired || "0"), 10))
        .filter((n) => !isNaN(n) && n > 0);
      if (points.length) return Math.min(...points);
    }
    return 0;
  }
  return value ?? 0;
};

// Helper function to get expiry days display
const getExpiryDays = (coupon: RedeemCoupon): string | null => {
  if (!coupon.coupon?.hasExpiry || !coupon.coupon?.expire) {
    return null;
  }

  try {
    const expire = coupon.coupon.expire;

    // If expire is a number or numeric string (days), display it directly
    const daysNum =
      typeof expire === "number" ? expire : parseInt(expire.toString());

    if (!isNaN(daysNum) && daysNum > 0) {
      // It's a number representing days
      if (daysNum === 1) {
        return "1 Day";
      }
      return `${daysNum} Days`;
    }

    // If it's not a number, try to parse it as a date
    const expireDate = new Date(expire);

    // Check if it's a valid date
    if (!isNaN(expireDate.getTime())) {
      const now = new Date();
      const diffTime = expireDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        return "Expired";
      }
      if (diffDays === 0) {
        return "Today";
      }
      if (diffDays === 1) {
        return "1 Day";
      }
      return `${diffDays} Days`;
    }

    // If we can't parse it, return null
    return null;
  } catch (error) {
    // If expire is a string number, try to display it
    const expireStr = coupon.coupon.expire?.toString();
    if (expireStr && /^\d+$/.test(expireStr)) {
      const days = parseInt(expireStr);
      if (days === 1) {
        return "1 Day";
      }
      return `${days} Days`;
    }
    return null;
  }
};

export default function WaysRedeemTable({
  coupons,
  onToggleCoupon,
  onDeleteCoupon,
  onEditCoupon,
  selectedKeys,
  onSelectionChange,
  isFreePlan = false,
  onPremiumClick,
}: WaysRedeemTableProps) {
  // Filter out coupons that don't have coupon data
  const validCoupons = coupons.filter((coupon) => coupon.coupon);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const storeCurrency = useAppSelector((state) => state.channel.storeCurrency);

  // Local selection (used when parent doesn't control `selectedKeys`)
  const [localSelectedKeys, setLocalSelectedKeys] = useState<Set<string>>(
    () => new Set(),
  );

  const isSelectionControlled = selectedKeys !== undefined;

  const getCouponRowKey = (coupon: RedeemCoupon, index: number): string =>
    String(
      coupon._id ||
        coupon.coupon?.price_rule_id ||
        coupon.coupon?.name ||
        `row-${index}`,
    );

  const rowKeys = validCoupons.map((coupon, index) =>
    getCouponRowKey(coupon, index),
  );

  const selectedSet = useMemo((): Set<string> => {
    if (!isSelectionControlled) return localSelectedKeys;

    const anyKeys = selectedKeys as any;
    if (anyKeys === "all") return new Set(rowKeys);
    if (anyKeys instanceof Set) return new Set(Array.from(anyKeys).map(String));
    if (Array.isArray(anyKeys)) return new Set(anyKeys.map(String));
    return anyKeys == null ? new Set() : new Set([String(anyKeys)]);
  }, [isSelectionControlled, localSelectedKeys, selectedKeys, rowKeys]);

  const toggleRowSelection = (rowKey: string) => {
    const next = new Set(selectedSet);
    if (next.has(rowKey)) next.delete(rowKey);
    else next.add(rowKey);

    if (!isSelectionControlled) setLocalSelectedKeys(next);
    onSelectionChange?.(next as unknown as Selection);
  };

  const selectedCount = rowKeys.reduce(
    (count, k) => count + (selectedSet.has(k) ? 1 : 0),
    0,
  );
  const allSelected = rowKeys.length > 0 && selectedCount === rowKeys.length;

  const toggleAllSelection = () => {
    const next = allSelected ? new Set<string>() : new Set(rowKeys);
    if (!isSelectionControlled) setLocalSelectedKeys(next);
    onSelectionChange?.(next as unknown as Selection);
  };

  // Helper function to check if coupon is fixed discount
  const isFixedDiscount = (redeemType: string): boolean => {
    return redeemType === "storeCredit";
  };

  // Helper function to check if coupon is premium (not fixed discount)
  const isPremiumCoupon = (redeemType: string): boolean => {
    return !isFixedDiscount(redeemType);
  };

  const handleToggleCoupon = (
    couponId: string | undefined,
    currentStatus: boolean,
    redeemType: string,
  ) => {
    if (!couponId) {
      return;
    }

    // Check if it's a premium coupon and user is on free plan
    if (isFreePlan && isPremiumCoupon(redeemType)) {
      const featureName = formatRedeemType(redeemType);
      if (onPremiumClick) {
        onPremiumClick(featureName);
      }
      return;
    }

    const newStatus = !currentStatus;

    // Update local state immediately
    if (onToggleCoupon) {
      onToggleCoupon(couponId, newStatus);
    }
  };

  const handleEditCoupon = (coupon: RedeemCoupon) => {
    // Check if it's a premium coupon and user is on free plan
    if (isFreePlan && isPremiumCoupon(coupon.redeemType)) {
      const featureName = formatRedeemType(coupon.redeemType);
      if (onPremiumClick) {
        onPremiumClick(featureName);
      }
      return;
    }

    // Allow editing if it's fixed discount or user is on premium plan
    if (onEditCoupon) {
      onEditCoupon(coupon);
    }
  };

  const handleDeleteClick = (coupon: RedeemCoupon) => {
    if (!coupon._id) return;

    const couponName =
      coupon.coupon?.name ||
      (coupon.coupon?.discountAmount
        ? `$${coupon.coupon.discountAmount} off`
        : coupon.coupon?.value
          ? `${coupon.coupon.value}% off`
          : "this coupon");

    setCouponToDelete({
      id: coupon._id,
      name: couponName,
    });
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!couponToDelete || !onDeleteCoupon) return;

    setDeleting(true);
    try {
      await onDeleteCoupon(couponToDelete.id);
      setDeleteModalOpen(false);
      setCouponToDelete(null);
    } catch (error) {
      // Error handling is done in parent component
      console.error("Error deleting coupon:", error);
    } finally {
      setDeleting(false);
    }
  };
  return (
    <div className="tierTable checkbox-table border border-[#DEDEDE] rounded-lg overflow-hidden">
      <Table
        aria-label="Ways to redeem table"
        shadow="none"
        removeWrapper
        color="default"
        classNames={{
          th: "bg-[#F7F7F7] text-xs font-normal text-[#616161] px-3 py-2",
          td: "text-xs text-[#303030] px-3 py-2 border-t border-[#E3E3E3]",
          base: "max-h-[360px] overflow-y-auto",
        }}
      >
        <TableHeader>
          <TableColumn className="!rounded-bl-none pl-3" align="center">
            <input
              type="checkbox"
              aria-label="Select all coupons"
              checked={allSelected}
              onChange={() => toggleAllSelection()}
              onClick={(e) => e.stopPropagation()}
              className="h-4 w-4 accent-green-600"
            />
          </TableColumn>
          <TableColumn>Coupons</TableColumn>
          <TableColumn>Points</TableColumn>
          <TableColumn>Type</TableColumn>
          <TableColumn>Expiry</TableColumn>
          <TableColumn className="!rounded-br-none" align="end">
            Actions
          </TableColumn>
        </TableHeader>

        <TableBody
          emptyContent={
            <div className="text-center py-8 text-gray-500">
              No redeem coupons available
            </div>
          }
        >
          {validCoupons.map((coupon, index) => {
            const couponName = getCouponDisplayName(coupon, storeCurrency);
            const redeemType = formatRedeemType(coupon.redeemType);
            const points = getDisplayPoints(coupon);
            const expiryDays = getExpiryDays(coupon);
            const isActive = coupon.coupon?.active || false;
            const iconPath = getRedeemTypeIcon(coupon.redeemType);
            const freeProductImage = getFreeProductImageUrl(coupon);

            const rowKey =
              getCouponRowKey(coupon, index);

            const isPremium = isFreePlan && isPremiumCoupon(coupon.redeemType);
            const isFixed = isFixedDiscount(coupon.redeemType);

            return (
              <TableRow key={rowKey}>
                <TableCell>
                  <div className="flex items-center justify-center">
                    <input
                      type="checkbox"
                      aria-label={`Select ${couponName}`}
                      checked={selectedSet.has(String(rowKey))}
                      onChange={() => toggleRowSelection(String(rowKey))}
                      onClick={(e) => e.stopPropagation()}
                      className="h-4 w-4 accent-green-600"
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div
                      className={`border border-[#DEDEDE] rounded-lg overflow-hidden w-10 h-10 max-w-10 max-h-10 flex items-center justify-center relative ${
                        freeProductImage ? "" : "p-2"
                      } ${isPremium ? "opacity-60 blur-[0.5px]" : ""}`}
                    >
                      {freeProductImage ? (
                        <Image
                          src={freeProductImage}
                          width={40}
                          height={40}
                          alt={couponName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = iconPath;
                            (e.target as HTMLImageElement).className =
                              "w-6 h-6";
                          }}
                        />
                      ) : (
                        <Image
                          src={iconPath}
                          width={24}
                          height={24}
                          alt={redeemType}
                          priority
                        />
                      )}
                      {isPremium && (
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
                    </div>
                    <span
                      className={`font-bold truncate max-w-[150px] ${isPremium ? "opacity-60 blur-[0.5px]" : ""}`}
                      title={couponName}
                    >
                      {couponName}
                    </span>
                  </div>
                </TableCell>

                <TableCell>
                  <span
                    className={`font-bold ${isPremium ? "opacity-60 blur-[0.5px]" : ""}`}
                  >
                    {points} Points
                  </span>
                </TableCell>

                <TableCell>
                  <span className={isPremium ? "opacity-60 blur-[0.5px]" : ""}>
                    {redeemType}
                  </span>
                </TableCell>

                <TableCell>
                  {expiryDays ? (
                    <span
                      className={`font-bold ${isPremium ? "opacity-60 blur-[0.5px]" : ""}`}
                    >
                      {expiryDays}
                    </span>
                  ) : (
                    <span
                      className={`text-gray-400 ${isPremium ? "opacity-60 blur-[0.5px]" : ""}`}
                    >
                      No expiry
                    </span>
                  )}
                </TableCell>

                <TableCell>
                  <div className="flex justify-end items-center gap-3">
                    <div
                      onClick={(e) => {
                        if (isPremium) {
                          e.preventDefault();
                          e.stopPropagation();
                          const featureName = formatRedeemType(
                            coupon.redeemType,
                          );
                          if (onPremiumClick) {
                            onPremiumClick(featureName);
                          }
                        }
                      }}
                      className={isPremium ? "cursor-pointer" : ""}
                    >
                      <Switch
                        isSelected={isActive}
                        size="sm"
                        classNames={{
                          wrapper: "group-data-[selected=true]:bg-green-500",
                          base: isPremium
                            ? "opacity-50 cursor-not-allowed"
                            : "",
                        }}
                        onValueChange={() => {
                          handleToggleCoupon(
                            coupon._id,
                            isActive,
                            coupon.redeemType,
                          );
                        }}
                        isDisabled={isPremium}
                      />
                    </div>
                    <Tooltip showArrow={true} closeDelay={0} content="Edit">
                      <button
                        className={`rounded-lg p-1.5 transition-colors ${
                          isPremium
                            ? "bg-gray-300 cursor-not-allowed opacity-50"
                            : "bg-gray-700 hover:bg-gray-800"
                        }`}
                        onClick={() => handleEditCoupon(coupon)}
                        disabled={isPremium}
                      >
                        <SquarePen
                          size={14}
                          className={`${isPremium ? "text-gray-500" : "text-white cursor-pointer"}`}
                        />
                      </button>
                    </Tooltip>
                    <Tooltip showArrow={true} closeDelay={0} content="Delete">
                      <button
                        className="bg-red-100 rounded-lg p-1.5 hover:bg-red-200 transition-colors"
                        onClick={() => handleDeleteClick(coupon)}
                      >
                        <Trash2
                          size={14}
                          className="text-red-600 cursor-pointer"
                        />
                      </button>
                    </Tooltip>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Delete Confirmation Modal */}
      <DeleteCouponModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setCouponToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        isLoading={deleting}
        couponName={couponToDelete?.name}
      />
    </div>
  );
}
