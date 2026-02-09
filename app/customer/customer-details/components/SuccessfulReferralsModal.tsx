"use client";

import { Button } from "@heroui/button";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/modal";
import CustomerReferralTableArea from "./CustomerReferralTable";

interface SuccessfulReferralsModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string;
}

export default function SuccessfulReferralsModal({
  isOpen,
  onClose,
  customerId,
}: SuccessfulReferralsModalProps) {
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
      onClose={onClose}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <h2 className="text-sm font-bold">Customer Referral Details</h2>
            </ModalHeader>
            <ModalBody>
              <CustomerReferralTableArea customerId={customerId} />
            </ModalBody>
            <ModalFooter>
              <Button className="custom-btn-default" onPress={onClose}>
                Close
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
