import { Button } from "@heroui/button";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@heroui/modal";
import AnnouncementsUploadArea from "./AnnouncementsUpload";

export default function AnnouncementsModalArea() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  return (
    <>
      <Button className="custom-btn" onPress={onOpen}>
        Add Announcements
      </Button>
      <Modal
        size="xl"
        classNames={{
          base: "bg-white",
          header: "border-b border-[#DEDEDE] bg-[#f3f3f3] p-4",
          body: "p-0",
          footer: "border-t border-[#DEDEDE]",
          closeButton: "top-3",
        }}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h2 className="text-sm font-bold">Add Announcement</h2>
                <p className="text-xs text-[#616161] font-normal">
                  Recommended banner dimensions: 296 × 120 pixels (Maximum file
                  size: 2 MB)
                </p>
              </ModalHeader>

              <ModalBody>
                <div className="flex flex-col gap-4 p-4">
                  <AnnouncementsUploadArea />

                  <div className="">
                    <label className="block mb-1 text-[13px]">
                    Product Link for Image
                    </label>
                    <input
                      type="text"
                      className="w-full h-8 border border-[#8a8a8a] rounded-lg px-3 text-[13px] leading-none focus:outline-none bg-[#fdfdfd]"
                    />
                  </div>
                </div>
              </ModalBody>

              <ModalFooter>
                <Button className="custom-btn-default" onPress={onClose}>
                  Close
                </Button>
                <Button className="custom-btn" onPress={onClose}>
                  Add Announcement
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
