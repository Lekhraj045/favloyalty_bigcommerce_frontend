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
import { Eye, Plus, SquarePen, Trash2 } from "lucide-react";
import { useState } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@heroui/button";
import { useRouter } from "next/navigation";
import AdjustCustomerPointsModal from "./AdjustCustomerPointsModal";

export default function CustomerTable() {
    const router = useRouter();
    const [searchKeyword, setSearchKeyword] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleExportJSON = () => {
        // TODO: Implement JSON export functionality
        console.log("Export as JSON");
    };

    const handleExportCSV = () => {
        // TODO: Implement CSV export functionality
        console.log("Export as CSV");
    };


    return (
        <>
            <div className="flex flex-col">
                <div className="flex justify-between items-center gap-4 border-b border-[#DEDEDE] p-4">
                    <div className="w-2xs">
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                <Search className="w-4 h-4 text-[#616161]" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search customers..."
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                                className="pl-8 pr-8 w-full h-8 border rounded-lg px-3 text-[13px] leading-none focus:outline-none bg-[#fdfdfd] border-[#8a8a8a]"
                            />
                            {searchKeyword && (
                                <button
                                    onClick={() => setSearchKeyword("")}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                >
                                    <X className="w-4 h-4 text-[#616161]" />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant="flat"
                            onPress={handleExportJSON}
                            className="custom-btn-default"
                        >
                            Export All Customers as JSON
                        </Button>
                        <Button
                            variant="flat"
                            onPress={handleExportCSV}
                            className="custom-btn-default"
                        >
                            Export All Customers as CSV
                        </Button>
                        <Button
                            onPress={() => setIsModalOpen(true)}
                            className="custom-btn"
                        >
                            <Plus size={16} />
                            Adjust Customer Points
                        </Button>
                    </div>
                </div>

                <div className="p-4">
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
                                <TableColumn>Total Points</TableColumn>
                                <TableColumn>Referrals</TableColumn>
                                <TableColumn>Tier</TableColumn>
                                <TableColumn className="!rounded-br-none" align="end">
                                    Action
                                </TableColumn>
                            </TableHeader>

                            <TableBody>
                                <TableRow key="1">
                                    <TableCell>Ayumu Hirano</TableCell>

                                    <TableCell>ayumu.hirano@example.com</TableCell>

                                    <TableCell>50</TableCell>

                                    <TableCell>1</TableCell>

                                    <TableCell>
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#F0F0F0] text-[#303030]">
                                            Silver
                                        </span>
                                    </TableCell>

                                    <TableCell>
                                        <div className="flex justify-end gap-4 text-gray-500">
                                            <Tooltip showArrow={true} closeDelay={0} content="Edit">
                                                <SquarePen
                                                    size={14}
                                                    className="cursor-pointer hover:text-black"
                                                    onClick={() => router.push("/customer/customer-details")}
                                                />
                                            </Tooltip>
                                            <Tooltip showArrow={true} closeDelay={0} content="View in Bigcommerce">
                                                <Eye
                                                    size={14}
                                                    className="cursor-pointer hover:text-black"
                                                />
                                            </Tooltip>
                                        </div>
                                    </TableCell>
                                </TableRow>

                                <TableRow key="2">
                                    <TableCell>John Doe</TableCell>

                                    <TableCell>john.doe@example.com</TableCell>

                                    <TableCell>50</TableCell>

                                    <TableCell>1</TableCell>

                                    <TableCell>
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#FFEB78] text-[#4f4700]">
                                            Gold
                                        </span>
                                    </TableCell>

                                    <TableCell>
                                        <div className="flex justify-end gap-4 text-gray-500">
                                            <Tooltip showArrow={true} closeDelay={0} content="Edit">
                                                <SquarePen
                                                    size={14}
                                                    className="cursor-pointer hover:text-black"
                                                    onClick={() => router.push("/customer/customer-details")}
                                                />
                                            </Tooltip>
                                            <Tooltip showArrow={true} closeDelay={0} content="View in Bigcommerce">
                                                <Eye
                                                    size={14}
                                                    className="cursor-pointer hover:text-black"
                                                />
                                            </Tooltip>
                                        </div>
                                    </TableCell>
                                </TableRow>

                                <TableRow key="3">
                                    <TableCell>Jane Doe</TableCell>

                                    <TableCell>jane.doe@example.com</TableCell>

                                    <TableCell>50</TableCell>

                                    <TableCell>1</TableCell>

                                    <TableCell>
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#d5ebff] text-[#003a5a]">
                                            Platinum
                                        </span>
                                    </TableCell>

                                    <TableCell>
                                        <div className="flex justify-end gap-4 text-gray-500">
                                            <Tooltip showArrow={true} closeDelay={0} content="Edit">
                                                <SquarePen
                                                    size={14}
                                                    className="cursor-pointer hover:text-black"
                                                    onClick={() => router.push("/customer/customer-details")}
                                                />
                                            </Tooltip>
                                            <Tooltip showArrow={true} closeDelay={0} content="View in Bigcommerce">
                                                <Eye
                                                    size={14}
                                                    className="cursor-pointer hover:text-black"
                                                />
                                            </Tooltip>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>

            <AdjustCustomerPointsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
}
