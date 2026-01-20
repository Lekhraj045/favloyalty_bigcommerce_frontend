"use client";

import { useState } from "react";
import { Button } from "@heroui/button";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/modal";

interface AdjustTierModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier?: string;
}

export default function AdjustTierModal({
  isOpen,
  onClose,
  currentTier = "Silver",
}: AdjustTierModalProps) {
  const [selectedTier, setSelectedTier] = useState<string>(currentTier);
  const [selectedReason, setSelectedReason] = useState<string>("adjustment-customer-service");

  const tiers = [
    { value: "Silver", label: "Silver" },
    { value: "Gold", label: "Gold" },
    { value: "Platinum", label: "Platinum" },
  ];

  const reasons = [
    { value: "adjustment-customer-service", label: "Adjustment for customer service purposes" },
    { value: "promotional-bonus", label: "Awarding promotional bonus points" },
    { value: "correction-error", label: "Correction of previous points error" },
    { value: "upgrading-tier", label: "Upgrading loyalty program tier" },
    { value: "other", label: "Other" },
  ];



  const handleClose = () => {
    onClose();
    // Reset form
    setSelectedTier(currentTier);
    setSelectedReason("adjustment-customer-service");
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
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <h2 className="text-sm font-bold">Adjust Tier</h2>
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                {/* Select Tier to Adjust */}
                <div className="w-full custom-dropi relative">
                  <label className="block mb-1 text-[13px] text-gray-700">
                    Select Tier to Adjust
                  </label>
                  <select
                    value={selectedTier}
                    onChange={(e) => setSelectedTier(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {tiers.map((tier) => (
                      <option key={tier.value} value={tier.value}>
                        {tier.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Choose Reason to Change */}
                <div className="w-full custom-dropi relative">
                  <label className="block mb-1 text-[13px] text-gray-700">
                    Choose Reason to Change
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
              </div>
            </ModalBody>
            <ModalFooter>
              <Button className="custom-btn-default" onPress={handleClose}>
                Cancel
              </Button>
              <Button
                className="custom-btn"
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
