import { Button } from "@heroui/button";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@heroui/modal";
import { useState, useEffect } from "react";
import { useWidgetCustomization } from "../context/WidgetCustomizationContext";
import AnnouncementsUploadArea from "./AnnouncementsUpload";

interface AnnouncementsModalAreaProps {
  editingIndex?: number | null;
  onCloseEdit?: () => void;
}

export default function AnnouncementsModalArea({
  editingIndex = null,
  onCloseEdit,
}: AnnouncementsModalAreaProps) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { addAnnouncement, updateAnnouncement, state } = useWidgetCustomization();
  const [link, setLink] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const isEditing = editingIndex !== null;
  const editingAnnouncement = isEditing ? state.announcements[editingIndex] : null;

  // Load editing data when editingIndex changes
  useEffect(() => {
    if (isEditing && editingAnnouncement) {
      setLink(editingAnnouncement.link || "");
      // Set image preview - could be base64 data URL, external URL, or filename
      setImagePreview(
        editingAnnouncement.image
          ? editingAnnouncement.image.startsWith("data:") || editingAnnouncement.image.startsWith("http")
            ? editingAnnouncement.image
            : `${process.env.NEXT_PUBLIC_BASE_PATH}/images/${editingAnnouncement.image}`
          : null
      );
      setImageFile(null);
      onOpen();
    }
  }, [editingIndex, isEditing, editingAnnouncement, onOpen]);

  const handleImageSelect = (file: File, preview: string) => {
    setImageFile(file);
    setImagePreview(preview);
  };

  const handleSaveAnnouncement = async () => {
    if (!link.trim()) {
      alert("Please enter a link for the announcement");
      return;
    }

    let imageDataUrl: string | null = null;

    // If a new file was selected, convert it to base64 data URL
    if (imageFile) {
      try {
        imageDataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve(reader.result as string);
          };
          reader.onerror = reject;
          reader.readAsDataURL(imageFile);
        });
      } catch (error) {
        console.error("Error converting image to base64:", error);
        alert("Error processing image. Please try again.");
        return;
      }
    } else if (editingAnnouncement?.image) {
      // Keep existing image if no new file was selected
      imageDataUrl = editingAnnouncement.image;
    }

    if (isEditing && editingIndex !== null) {
      updateAnnouncement(editingIndex, {
        image: imageDataUrl,
        link: link.trim(),
      });
      if (onCloseEdit) onCloseEdit();
    } else {
      addAnnouncement({
        enable: true,
        image: imageDataUrl,
        link: link.trim(),
      });
    }

    // Reset form
    setLink("");
    setImageFile(null);
    setImagePreview(null);
    onOpenChange();
    if (onCloseEdit) onCloseEdit();
  };

  const handleClose = () => {
    setLink("");
    setImageFile(null);
    setImagePreview(null);
    onOpenChange();
    if (onCloseEdit) onCloseEdit();
  };

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
        onOpenChange={handleClose}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h2 className="text-sm font-bold">
                  {isEditing ? "Edit Announcement" : "Add Announcement"}
                </h2>
                <p className="text-xs text-[#616161] font-normal">
                  Recommended banner dimensions: 296 × 120 pixels (Maximum file
                  size: 2 MB)
                </p>
              </ModalHeader>

              <ModalBody>
                <div className="flex flex-col gap-4 p-4">
                  <AnnouncementsUploadArea
                    onImageSelect={handleImageSelect}
                    initialPreview={imagePreview}
                  />

                  <div className="">
                    <label className="block mb-1 text-[13px]">
                      Product Link for Image
                    </label>
                    <input
                      type="url"
                      value={link}
                      onChange={(e) => setLink(e.target.value)}
                      placeholder="https://example.com"
                      className="w-full h-8 border border-[#8a8a8a] rounded-lg px-3 text-[13px] leading-none focus:outline-none bg-[#fdfdfd]"
                    />
                  </div>
                </div>
              </ModalBody>

              <ModalFooter>
                <Button className="custom-btn-default" onPress={handleClose}>
                  Close
                </Button>
                <Button
                  className="custom-btn"
                  onPress={handleSaveAnnouncement}
                  isDisabled={!link.trim()}
                >
                  {isEditing ? "Update Announcement" : "Add Announcement"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
