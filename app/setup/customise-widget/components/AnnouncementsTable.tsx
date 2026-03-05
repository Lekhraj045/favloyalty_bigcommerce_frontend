import UpgradeModal from "@/components/UpgradeModal";
import { Switch } from "@heroui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/table";
import { Tooltip } from "@heroui/tooltip";
import { SquarePen, Trash2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useWidgetCustomization } from "../context/WidgetCustomizationContext";

interface AnnouncementsTableAreaProps {
  onEdit?: (index: number) => void;
  isFreePlan?: boolean;
}

export default function AnnouncementsTableArea({
  onEdit,
  isFreePlan = false,
}: AnnouncementsTableAreaProps) {
  const { state, toggleAnnouncement, deleteAnnouncement } =
    useWidgetCustomization();
  const { announcements } = state;
  const [showUpgradeModal, setShowUpgradeModal] = useState<boolean>(false);

  const handleEdit = (index: number) => {
    // Check if it's a restricted announcement (index > 0) for free users
    if (isFreePlan && index > 0) {
      setShowUpgradeModal(true);
      return;
    }
    if (onEdit) {
      onEdit(index);
    }
  };

  const handleDelete = (index: number) => {
    // Allow deletion of all announcements (including restricted ones)
    deleteAnnouncement(index);
  };

  if (announcements.length === 0) {
    return (
      <div className="p-4">
        <div className="text-center py-8 text-sm text-[#616161]">
          No announcements added yet. Click "Add Announcements" to create one.
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="tierTable border border-[#DEDEDE] rounded-lg overflow-hidden">
        <Table
          aria-label="Announcements table"
          shadow="none"
          removeWrapper
          classNames={{
            th: "bg-[#F7F7F7] text-xs font-normal text-[#616161] px-3 py-2",
            td: "text-xs text-[#2E2E2E] px-3 py-2 border-t border-[#E3E3E3]",
          }}
        >
          <TableHeader>
            <TableColumn className="!rounded-bl-none pl-3">No.</TableColumn>
            <TableColumn>Image</TableColumn>
            <TableColumn>Link</TableColumn>
            <TableColumn className="!rounded-br-none" align="end">
              Actions
            </TableColumn>
          </TableHeader>

          <TableBody>
            {announcements.map((announcement, index) => {
              const isPremium = isFreePlan && index > 0; // First announcement (index 0) is free

              return (
                <TableRow key={announcement._id || index}>
                  <TableCell>
                    <span
                      className={isPremium ? "opacity-60 blur-[0.5px]" : ""}
                    >
                      {index + 1}
                    </span>
                  </TableCell>

                  <TableCell>
                    <div
                      className={`w-16 h-10 rounded-lg bg-gray-100 relative overflow-visible flex items-center justify-center border border-gray-200 ${
                        isPremium ? "opacity-60 blur-[0.5px]" : ""
                      }`}
                    >
                      {announcement.image ? (
                        announcement.image.startsWith("data:") ||
                        announcement.image.startsWith("http") ? (
                          // Base64 data URL or external URL
                          <img
                            src={announcement.image}
                            alt={`Announcement ${index + 1}`}
                            className="max-w-full max-h-full rounded-lg object-contain"
                            style={{ width: "auto", height: "auto" }}
                          />
                        ) : (
                          // Filename - try to load from images folder
                          <Image
                            src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/${announcement.image}`}
                            alt={`Announcement ${index + 1}`}
                            width={64}
                            height={40}
                            className="rounded-lg object-contain"
                            onError={(e) => {
                              // Fallback to default if image not found
                              const target = e.target as HTMLImageElement;
                              target.src = `${process.env.NEXT_PUBLIC_BASE_PATH}/images/default_announcement.jpg`;
                            }}
                          />
                        )
                      ) : (
                        <Image
                          src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/default_announcement.jpg`}
                          alt={`Default announcement ${index + 1}`}
                          width={64}
                          height={40}
                          className="rounded-lg object-contain"
                        />
                      )}
                      {isPremium && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center z-20 shadow-md border-2 border-white">
                          <svg
                            className="w-3.5 h-3.5 text-yellow-800"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    {announcement.link ? (
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[250px] ${
                            isPremium
                              ? "opacity-60 blur-[0.5px] text-gray-400"
                              : "text-[#616161]"
                          }`}
                        >
                          {announcement.link}
                        </span>
                      </div>
                    ) : (
                      <span
                        className={`text-xs ${isPremium ? "opacity-60 blur-[0.5px] text-gray-400" : "text-[#999999]"}`}
                      >
                        No link
                      </span>
                    )}
                  </TableCell>

                  <TableCell>
                    <div className="flex justify-end items-center gap-4 text-gray-500">
                      <Switch
                        aria-label="enable"
                        size="sm"
                        color="success"
                        isSelected={announcement.enable}
                        onValueChange={() => toggleAnnouncement(index)}
                        isDisabled={isPremium}
                        classNames={{
                          base: isPremium
                            ? "opacity-50 cursor-not-allowed"
                            : "",
                        }}
                      />
                      <Tooltip
                        showArrow={true}
                        closeDelay={0}
                        content={isPremium ? "Upgrade to edit" : "Edit"}
                      >
                        <SquarePen
                          size={14}
                          className={`${
                            isPremium
                              ? "cursor-not-allowed opacity-50 text-gray-400"
                              : "cursor-pointer hover:text-black"
                          }`}
                          onClick={() => handleEdit(index)}
                        />
                      </Tooltip>
                      <Tooltip showArrow={true} closeDelay={0} content="Delete">
                        <Trash2
                          size={14}
                          className="cursor-pointer hover:text-red-500"
                          onClick={() => handleDelete(index)}
                        />
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        featureName="Multiple Announcements"
      />
    </div>
  );
}
