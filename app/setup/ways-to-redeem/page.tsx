"use client";

import { useState } from "react";
import SetupHeader from "@/components/SetupHeader";
import SetupNavigation from "@/components/SetupNavigation";
import { Button } from "@heroui/button";
import { Trash2 } from "lucide-react";
import Image from "next/image";
import { toggleCouponStatus, deleteRedeemCoupon, type RedeemCoupon } from "@/utils/api";
import { addToast } from "@heroui/toast";
import type { Selection } from "@heroui/react";
import WaysModal from "./components/WaysRedeemModal";
import WaysRedeemTable from "./components/WaysRedeemTable";
import PercentageDiscountForm from "./components/PercentageDiscountForm";
import DeleteBulkCouponsModal from "./components/DeleteBulkCouponsModal";
import { useRedeemSettings } from "./hooks";

export default function WaysToRedeem() {
  const {
    redeemCoupons,
    originalCoupons,
    loading,
    refreshRedeemSettings,
    updateCouponStatusLocally,
    hasUnsavedChanges,
    resetToOriginal,
  } = useRedeemSettings();
  const [selectedForm, setSelectedForm] = useState<string | null>(null);
  const [editingCoupon, setEditingCoupon] = useState<RedeemCoupon | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set([]));
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const [deleteAllModalOpen, setDeleteAllModalOpen] = useState(false);
  const [deletingBulk, setDeletingBulk] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);

  // Filter coupons that have coupon data
  const validCoupons = redeemCoupons.filter((coupon) => coupon.coupon);
  const hasCoupons = validCoupons.length > 0;

  const handleSelectRedeemType = (type: string) => {
    setSelectedForm(type);
  };

  const handleBackToList = () => {
    setSelectedForm(null);
    setEditingCoupon(null);
  };

  const handleEditCoupon = (coupon: RedeemCoupon) => {
    // Determine form type based on coupon redeemType
    if (coupon.redeemType === "purchase") {
      setSelectedForm("percentage-discount");
      setEditingCoupon(coupon);
    } else {
      // Handle other coupon types if needed
      addToast({
        title: "Info",
        description: "Edit functionality for this coupon type is coming soon",
        color: "default",
      });
    }
  };

  const handleDeleteCoupon = async (couponId: string) => {
    try {
      await deleteRedeemCoupon(couponId);
      addToast({
        title: "Success",
        description: "Coupon deleted successfully",
        color: "success",
      });
      
      // Refresh the coupon list
      await refreshRedeemSettings();
    } catch (error: any) {
      console.error("Error deleting coupon:", error);
      addToast({
        title: "Error",
        description: error.message || "Failed to delete coupon",
        color: "danger",
      });
      throw error; // Re-throw so modal can handle it
    }
  };

  const handleBulkDeleteClick = () => {
    if (selectedKeys === "all" || (selectedKeys instanceof Set && selectedKeys.size > 0)) {
      setBulkDeleteModalOpen(true);
    }
  };

  const handleDeleteAllClick = () => {
    if (hasCoupons) {
      setDeleteAllModalOpen(true);
    }
  };

  const handleDeleteAllConfirm = async () => {
    const allCouponIds = validCoupons
      .map((coupon) => coupon._id)
      .filter((id): id is string => !!id);
    
    if (allCouponIds.length === 0) {
      setDeleteAllModalOpen(false);
      return;
    }

    setDeletingAll(true);
    try {
      const deletePromises = allCouponIds.map((id) => deleteRedeemCoupon(id));
      await Promise.all(deletePromises);
      
      addToast({
        title: "Success",
        description: `All ${allCouponIds.length} coupon(s) deleted successfully`,
        color: "success",
      });
      
      setSelectedKeys(new Set([]));
      await refreshRedeemSettings();
    } catch (error: any) {
      console.error("Error deleting all coupons:", error);
      addToast({
        title: "Error",
        description: error.message || "Failed to delete some coupons",
        color: "danger",
      });
    } finally {
      setDeletingAll(false);
      setDeleteAllModalOpen(false);
    }
  };

  const handleBulkDeleteConfirm = async () => {
    if (!selectedKeys || selectedKeys === "all") {
      // If "all" is selected, delete all coupons
      const allCouponIds = validCoupons
        .map((coupon) => coupon._id)
        .filter((id): id is string => !!id);
      
      if (allCouponIds.length === 0) {
        setBulkDeleteModalOpen(false);
        return;
      }

      setDeletingBulk(true);
      try {
        const deletePromises = allCouponIds.map((id) => deleteRedeemCoupon(id));
        await Promise.all(deletePromises);
        
        addToast({
          title: "Success",
          description: `All ${allCouponIds.length} coupon(s) deleted successfully`,
          color: "success",
        });
        
        setSelectedKeys(new Set([]));
        await refreshRedeemSettings();
      } catch (error: any) {
        console.error("Error deleting coupons:", error);
        addToast({
          title: "Error",
          description: error.message || "Failed to delete some coupons",
          color: "danger",
        });
      } finally {
        setDeletingBulk(false);
        setBulkDeleteModalOpen(false);
      }
    } else if (selectedKeys instanceof Set) {
      // Delete selected coupons
      const selectedCouponIds = Array.from(selectedKeys).filter(
        (id): id is string => typeof id === "string"
      );
      
      if (selectedCouponIds.length === 0) {
        setBulkDeleteModalOpen(false);
        return;
      }

      setDeletingBulk(true);
      try {
        const deletePromises = selectedCouponIds.map((id) => deleteRedeemCoupon(id));
        await Promise.all(deletePromises);
        
        addToast({
          title: "Success",
          description: `${selectedCouponIds.length} coupon(s) deleted successfully`,
          color: "success",
        });
        
        setSelectedKeys(new Set([]));
        await refreshRedeemSettings();
      } catch (error: any) {
        console.error("Error deleting coupons:", error);
        addToast({
          title: "Error",
          description: error.message || "Failed to delete some coupons",
          color: "danger",
        });
      } finally {
        setDeletingBulk(false);
        setBulkDeleteModalOpen(false);
      }
    }
  };

  // Calculate selected count
  const selectedCount = selectedKeys === "all" 
    ? validCoupons.length 
    : selectedKeys instanceof Set 
      ? selectedKeys.size 
      : 0;

  const handleSave = async () => {
    if (!hasUnsavedChanges) {
      addToast({
        title: "Info",
        description: "No changes to save",
        color: "default",
      });
      return;
    }

    setSaving(true);

    try {
      // Find coupons that have changed status
      const changedCoupons = redeemCoupons.filter((coupon) => {
        if (!coupon._id || !coupon.coupon) return false;
        
        const originalCoupon = originalCoupons.find((oc) => oc._id === coupon._id);
        if (!originalCoupon || !originalCoupon.coupon) return false;
        
        // Check if active status changed
        return coupon.coupon.active !== originalCoupon.coupon.active;
      });

      if (changedCoupons.length === 0) {
        addToast({
          title: "Info",
          description: "No changes to save",
          color: "default",
        });
        setSaving(false);
        return;
      }

      // Save only changed coupons
      const savePromises = changedCoupons.map(async (coupon) => {
        return toggleCouponStatus(coupon._id!, coupon.coupon!.active || false);
      });

      await Promise.all(savePromises);

      addToast({
        title: "Success",
        description: `${changedCoupons.length} coupon(s) saved successfully`,
        color: "success",
      });

      // Refresh to get latest state from server
      await refreshRedeemSettings();
    } catch (error: any) {
      console.error("Error saving coupon settings:", error);
      addToast({
        title: "Error",
        description: error.message || "Failed to save coupon settings",
        color: "danger",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col gap-4">
        <div className="head">
          <SetupHeader />
          <SetupNavigation />
        </div>

        {selectedForm === "percentage-discount" ? (
          <PercentageDiscountForm
            onBack={handleBackToList}
            coupon={editingCoupon}
            onSuccess={() => {
              handleBackToList();
              // Refresh redeem coupons
              refreshRedeemSettings();
            }}
          />
        ) : (
          <>
            <div className="flex flex-col gap-4">
              <div className="card !p-0">
                <div className="flex justify-between items-center gap-6 p-4 border-b border-[#DEDEDE]">
                  <div className="flex flex-col gap-1">
                    <h2 className="text-base font-bold">Ways to Redeem</h2>
                  </div>

                  <div className="flex gap-4">
                    {hasCoupons && selectedCount > 0 && (
                      <Button 
                        className="custom-btn-default"
                        onClick={handleBulkDeleteClick}
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Selected ({selectedCount})
                      </Button>
                    )}
                    {hasCoupons && (
                      <Button 
                        className="custom-btn-default"
                        onClick={handleDeleteAllClick}
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete All
                      </Button>
                    )}
                    <WaysModal onSelectRedeemType={handleSelectRedeemType} />
                  </div>
                </div>

                <div className="p-4">
                  {loading ? (
                    <div className="flex flex-col gap-4 justify-center items-center py-8">
                      <div className="text-sm text-gray-500">Loading...</div>
                    </div>
                  ) : hasCoupons ? (
                    <WaysRedeemTable
                      coupons={redeemCoupons}
                      onToggleCoupon={updateCouponStatusLocally}
                      onDeleteCoupon={handleDeleteCoupon}
                      onEditCoupon={handleEditCoupon}
                      selectedKeys={selectedKeys}
                      onSelectionChange={setSelectedKeys}
                    />
                  ) : (
                    <div className="flex flex-col gap-4 justify-center items-center">
                      <div className="flex flex-col gap-4 items-center">
                        <Image
                          src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/redeam-gift-icon.svg`}
                          alt="FavLoyalty"
                          width={176}
                          height={174}
                          priority
                        />

                        <div className="flex flex-col gap-1 items-center">
                          <h3 className="text-base font-bold">
                            No redeem methods yet
                          </h3>
                          <p className="text-sm text-gray-500">
                            Let your customers use their points to claim rewards
                            such as discounts, free products, free shipping, and
                            other perks.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 justify-end mt-4">
              <Button
                color="primary"
                variant="flat"
                className="custom-btn-default"
                onClick={handleSave}
                isLoading={saving}
                disabled={!hasUnsavedChanges || saving}
              >
                Save
              </Button>
              <Button
                className="custom-btn"
                onClick={handleSave}
                isLoading={saving}
                disabled={!hasUnsavedChanges || saving}
              >
                Save & Next
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Bulk Delete Confirmation Modal */}
      <DeleteBulkCouponsModal
        isOpen={bulkDeleteModalOpen}
        onClose={() => setBulkDeleteModalOpen(false)}
        onConfirm={handleBulkDeleteConfirm}
        isLoading={deletingBulk}
        count={selectedCount}
      />

      {/* Delete All Confirmation Modal */}
      <DeleteBulkCouponsModal
        isOpen={deleteAllModalOpen}
        onClose={() => setDeleteAllModalOpen(false)}
        onConfirm={handleDeleteAllConfirm}
        isLoading={deletingAll}
        count={validCoupons.length}
      />
    </div>
  );
}
