"use client";

import { Button } from "@heroui/button";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/modal";
import { Loader2 } from "lucide-react";

interface ResetSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

const RESET_ITEMS = [
  "Point Settings (tiers, point names, logos)",
  "Earn Settings (signup, purchase, events, etc.)",
  "Redeem Settings (all discount configurations)",
  "Design Settings (widget appearance, announcements)",
];

export default function ResetSettingsModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: ResetSettingsModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      placement="center"
      isDismissable={!isLoading}
      hideCloseButton={isLoading}
      classNames={{
        base: "bg-white rounded-xl",
        header: "border-b border-[#DEDEDE] px-6 pt-6 pb-4",
        body: "px-6 py-4",
        footer: "border-t border-[#DEDEDE] px-6 pb-6 pt-4",
      }}
    >
      <ModalContent>
        {(onModalClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <h2 className="text-lg font-bold">
                {isLoading ? "Resetting..." : "Reset Settings"}
              </h2>
            </ModalHeader>
            <ModalBody>
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-8 gap-4">
                  <Loader2
                    className="w-12 h-12 text-gray-600 animate-spin"
                    strokeWidth={2}
                  />
                  <p className="text-base font-medium text-gray-800 text-center">
                    Resetting all settings to default values...
                  </p>
                  <p className="text-sm text-gray-500 text-center">
                    This may take a few moments. Please don&apos;t close this
                    window.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <h3 className="text-base font-bold">Reset All Settings</h3>
                  <p className="text-sm text-gray-700">
                    This will reset all your loyalty program settings including:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-sm text-gray-700 ml-1">
                    {RESET_ITEMS.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <p className="text-sm font-medium text-red-600">
                    This action cannot be undone. Are you sure you want to
                    continue?
                  </p>
                </div>
              )}
            </ModalBody>
            <ModalFooter className="flex gap-3 justify-end">
              <Button
                className="custom-btn-default"
                onPress={onClose}
                isDisabled={isLoading}
              >
                {isLoading ? "Please wait..." : "Cancel"}
              </Button>
              <Button
                className="custom-btn danger-btn"
                onPress={onConfirm}
                isLoading={isLoading}
                isDisabled={isLoading}
              >
                {isLoading ? "Resetting..." : "Reset All Settings"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
