import { Button } from "@heroui/button";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/modal";

interface UnsavedChangesModalProps {
  isOpen: boolean;
  onSave: () => void;
  onDiscard: () => void;
  isLoading?: boolean;
}

export default function UnsavedChangesModal({
  isOpen,
  onSave,
  onDiscard,
  isLoading = false,
}: UnsavedChangesModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {}}
      size="md"
      placement="center"
      isDismissable={false}
      hideCloseButton={true}
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
              <h3 className="text-base font-bold">Unsaved Changes</h3>
            </ModalHeader>
            <ModalBody>
              <p className="text-sm text-gray-700">
                You have unsaved changes to your events. Do you want to save
                them before leaving this page?
              </p>
            </ModalBody>
            <ModalFooter className="flex gap-3">
              <Button
                color="danger"
                variant="flat"
                onPress={onDiscard}
                className="custom-btn-default flex-1"
              >
                Discard
              </Button>
              <Button
                className="custom-btn flex-1"
                onPress={onSave}
                isLoading={isLoading}
              >
                Save Changes
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

