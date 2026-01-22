"use client";

import { useState, useEffect } from "react";
import { Button } from "@heroui/button";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/modal";
import { createTransaction, getStoreId, type CreateTransactionRequest } from "@/utils/api";

interface AdjustBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBalance?: number;
  customerId?: string;
  channelId?: number;
  onSuccess?: () => void;
}

export default function AdjustBalanceModal({
  isOpen,
  onClose,
  currentBalance = 0,
  customerId,
  channelId,
  onSuccess,
}: AdjustBalanceModalProps) {
  const [pointBalance, setPointBalance] = useState<string>(currentBalance.toString());
  const [selectedReason, setSelectedReason] = useState<string>("adjustment-customer-service");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update pointBalance when currentBalance changes
  useEffect(() => {
    if (isOpen) {
      setPointBalance(currentBalance.toString());
      setError(null);
    }
  }, [currentBalance, isOpen]);

  const reasons = [
    { value: "adjustment-customer-service", label: "Adjustment for customer service purposes" },
    { value: "promotional-bonus", label: "Awarding promotional bonus points" },
    { value: "correction-error", label: "Correction of previous points error" },
    { value: "upgrading-tier", label: "Upgrading loyalty program tier" },
    { value: "other", label: "Other" },
  ];

  const getReasonLabel = (value: string): string => {
    const reason = reasons.find((r) => r.value === value);
    return reason ? reason.label : value;
  };

  const handleSubmit = async () => {
    if (!customerId || !channelId) {
      setError("Customer ID or Channel ID is missing");
      return;
    }

    const storeId = getStoreId();
    if (!storeId) {
      setError("Store ID is missing");
      return;
    }

    // Validate input
    const newBalance = parseFloat(pointBalance);
    if (isNaN(newBalance)) {
      setError("Please enter a valid number");
      return;
    }

    if (newBalance < 0 || newBalance > 1000000) {
      setError("Point balance must be between 0 and 1,000,000");
      return;
    }

    // Calculate point difference
    const pointDifference = newBalance - currentBalance;

    // If no change, just close
    if (pointDifference === 0) {
      handleClose();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Determine transaction type based on point difference
      const transactionType: "adjustment" = "adjustment";
      
      // Create transaction request
      const transactionData: CreateTransactionRequest = {
        customerId,
        storeId,
        channelId,
        type: transactionType,
        transactionCategory: "manual",
        points: pointDifference, // Positive for increase, negative for decrease
        description: pointDifference > 0 
          ? `Points increased by ${pointDifference}` 
          : `Points decreased by ${Math.abs(pointDifference)}`,
        reason: getReasonLabel(selectedReason),
        status: "completed",
        source: "admin_panel",
      };

      await createTransaction(transactionData);

      // Call onSuccess callback to refresh customer data
      if (onSuccess) {
        // Small delay to ensure backend has processed the transaction
        setTimeout(() => {
          onSuccess();
        }, 500);
      }

      handleClose();
    } catch (err) {
      console.error("Error adjusting balance:", err);
      setError(err instanceof Error ? err.message : "Failed to adjust balance");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    // Reset form
    setPointBalance(currentBalance.toString());
    setSelectedReason("adjustment-customer-service");
    setError(null);
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
              <Button 
                className="custom-btn-default" 
                onPress={handleClose}
                isDisabled={loading}
              >
                Cancel
              </Button>
              <Button
                className="custom-btn"
                onPress={handleSubmit}
                isLoading={loading}
                isDisabled={loading || !pointBalance || pointBalance === currentBalance.toString()}
              >
                {loading ? "Adjusting..." : "Adjust balance"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
