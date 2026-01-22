import {
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
} from "@heroui/table";
import { Tooltip } from "@heroui/tooltip";
import { Info, SquarePen, Trash2 } from "lucide-react";


export default function CampaignTableArea() {
    return (
        <div className="tierTable border border-[#DEDEDE] rounded-lg overflow-hidden">
            <Table
                aria-label="Events points table"
                shadow="none"
                removeWrapper
                classNames={{
                    th: "bg-[#F7F7F7] text-xs font-normal text-[#616161] px-3 py-2",
                    td: "text-xs text-[#2E2E2E] px-3 py-2 border-t border-[#E3E3E3]",
                    thead: "custom-thead"
                }}
            >
                <TableHeader>
                    <TableColumn className="!rounded-bl-none pl-3">
                        Event
                    </TableColumn>
                    <TableColumn>Silver (1x)</TableColumn>
                    <TableColumn>Gold (1.2x)</TableColumn>
                    <TableColumn className="!rounded-br-none">
                        Platinum (1.5x)
                    </TableColumn>
                </TableHeader>

                <TableBody>
                    <TableRow key="1">
                        <TableCell className="flex items-center gap-2">
                            Purchase
                            <Tooltip showArrow={true} closeDelay={0} content="Tier multipliers apply only to Purchase points. Each tier has its own customizable multiplier. For example, if Purchase = 100 pts and Second Tier has a 1.2x multiplier, members earn 120 pts."
                                classNames={{
                                    content: "max-w-xs whitespace-normal break-words",
                                }}
                                size="sm"
                            >
                                <Info
                                    size={14}
                                    className="cursor-pointer hover:text-black"
                                />
                            </Tooltip>
                        </TableCell>

                        <TableCell>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#F0F0F0] text-[#303030]">
                                12.00
                            </span>
                        </TableCell>

                        <TableCell>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#F0F0F0] text-[#303030]">
                                15.00
                            </span>
                        </TableCell>

                        <TableCell>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#F0F0F0] text-[#303030]">
                                10.00
                            </span>
                        </TableCell>
                    </TableRow>

                    <TableRow key="2">
                        <TableCell>Sign Up</TableCell>
                        <TableCell>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#F0F0F0] text-[#303030]">
                                100
                            </span>
                        </TableCell>
                        <TableCell>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#F0F0F0] text-[#303030]">
                                100
                            </span>
                        </TableCell>
                        <TableCell>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#F0F0F0] text-[#303030]">
                                100
                            </span>
                        </TableCell>
                    </TableRow>

                    <TableRow key="3">
                        <TableCell>Newsletter</TableCell>
                        <TableCell>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#F0F0F0] text-[#303030]">
                                100
                            </span>
                        </TableCell>
                        <TableCell>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#F0F0F0] text-[#303030]">
                                100
                            </span>
                        </TableCell>
                        <TableCell>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#F0F0F0] text-[#303030]">
                                100
                            </span>
                        </TableCell>
                    </TableRow>

                    <TableRow key="4">
                        <TableCell>Profile Completion</TableCell>
                        <TableCell>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#F0F0F0] text-[#303030]">
                                50
                            </span>
                        </TableCell>
                        <TableCell>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#F0F0F0] text-[#303030]">
                                50
                            </span>
                        </TableCell>
                        <TableCell>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#F0F0F0] text-[#303030]">
                                50
                            </span>
                        </TableCell>
                    </TableRow>

                    <TableRow key="5">
                        <TableCell>Refer & Earn</TableCell>
                        <TableCell>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#F0F0F0] text-[#303030]">
                                200
                            </span>
                        </TableCell>
                        <TableCell>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#F0F0F0] text-[#303030]">
                                200
                            </span>
                        </TableCell>
                        <TableCell>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#F0F0F0] text-[#303030]">
                                200
                            </span>
                        </TableCell>
                    </TableRow>

                    <TableRow key="6">
                        <TableCell>Birthday</TableCell>
                        <TableCell>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#F0F0F0] text-[#303030]">
                                100
                            </span>
                        </TableCell>
                        <TableCell>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#F0F0F0] text-[#303030]">
                                100
                            </span>
                        </TableCell>
                        <TableCell>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#F0F0F0] text-[#303030]">
                                100
                            </span>
                        </TableCell>
                    </TableRow>

                    <TableRow key="7">
                        <TableCell>Rejoin</TableCell>
                        <TableCell>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#F0F0F0] text-[#303030]">
                                100
                            </span>
                        </TableCell>
                        <TableCell>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#F0F0F0] text-[#303030]">
                                100
                            </span>
                        </TableCell>
                        <TableCell>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#F0F0F0] text-[#303030]">
                                100
                            </span>
                        </TableCell>
                    </TableRow>

                    <TableRow key="8">
                        <TableCell>Christmas</TableCell>
                        <TableCell>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#F0F0F0] text-[#303030]">
                                50
                            </span>
                        </TableCell>
                        <TableCell>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#F0F0F0] text-[#303030]">
                                50
                            </span>
                        </TableCell>
                        <TableCell>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#F0F0F0] text-[#303030]">
                                50
                            </span>
                        </TableCell>
                    </TableRow>

                    <TableRow key="9">
                        <TableCell>New Year's Day</TableCell>
                        <TableCell>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#F0F0F0] text-[#303030]">
                                0
                            </span>
                        </TableCell>
                        <TableCell>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#F0F0F0] text-[#303030]">
                                0
                            </span>
                        </TableCell>
                        <TableCell>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#F0F0F0] text-[#303030]">
                                0
                            </span>
                        </TableCell>
                    </TableRow>

                    <TableRow key="10">
                        <TableCell>Easter</TableCell>
                        <TableCell>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#F0F0F0] text-[#303030]">
                                0
                            </span>
                        </TableCell>
                        <TableCell>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#F0F0F0] text-[#303030]">
                                0
                            </span>
                        </TableCell>
                        <TableCell>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#F0F0F0] text-[#303030]">
                                0
                            </span>
                        </TableCell>
                    </TableRow>

                    <TableRow key="11">
                        <TableCell>Ramadan</TableCell>
                        <TableCell>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#F0F0F0] text-[#303030]">
                                0
                            </span>
                        </TableCell>
                        <TableCell>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#F0F0F0] text-[#303030]">
                                0
                            </span>
                        </TableCell>
                        <TableCell>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#F0F0F0] text-[#303030]">
                                0
                            </span>
                        </TableCell>
                    </TableRow>

                    <TableRow key="12">
                        <TableCell>Chinese New Year</TableCell>
                        <TableCell>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#F0F0F0] text-[#303030]">
                                0
                            </span>
                        </TableCell>
                        <TableCell>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#F0F0F0] text-[#303030]">
                                0
                            </span>
                        </TableCell>
                        <TableCell>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#F0F0F0] text-[#303030]">
                                0
                            </span>
                        </TableCell>
                    </TableRow>

                    <TableRow key="13">
                        <TableCell>Diwali</TableCell>
                        <TableCell>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#F0F0F0] text-[#303030]">
                                0
                            </span>
                        </TableCell>
                        <TableCell>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#F0F0F0] text-[#303030]">
                                0
                            </span>
                        </TableCell>
                        <TableCell>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#F0F0F0] text-[#303030]">
                                0
                            </span>
                        </TableCell>
                    </TableRow>

                    <TableRow key="14">
                        <TableCell>Holi</TableCell>
                        <TableCell>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#F0F0F0] text-[#303030]">
                                0
                            </span>
                        </TableCell>
                        <TableCell>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#F0F0F0] text-[#303030]">
                                0
                            </span>
                        </TableCell>
                        <TableCell>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#F0F0F0] text-[#303030]">
                                0
                            </span>
                        </TableCell>
                    </TableRow>

                    <TableRow key="15">
                        <TableCell>Hanukkah</TableCell>
                        <TableCell>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#F0F0F0] text-[#303030]">
                                0
                            </span>
                        </TableCell>
                        <TableCell>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#F0F0F0] text-[#303030]">
                                0
                            </span>
                        </TableCell>
                        <TableCell>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#F0F0F0] text-[#303030]">
                                0
                            </span>
                        </TableCell>
                    </TableRow>

                    <TableRow key="16">
                        <TableCell>Independence Day</TableCell>
                        <TableCell>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#F0F0F0] text-[#303030]">
                                0
                            </span>
                        </TableCell>
                        <TableCell>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#F0F0F0] text-[#303030]">
                                0
                            </span>
                        </TableCell>
                        <TableCell>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#F0F0F0] text-[#303030]">
                                0
                            </span>
                        </TableCell>
                    </TableRow>

                    <TableRow key="17">
                        <TableCell>Thanksgiving</TableCell>
                        <TableCell>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#F0F0F0] text-[#303030]">
                                0
                            </span>
                        </TableCell>
                        <TableCell>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#F0F0F0] text-[#303030]">
                                0
                            </span>
                        </TableCell>
                        <TableCell>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#F0F0F0] text-[#303030]">
                                0
                            </span>
                        </TableCell>
                    </TableRow>

                    <TableRow key="18">
                        <TableCell>Valentine's Day</TableCell>
                        <TableCell>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#F0F0F0] text-[#303030]">
                                0
                            </span>
                        </TableCell>
                        <TableCell>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#F0F0F0] text-[#303030]">
                                0
                            </span>
                        </TableCell>
                        <TableCell>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#F0F0F0] text-[#303030]">
                                0
                            </span>
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </div>
    )
}