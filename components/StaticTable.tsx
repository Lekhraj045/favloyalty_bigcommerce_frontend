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

export default function StaticTable() {
  return (
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
          <TableColumn className="!rounded-bl-none pl-3">
            Event / Occasion
          </TableColumn>
          <TableColumn>Date of Event</TableColumn>
          <TableColumn>Points</TableColumn>
          <TableColumn>Status</TableColumn>
          <TableColumn className="!rounded-br-none" align="end">
            Action
          </TableColumn>
        </TableHeader>

        <TableBody>
          <TableRow key="1">
            <TableCell className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full border border-green-600 flex items-center justify-center">
                <span className="w-1.5 h-1.5 bg-green-600 rounded-full" />
              </span>
              Christmas
            </TableCell>

            <TableCell>2025-11-19</TableCell>

            <TableCell>50 points</TableCell>

            <TableCell>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-green-100 text-green-700">
                Completed
              </span>
            </TableCell>

            <TableCell>
              <div className="flex justify-end gap-4 text-gray-500">
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
  );
}
