"use client";

import { updateCustomerTier } from "@/utils/api";
import { Button } from "@heroui/button";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/modal";
import { useEffect, useState } from "react";

interface TierOption {
  tierIndex: number;
  tierName: string;
}

interface AdjustTierModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string;
  currentTierIndex: number;
  currentTierDisplay?: string;
  tierOptions: { maxTierIndex: number; tiers: TierOption[] } | null;
  onSuccess: () => void;
}

export default function AdjustTierModal({
  isOpen,
  onClose,
  customerId,
  currentTierIndex,
  currentTierDisplay = "Silver",
  tierOptions,
  onSuccess,
}: AdjustTierModalProps) {
  // Only tiers higher than current (upgrade only)
  const upgradeableTiers =
    tierOptions?.tiers.filter((t) => t.tierIndex > currentTierIndex) ?? [];
  const defaultSelected =
    upgradeableTiers.length > 0
      ? upgradeableTiers[0].tierIndex
      : currentTierIndex;

  const [selectedTierIndex, setSelectedTierIndex] =
    useState<number>(defaultSelected);
  const [selectedReason, setSelectedReason] = useState<string>(
    "adjustment-customer-service",
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reasons = [
    {
      value: "adjustment-customer-service",
      label: "Adjustment for customer service purposes",
    },
    { value: "promotional-bonus", label: "Awarding promotional bonus points" },
    { value: "correction-error", label: "Correction of previous points error" },
    { value: "upgrading-tier", label: "Upgrading loyalty program tier" },
    { value: "other", label: "Other" },
  ];

  useEffect(() => {
    if (isOpen && upgradeableTiers.length > 0) {
      setSelectedTierIndex(upgradeableTiers[0].tierIndex);
      setError(null);
    }
  }, [isOpen, upgradeableTiers]);

  const handleClose = () => {
    onClose();
    setSelectedReason("adjustment-customer-service");
    setError(null);
    if (upgradeableTiers.length > 0) {
      setSelectedTierIndex(upgradeableTiers[0].tierIndex);
    }
  };

  const handleUpgrade = async () => {
    if (selectedTierIndex <= currentTierIndex) {
      setError("You can only upgrade to a higher tier.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await updateCustomerTier(customerId, selectedTierIndex);
      onSuccess();
      handleClose();
    } catch (err) {
      console.error("Error updating tier:", err);
      setError(err instanceof Error ? err.message : "Failed to update tier");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      size="2xl"
      classNames={{
        base: "bg-white",
        header: "border-b border-[#DEDEDE] bg-[#f3f3f3] p-4",
        body: "p-4",
        footer: "border-t border-[#DEDEDE]",
        closeButton: "top-3",
      }}
      isOpen={isOpen}
      onClose={handleClose}
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <h2 className="text-sm font-bold">Change Tier (Upgrade Only)</h2>
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <p className="text-[13px] text-gray-600">
                  Current tier: <strong>{currentTierDisplay}</strong>. You can
                  only upgrade to a higher tier.
                </p>
                {/* Select tier to upgrade to */}
                <div className="w-full custom-dropi relative">
                  <label className="block mb-1 text-[13px] text-gray-700">
                    Select new tier
                  </label>
                  <select
                    value={selectedTierIndex}
                    onChange={(e) =>
                      setSelectedTierIndex(Number(e.target.value))
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {upgradeableTiers.map((tier) => (
                      <option key={tier.tierIndex} value={tier.tierIndex}>
                        {tier.tierName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-full custom-dropi relative">
                  <label className="block mb-1 text-[13px] text-gray-700">
                    Reason for change
                  </label>
                  <select
                    value={selectedReason}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {reasons.map((reason) => (
                      <option key={reason.value} value={reason.value}>
                        {reason.label}
                      </option>
                    ))}
                  </select>
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                className="custom-btn-default"
                onPress={handleClose}
                isDisabled={submitting}
              >
                Cancel
              </Button>
              <Button
                className="custom-btn"
                onPress={handleUpgrade}
                isLoading={submitting}
                isDisabled={submitting || upgradeableTiers.length === 0}
              >
                Upgrade Tier
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
