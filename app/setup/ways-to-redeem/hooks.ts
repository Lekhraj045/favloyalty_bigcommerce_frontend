import { useAppSelector } from "@/store/hooks";
import { getRedeemSettings, getStoreId, type RedeemCoupon } from "@/utils/api";
import { useEffect, useState } from "react";

/**
 * Hook for managing ways to redeem settings
 */
export function useRedeemSettings() {
  const selectedChannel = useAppSelector(
    (state) => state.channel.selectedChannel
  );
  const storeId = getStoreId();
  const channelId = selectedChannel?.id || null;

  // State for redeem coupons
  const [redeemCoupons, setRedeemCoupons] = useState<RedeemCoupon[]>([]);
  const [originalCoupons, setOriginalCoupons] = useState<RedeemCoupon[]>([]); // Store original state for comparison
  const [loading, setLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load redeem settings when page loads or channel changes
  useEffect(() => {
    const loadRedeemSettings = async () => {
      if (!storeId || !channelId) {
        setRedeemCoupons([]);
        return;
      }

      setLoading(true);
      try {
        const data = await getRedeemSettings(storeId, channelId);
        const couponsData = data || [];
        setRedeemCoupons(couponsData);
        setOriginalCoupons(JSON.parse(JSON.stringify(couponsData))); // Deep copy for comparison
        setHasUnsavedChanges(false);
      } catch (error: any) {
        console.error("Error loading redeem settings:", error);
        setRedeemCoupons([]);
        setOriginalCoupons([]);
        setHasUnsavedChanges(false);
      } finally {
        setLoading(false);
      }
    };

    loadRedeemSettings();
  }, [storeId, channelId, selectedChannel?.id]);

  // Function to refresh redeem settings
  const refreshRedeemSettings = async () => {
    if (!storeId || !channelId) {
      setRedeemCoupons([]);
      setOriginalCoupons([]);
      return;
    }

    setLoading(true);
    try {
      const data = await getRedeemSettings(storeId, channelId);
      const couponsData = data || [];
      setRedeemCoupons(couponsData);
      setOriginalCoupons(JSON.parse(JSON.stringify(couponsData)));
      setHasUnsavedChanges(false);
    } catch (error: any) {
      console.error("Error loading redeem settings:", error);
      setRedeemCoupons([]);
      setOriginalCoupons([]);
      setHasUnsavedChanges(false);
    } finally {
      setLoading(false);
    }
  };

  // Function to update coupon active status locally
  const updateCouponStatusLocally = (couponId: string, active: boolean) => {
    setRedeemCoupons((prevCoupons) =>
      prevCoupons.map((coupon) => {
        if (coupon._id === couponId && coupon.coupon) {
          return {
            ...coupon,
            coupon: {
              ...coupon.coupon,
              active,
            },
          };
        }
        return coupon;
      })
    );
  };

  // Track unsaved changes by comparing current state with original
  useEffect(() => {
    if (originalCoupons.length === 0) {
      setHasUnsavedChanges(false);
      return;
    }

    const hasChanges = redeemCoupons.some((coupon) => {
      if (!coupon._id || !coupon.coupon) return false;
      const original = originalCoupons.find((oc) => oc._id === coupon._id);
      if (!original || !original.coupon) return false;
      return coupon.coupon.active !== original.coupon.active;
    });

    setHasUnsavedChanges(hasChanges);
  }, [redeemCoupons, originalCoupons]);

  // Function to reset to original state
  const resetToOriginal = () => {
    setRedeemCoupons(JSON.parse(JSON.stringify(originalCoupons)));
    setHasUnsavedChanges(false);
  };

  return {
    // Store and channel info
    storeId,
    channelId,

    // Redeem coupons
    redeemCoupons,
    originalCoupons,
    loading,
    hasUnsavedChanges,

    // Setters
    setRedeemCoupons,
    refreshRedeemSettings,
    updateCouponStatusLocally,
    resetToOriginal,
    setHasUnsavedChanges,
  };
}
