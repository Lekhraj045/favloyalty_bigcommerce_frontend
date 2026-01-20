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

interface AdjustBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBalance?: number;
}

export default function AdjustBalanceModal({
  isOpen,
  onClose,
  currentBalance = 300,
}: AdjustBalanceModalProps) {
  const [pointBalance, setPointBalance] = useState<string>(currentBalance.toString());
  const [selectedReason, setSelectedReason] = useState<string>("adjustment-customer-service");

  const reasons = [
    { value: "adjustment-customer-service", label: "Adjustment for customer service purposes" },
    { value: "promotional-bonus", label: "Awarding promotional bonus points" },
    { value: "correction-error", label: "Correction of previous points error" },
    { value: "upgrading-tier", label: "Upgrading loyalty program tier" },
    { value: "other", label: "Other" },
  ];

  const handleSubmit = () => {
    // TODO: Implement adjust balance functionality
    console.log("Adjust balance:", { pointBalance, reason: selectedReason });
    handleClose();
  };

  const handleClose = () => {
    onClose();
    // Reset form
    setPointBalance(currentBalance.toString());
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
              <h2 className="text-sm font-bold">Adjust Balance</h2>
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                {/* Adjust Point Balance */}
                <div>
                  <label className="block mb-1 text-[13px] text-gray-700">
                    Adjust Point Balance
                  </label>
                  <input
                    type="text"
                    value={pointBalance}
                    onChange={(e) => setPointBalance(e.target.value)}
                    className="w-full h-8 border rounded-lg px-3 text-[13px] leading-none focus:outline-none bg-[#fdfdfd] border-[#8a8a8a]"
                    placeholder="Enter point balance"
                  />
                  <p className="text-xs text-[#616161] mt-1">
                    Enter a number between 0 and 1,000,000 (up to 2 decimal places)
                  </p>
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
                onPress={handleSubmit}
              >
                Adjust balance
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
