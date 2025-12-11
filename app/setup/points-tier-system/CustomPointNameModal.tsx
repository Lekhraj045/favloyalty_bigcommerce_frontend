"use client";

import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/modal";
import { useEffect, useState } from "react";

interface CustomPointNameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  initialValue?: string;
  validationError?: string;
}

export default function CustomPointNameModal({
  isOpen,
  onClose,
  onSave,
  initialValue = "",
  validationError,
}: CustomPointNameModalProps) {
  const [inputValue, setInputValue] = useState<string>(initialValue);
  const [hasExistingCustomName, setHasExistingCustomName] =
    useState<boolean>(false);
  const [localError, setLocalError] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (isOpen) {
      setInputValue(initialValue);
      setHasExistingCustomName(initialValue.length > 0);
      setLocalError(undefined);
    }
  }, [isOpen, initialValue]);

  useEffect(() => {
    setLocalError(validationError);
  }, [validationError]);

  const handleInputChange = (value: string) => {
    const sanitized = value.replace(/[^a-zA-Z0-9 ]/g, "").slice(0, 30);
    setInputValue(sanitized);
    if (sanitized.trim().length > 0) {
      setLocalError(undefined);
    }
  };

  const handleSave = () => {
    if (!inputValue || inputValue.trim() === "") {
      setLocalError("Custom point name is required");
      return;
    }
    setLocalError(undefined);
    onSave(inputValue.trim());
  };

  const handleClose = () => {
    setInputValue("");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="md"
      placement="center"
      classNames={{
        base: "bg-white",
        header: "border-b border-[#DEDEDE]",
        body: "py-6",
        footer: "border-t border-[#DEDEDE]",
      }}
    >
      <ModalContent>
        {(onModalClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <h3 className="text-base font-bold">
                {hasExistingCustomName
                  ? "Edit Custom Point Name"
                  : "Enter Custom Point Name"}
              </h3>
            </ModalHeader>
            <ModalBody>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">
                  Enter Name
                </label>
                <Input
                  type="text"
                  value={inputValue}
                  onValueChange={handleInputChange}
                  placeholder="Enter Point Name Here (max 30 characters)"
                  maxLength={30}
                  classNames={{
                    input: "text-sm",
                    inputWrapper: "border-gray-300",
                  }}
                  errorMessage={localError}
                  isInvalid={!!localError}
                />
                <p className="text-xs text-gray-500">
                  {inputValue.length}/30 characters
                </p>
              </div>
            </ModalBody>
            <ModalFooter className="flex gap-3">
              <Button
                color="primary"
                variant="flat"
                onPress={handleClose}
                className="custom-btn-default flex-1"
              >
                Close
              </Button>
              <Button className="custom-btn flex-1" onPress={handleSave}>
                {hasExistingCustomName ? "Update" : "Save"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
