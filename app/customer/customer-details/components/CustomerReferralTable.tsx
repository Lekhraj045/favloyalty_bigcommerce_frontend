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

export default function CustomerReferralTableArea() {
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
                        Name
                    </TableColumn>
                    <TableColumn>Email</TableColumn>
                    <TableColumn className="!rounded-br-none" align="end">
                        Points
                    </TableColumn>
                </TableHeader>

                <TableBody>
                    <TableRow key="1">
                        <TableCell>
                            riyaz khan
                        </TableCell>

                        <TableCell>madewem168@delaeb.com</TableCell>

                        <TableCell>
                            200
                        </TableCell>
                    </TableRow>

                    <TableRow key="2">
                        <TableCell>
                            prabhat kumar
                        </TableCell>

                        <TableCell>prabhatkumar168@delaeb.com</TableCell>

                        <TableCell>
                            200
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </div>
    );
}
