import { useState } from "react";
import type { RedeemCoupon } from "@/utils/api";
import { Switch } from "@heroui/switch";
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
import type { Selection } from "@heroui/react";
import DeleteCouponModal from "./DeleteCouponModal";

interface WaysRedeemTableProps {
  coupons: RedeemCoupon[];
  onToggleCoupon?: (couponId: string, active: boolean) => void;
  onDeleteCoupon?: (couponId: string) => void;
  onEditCoupon?: (coupon: RedeemCoupon) => void;
  selectedKeys?: Selection;
  onSelectionChange?: (keys: Selection) => void;
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
const getCouponDisplayName = (coupon: RedeemCoupon): string => {
  if (coupon.coupon?.name) {
    return coupon.coupon.name;
  }
  if (coupon.coupon?.discountAmount) {
    return `$${coupon.coupon.discountAmount} off`;
  }
  if (coupon.coupon?.value) {
    return `${coupon.coupon.value}% off`;
  }
  return formatRedeemType(coupon.redeemType);
};

// Helper function to calculate expiry days
const getExpiryDays = (coupon: RedeemCoupon): string | null => {
  if (!coupon.coupon?.hasExpiry || !coupon.coupon?.expire) {
    return null;
  }

  try {
    const expireDate = new Date(coupon.coupon.expire);
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
  } catch (error) {
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
}: WaysRedeemTableProps) {
  // Filter out coupons that don't have coupon data
  const validCoupons = coupons.filter((coupon) => coupon.coupon);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleToggleCoupon = (couponId: string | undefined, currentStatus: boolean) => {
    if (!couponId) {
      return;
    }

    const newStatus = !currentStatus;
    
    // Update local state immediately
    if (onToggleCoupon) {
      onToggleCoupon(couponId, newStatus);
    }
  };

  const handleDeleteClick = (coupon: RedeemCoupon) => {
    if (!coupon._id) return;
    
    const couponName = coupon.coupon?.name || 
                      (coupon.coupon?.discountAmount ? `$${coupon.coupon.discountAmount} off` : 
                      coupon.coupon?.value ? `${coupon.coupon.value}% off` : 
                      "this coupon");
    
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
        selectionMode="multiple"
        selectedKeys={selectedKeys}
        onSelectionChange={onSelectionChange}
        color="default"
        classNames={{
          th: "bg-[#F7F7F7] text-xs font-normal text-[#616161] px-3 py-2",
          td: "text-xs text-[#303030] px-3 py-2 border-t border-[#E3E3E3]",
          base: "max-h-[220px] overflow-y-auto",
        }}
      >
        <TableHeader>
          <TableColumn className="!rounded-bl-none pl-3">Coupons</TableColumn>
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
          {validCoupons.map((coupon) => {
            const couponName = getCouponDisplayName(coupon);
            const redeemType = formatRedeemType(coupon.redeemType);
            const points = coupon.coupon?.value || 0;
            const expiryDays = getExpiryDays(coupon);
            const isActive = coupon.coupon?.active || false;
            const iconPath = getRedeemTypeIcon(coupon.redeemType);

            const rowKey = coupon._id || coupon.coupon?.price_rule_id || `coupon-${Math.random()}`;
            
            return (
              <TableRow key={rowKey}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="border border-[#DEDEDE] rounded-lg p-2 w-10 h-10 max-w-10 max-h-10 flex items-center justify-center">
                      <Image
                        src={iconPath}
                        width={24}
                        height={24}
                        alt={redeemType}
                        priority
                      />
                    </div>
                    <span className="font-bold">{couponName}</span>
                  </div>
                </TableCell>

                <TableCell>
                  <span className="font-bold">{points} Points</span>
                </TableCell>

                <TableCell>{redeemType}</TableCell>

                <TableCell>
                  {expiryDays ? (
                    <span className="font-bold">{expiryDays}</span>
                  ) : (
                    <span className="text-gray-400">No expiry</span>
                  )}
                </TableCell>

                <TableCell>
                  <div className="flex justify-end items-center gap-3">
                    <Switch
                      isSelected={isActive}
                      size="sm"
                      classNames={{
                        wrapper: "group-data-[selected=true]:bg-green-500",
                      }}
                      onValueChange={() => {
                        handleToggleCoupon(coupon._id, isActive);
                      }}
                    />
                    <Tooltip showArrow={true} closeDelay={0} content="Edit">
                      <button
                        className="bg-gray-700 rounded-lg p-1.5 hover:bg-gray-800 transition-colors"
                        onClick={() => {
                          if (onEditCoupon) {
                            onEditCoupon(coupon);
                          }
                        }}
                      >
                        <SquarePen
                          size={14}
                          className="text-white cursor-pointer"
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
