"use client";

import { useState, useEffect, useMemo } from "react";
import { Switch } from "@heroui/switch";
import { useAppSelector } from "@/store/hooks";
import { getStoreId, getPoints, type Tier } from "@/utils/api";
import { Crown } from "lucide-react";
import { generateObjectId, validateTierId } from "../utils/tierValidation";

interface CustomerTierSelectionProps {
  selectedTiers: Array<{
    status: boolean;
    name: string;
    tierId: string;
    tierIndex: number;
  }>;
  customerRestrictionEnabled: boolean; // false = enabled, true = disabled
  onTiersChange: (tiers: Array<{
    status: boolean;
    name: string;
    tierId: string;
    tierIndex: number;
  }>) => void;
  onRestrictionToggle: (enabled: boolean) => void; // enabled = false means restriction is ON
}

export default function CustomerTierSelection({
  selectedTiers,
  customerRestrictionEnabled,
  onTiersChange,
  onRestrictionToggle,
}: CustomerTierSelectionProps) {
  const selectedChannel = useAppSelector(
    (state) => state.channel.selectedChannel
  );
  const pointsData = useAppSelector((state) => state.points);
  const storeId = getStoreId();
  const channelId = selectedChannel?.id || null;
  
  // Check Redux first (synchronously) - no loading state if data is available
  const hasReduxData = pointsData.channelId === channelId;
  const isTierSystemEnabledFromRedux = hasReduxData && pointsData.tierStatus;
  const tiersFromRedux = hasReduxData && pointsData.tierStatus ? pointsData.tiers : [];
  
  const [tiers, setTiers] = useState<Tier[]>(tiersFromRedux);
  const [tierSystemEnabled, setTierSystemEnabled] = useState<boolean>(isTierSystemEnabledFromRedux);
  const [allSelected, setAllSelected] = useState(false);

  // Load tiers from Redux or API
  useEffect(() => {
    if (!storeId || !channelId) {
      setTierSystemEnabled(false);
      setTiers([]);
      return;
    }

    // If we have data in Redux for this channel, use it immediately
    if (hasReduxData) {
      if (pointsData.tierStatus && pointsData.tiers.length > 0) {
        setTiers(pointsData.tiers);
        setTierSystemEnabled(true);
      } else {
        // Tier system is disabled in Redux
        setTierSystemEnabled(false);
        setTiers([]);
      }
      return;
    }

    // If not in Redux, fetch from API silently (no loading state shown)
    const fetchTiers = async () => {
      try {
        const fetchedPointsData = await getPoints(storeId, channelId);
        
        if (fetchedPointsData && fetchedPointsData.tierStatus && fetchedPointsData.tier) {
          setTiers(fetchedPointsData.tier);
          setTierSystemEnabled(true);
        } else {
          // Tier system is disabled or no tiers configured
          setTierSystemEnabled(false);
          setTiers([]);
        }
      } catch (error) {
        console.error("Error fetching tiers:", error);
        setTierSystemEnabled(false);
        setTiers([]);
      }
    };

    fetchTiers();
  }, [storeId, channelId, hasReduxData, pointsData.channelId, pointsData.tierStatus, pointsData.tiers]);

  // Early return after hooks - don't show component if tier system is disabled
  // This prevents any rendering when tier system is off
  if (hasReduxData && !pointsData.tierStatus) {
    return null;
  }

  // Memoize tier names to use as stable dependency
  const tierNamesString = useMemo(() => {
    return tiers.map(t => t.tierName).sort().join(',');
  }, [tiers]);

  // Initialize selectedTiers when tiers are loaded (only if selectedTiers is empty or doesn't match)
  useEffect(() => {
    if (tiers.length === 0) return;
    
    const tierNames = tiers.map(t => t.tierName);
    const selectedTierNames = selectedTiers.map(st => st.name);
    
    // Check if we need to initialize or sync tiers
    const needsInit = selectedTiers.length === 0;
    const hasNewTiers = tierNames.some(name => !selectedTierNames.includes(name));
    const hasRemovedTiers = selectedTierNames.some(name => !tierNames.includes(name));
    
      // Only sync if we need to initialize or if tiers were added/removed
      // Don't sync if user is just selecting/deselecting existing tiers
      if (needsInit || hasNewTiers || hasRemovedTiers) {
        // Merge existing selections with new tiers, preserving status and tierId
        const syncedTiers = tiers.map((tier, index) => {
          const existingTier = selectedTiers.find(st => st.name === tier.tierName);
          if (existingTier) {
            // Preserve existing status and tierId, update tierIndex if needed
            // Ensure tierId is valid ObjectId format
            const validTierId = existingTier.tierId && /^[0-9a-fA-F]{24}$/.test(existingTier.tierId)
              ? existingTier.tierId
              : (tier._id || generateObjectId());
            return {
              ...existingTier,
              tierId: validTierId,
              tierIndex: index,
            };
          }
          // Create new entry with false status
          // Use tier._id if available, otherwise generate a new ObjectId
          const tierId = tier._id || generateObjectId();
          return {
            status: false,
            name: tier.tierName,
            tierId: tierId,
            tierIndex: index,
          };
        });
        onTiersChange(syncedTiers);
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tierNamesString]); // Only sync when tier names change, not when selectedTiers changes

  // Check if all tiers are selected
  useEffect(() => {
    if (selectedTiers.length > 0 && tiers.length > 0) {
      const allTiersSelected = tiers.every((tier) => {
        const selectedTier = selectedTiers.find(
          (st) => st.name === tier.tierName
        );
        return selectedTier?.status === true;
      });
      setAllSelected(allTiersSelected);
    } else {
      setAllSelected(false);
    }
  }, [selectedTiers, tiers]);

  const handleAllToggle = (checked: boolean) => {
    if (checked) {
      // Select all tiers
      const updatedTiers = tiers.map((tier, index) => {
        const tierId = tier._id || generateObjectId();
        return {
          status: true,
          name: tier.tierName,
          tierId: tierId,
          tierIndex: index,
        };
      });
      onTiersChange(updatedTiers);
    } else {
      // Deselect all tiers
      const updatedTiers = tiers.map((tier, index) => {
        const tierId = tier._id || generateObjectId();
        return {
          status: false,
          name: tier.tierName,
          tierId: tierId,
          tierIndex: index,
        };
      });
      onTiersChange(updatedTiers);
    }
  };

  const handleTierToggle = (tierName: string, checked: boolean) => {
    // Find the tier
    const tier = tiers.find(t => t.tierName === tierName);
    if (!tier) return; // Tier not found
    
    const tierIndex = tiers.findIndex(t => t.tierName === tierName);
    const defaultTierId = tier._id || generateObjectId();
    
    // Check if tier exists in selectedTiers
    const existingTierIndex = selectedTiers.findIndex(st => st.name === tierName);
    
    let updatedTiers;
    if (existingTierIndex !== -1) {
      // Update existing tier, preserve tierId if it exists and is valid
      updatedTiers = selectedTiers.map((t) => {
        if (t.name === tierName) {
          // Ensure tierId is valid ObjectId format
          const validTierId = t.tierId && /^[0-9a-fA-F]{24}$/.test(t.tierId)
            ? t.tierId
            : defaultTierId;
          return { ...t, status: checked, tierId: validTierId };
        }
        // Also validate other tiers' tierIds
        return {
          ...t,
          tierId: validateTierId(t.tierId),
        };
      });
    } else {
      // Add new tier if it doesn't exist
      const newTier = {
        status: checked,
        name: tierName,
        tierId: defaultTierId,
        tierIndex: tierIndex,
      };
      updatedTiers = [...selectedTiers.map(t => ({
        ...t,
        tierId: validateTierId(t.tierId),
      })), newTier];
    }
    
    onTiersChange(updatedTiers);
  };

  // Don't show component if tier system is disabled or no tiers available
  // Never show loading card - return null instead
  if (!tierSystemEnabled || tiers.length === 0) {
    return null;
  }

  return (
    <div className="card !p-0">
      <div className="flex justify-between items-center gap-6 p-4 border-b border-[#DEDEDE]">
        <span className="text-base font-bold">
          Allow direct discount for selected customers
        </span>
        <Switch
          aria-label="Allow direct discount for selected customers"
          size="sm"
          color="success"
          isSelected={!customerRestrictionEnabled}
          onValueChange={(value) => onRestrictionToggle(!value)}
        />
      </div>

      {!customerRestrictionEnabled && (
        <div className="p-4">
          <div className="card !bg-white rounded-lg border border-[#DEDEDE] p-4">
            <div className="flex items-center gap-2 mb-4">
              <Crown size={16} className="text-yellow-500" />
              <h3 className="text-sm font-bold">Set Criteria for Customers</h3>
            </div>

            <p className="text-sm text-gray-700 mb-4">
              Do you want to allow this coupon for specific customer tier?
            </p>

            <div className="flex flex-wrap gap-4">
              {/* All option */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => handleAllToggle(e.target.checked)}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <span className="text-sm text-gray-700">All</span>
              </label>

              {/* Individual tier options */}
              {tiers.map((tier) => {
                const selectedTier = selectedTiers.find(
                  (st) => st.name === tier.tierName
                );
                const isChecked = selectedTier?.status || false;

                return (
                  <label
                    key={tier.tierName}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) =>
                        handleTierToggle(tier.tierName, e.target.checked)
                      }
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700">
                      {tier.tierName}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

