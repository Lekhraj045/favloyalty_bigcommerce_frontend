"use client";
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

export default function CustomerActivityTableArea() {
    return (
        <div className="tierTable border border-[#DEDEDE] rounded-lg overflow-hidden">
            <Table
                aria-label="Events points table"
                shadow="none"
                removeWrapper
                classNames={{
                    th: "bg-[#F7F7F7] text-xs font-normal text-[#616161] px-3 py-2",
                    td: "text-xs text-[#2E2E2E] px-3 py-2 border-t border-[#E3E3E3]",
                    base: "max-h-[360px] overflow-y-auto",
                }}
            >
                <TableHeader>
                    <TableColumn className="!rounded-bl-none pl-3">
                        Date
                    </TableColumn>
                    <TableColumn>Activity</TableColumn>
                    <TableColumn>Status</TableColumn>
                    <TableColumn>Type</TableColumn>
                    <TableColumn className="!rounded-br-none" align="end">
                        Points
                    </TableColumn>
                </TableHeader>

                <TableBody>
                    <TableRow key="1">
                        <TableCell>
                            Nov 19 at 11:36am
                        </TableCell>

                        <TableCell>Sign Up Bonus</TableCell>

                        <TableCell>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-green-100 text-green-700">
                                Completed
                            </span>
                        </TableCell>

                        <TableCell>
                            Earn
                        </TableCell>

                        <TableCell>
                            100
                        </TableCell>
                    </TableRow>

                    <TableRow key="2">
                        <TableCell>
                            Nov 19 at 11:36am
                        </TableCell>

                        <TableCell>Referral Completion Bonus</TableCell>

                        <TableCell>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#FFEB78] text-[#4f4700]">
                                In Progress
                            </span>
                        </TableCell>

                        <TableCell>
                            Referral
                        </TableCell>

                        <TableCell>
                            200
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </div>
    );
}
