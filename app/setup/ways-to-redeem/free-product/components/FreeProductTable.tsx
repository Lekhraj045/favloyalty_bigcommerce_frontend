import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/table";
import { Tooltip } from "@heroui/tooltip";
import { ExternalLink, Trash2 } from "lucide-react";
import Image from "next/image";

export default function FreeProductTable() {
  return (
    <div className="tierTable border border-[#DEDEDE] rounded-lg overflow-hidden">
      <Table
        aria-label="Eligible free products table"
        shadow="none"
        removeWrapper
        classNames={{
          th: "bg-[#F7F7F7] text-xs font-normal text-[#616161] px-3 py-2",
          td: "text-xs text-[#2E2E2E] px-3 py-2 border-t border-[#E3E3E3]",
        }}
      >
        <TableHeader>
          <TableColumn className="!rounded-bl-none pl-3">Image</TableColumn>
          <TableColumn>Product / Variant</TableColumn>
          <TableColumn>Points Required</TableColumn>
          <TableColumn className="!rounded-br-none" align="end">
            Action
          </TableColumn>
        </TableHeader>

        <TableBody>
          <TableRow key="1">
            <TableCell>
              <div className="w-8 h-8 max-w-[36px] max-h-[36px] border border-[#DEDEDE] rounded-lg overflow-hidden">
                <Image
                  src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/bike1.jpg`}
                  alt="bike1"
                  width={36}
                  height={36}
                  className="w-full h-full object-cover"
                />
              </div>
            </TableCell>

            <TableCell>
              <div className="flex items-center gap-2">
                <span className="text-xs max-w-[400px] truncate">
                  The 3p Fulfilled Snowboard - Default Title
                </span>
                <ExternalLink size={14} className="text-gray-400" />
              </div>
            </TableCell>

            <TableCell>
              <div className="flex flex-col gap-1">
                <input
                  type="text"
                  placeholder="Enter points (1-999,999)"
                  className="w-full h-8 border border-[#8a8a8a] rounded-lg px-3 text-[13px] leading-none focus:outline-none bg-[#fdfdfd]"
                />
                <p className="text-[11px] text-gray-500">
                  Maximum 999,999 points
                </p>
              </div>
            </TableCell>

            <TableCell>
              <div className="flex justify-end">
                <Tooltip showArrow={true} closeDelay={0} content="Delete">
                  <button className="bg-red-100 rounded-lg p-1.5 hover:bg-red-200 transition-colors">
                    <Trash2 size={14} className="text-red-600 cursor-pointer" />
                  </button>
                </Tooltip>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
