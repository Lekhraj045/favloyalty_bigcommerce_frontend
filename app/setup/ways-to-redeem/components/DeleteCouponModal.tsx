import { Button } from "@heroui/button";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/modal";

interface DeleteCouponModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  couponName?: string;
}

export default function DeleteCouponModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  couponName,
}: DeleteCouponModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      placement="center"
      isDismissable={!isLoading}
      hideCloseButton={isLoading}
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
              <h3 className="text-base font-bold">Delete Coupon</h3>
            </ModalHeader>
            <ModalBody>
              <p className="text-sm text-gray-700">
                Are you sure you want to delete this coupon
                {couponName ? ` "${couponName}"` : ""}? This action cannot be
                undone.
              </p>
            </ModalBody>
            <ModalFooter className="flex gap-3">
              <Button
                color="danger"
                variant="flat"
                onPress={onClose}
                className="custom-btn-default flex-1"
                isDisabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                color="danger"
                className="custom-btn flex-1"
                onPress={onConfirm}
                isLoading={isLoading}
              >
                Delete
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

