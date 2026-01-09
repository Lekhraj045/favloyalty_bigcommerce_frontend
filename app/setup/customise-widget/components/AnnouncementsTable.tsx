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
import { SquareArrowOutUpRight, SquarePen, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useWidgetCustomization } from "../context/WidgetCustomizationContext";

interface AnnouncementsTableAreaProps {
  onEdit?: (index: number) => void;
}

export default function AnnouncementsTableArea({ onEdit }: AnnouncementsTableAreaProps) {
  const { state, toggleAnnouncement, deleteAnnouncement } = useWidgetCustomization();
  const { announcements } = state;

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
            {announcements.map((announcement, index) => (
              <TableRow key={announcement._id || index}>
                <TableCell className="flex items-center gap-2">
                  {index + 1}
                </TableCell>

                <TableCell>
                  <div className="w-16 h-10 rounded-lg bg-gray-100 relative overflow-hidden flex items-center justify-center border border-gray-200">
                    {announcement.image ? (
                      announcement.image.startsWith("data:") || announcement.image.startsWith("http") ? (
                        // Base64 data URL or external URL
                        <img
                          src={announcement.image}
                          alt={`Announcement ${index + 1}`}
                          className="max-w-full max-h-full rounded-lg object-contain"
                          style={{ width: 'auto', height: 'auto' }}
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
                  </div>
                </TableCell>

                <TableCell>
                  {announcement.link ? (
                    <div className="flex items-center gap-2">
                      <Link href={announcement.link} target="_blank" rel="noopener noreferrer">
                        <SquareArrowOutUpRight className="w-3 h-3 text-[#616161] hover:text-black" />
                      </Link>
                      <span className="text-xs text-[#616161] whitespace-nowrap overflow-hidden text-ellipsis max-w-[250px]">
                        {announcement.link}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-[#999999]">No link</span>
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
                    />
                    <Tooltip showArrow={true} closeDelay={0} content="Edit">
                      <SquarePen
                        size={14}
                        className="cursor-pointer hover:text-black"
                        onClick={() => onEdit && onEdit(index)}
                      />
                    </Tooltip>
                    <Tooltip showArrow={true} closeDelay={0} content="Delete">
                      <Trash2
                        size={14}
                        className="cursor-pointer hover:text-red-500"
                        onClick={() => deleteAnnouncement(index)}
                      />
                    </Tooltip>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
