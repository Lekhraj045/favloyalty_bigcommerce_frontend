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

export default function AnnouncementsTableArea() {
  return (
    <div className="p-4">
        <div className="tierTable border border-[#DEDEDE] rounded-lg overflow-hidden">
        <Table
            aria-label="Events points table"
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
            <TableRow key="1">
                <TableCell className="flex items-center gap-2">1</TableCell>

                <TableCell>
                <div className="w-10 h-6 rounded-lg bg-gray-200">
                    <Image
                    src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/default_announcement.jpg`}
                    alt="widget-icon1"
                    fill
                    priority
                    className="w-full h-full rounded-lg"
                    />
                </div>
                </TableCell>

                <TableCell>
                <div className="flex items-center gap-2">
                    <Link
                    href="https://teststoredes2025.myshopify.com"
                    target="_blank"
                    >
                    <SquareArrowOutUpRight className="w-3 h-3" />
                    </Link>
                    <span className="text-xs text-[#616161] whitespace-nowrap overflow-hidden text-ellipsis max-w-[250px]">
                    https://teststoredes2025.myshopify.com
                    </span>
                </div>
                </TableCell>

                <TableCell>
                <div className="flex justify-end items-center gap-4 text-gray-500">
                    <Switch
                    aria-label="enable"
                    size="sm"
                    color="success"
                    />
                    <Tooltip showArrow={true} closeDelay={0} content="Edit">
                    <SquarePen
                        size={14}
                        className="cursor-pointer hover:text-black"
                    />
                    </Tooltip>
                    <Tooltip showArrow={true} closeDelay={0} content="Delete">
                    <Trash2
                        size={14}
                        className="cursor-pointer hover:text-red-500"
                    />
                    </Tooltip>
                </div>
                </TableCell>
            </TableRow>

            <TableRow key="2">
                <TableCell className="flex items-center gap-2">1</TableCell>

                <TableCell>
                <div className="w-10 h-6 rounded-lg bg-gray-200">
                    <Image
                    src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/default_announcement.jpg`}
                    alt="widget-icon1"
                    fill
                    priority
                    className="w-full h-full rounded-lg"
                    />
                </div>
                </TableCell>

                <TableCell>
                <div className="flex items-center gap-2">
                    <Link
                    href="https://teststoredes2025.myshopify.com"
                    target="_blank"
                    >
                    <SquareArrowOutUpRight className="w-3 h-3" />
                    </Link>
                    <span className="text-xs text-[#616161] whitespace-nowrap overflow-hidden text-ellipsis max-w-[250px]">
                    https://teststoredes2025.myshopify.com
                    </span>
                </div>
                </TableCell>

                <TableCell>
                <div className="flex justify-end items-center gap-4 text-gray-500">
                    <Switch
                    aria-label="enable"
                    size="sm"
                    color="success"
                    />
                    <Tooltip showArrow={true} closeDelay={0} content="Edit">
                    <SquarePen
                        size={14}
                        className="cursor-pointer hover:text-black"
                    />
                    </Tooltip>
                    <Tooltip showArrow={true} closeDelay={0} content="Delete">
                    <Trash2
                        size={14}
                        className="cursor-pointer hover:text-red-500"
                    />
                    </Tooltip>
                </div>
                </TableCell>
            </TableRow>
            </TableBody>
        </Table>
        </div>
    </div>
  );
}
