import {
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
  } from "@heroui/table";
  import { Tooltip } from "@heroui/tooltip";
  import { Switch } from "@heroui/switch";
  import { SquarePen, Trash2 } from "lucide-react";
  import Image from "next/image";
  
  export default function WaysRedeemTable() {
    return (
      <div className="tierTable checkbox-table border border-[#DEDEDE] rounded-lg overflow-hidden">
        <Table
          aria-label="Ways to redeem table"
          shadow="none"
          removeWrapper
          selectionMode="multiple"
          color="default"
          classNames={{
            th: "bg-[#F7F7F7] text-xs font-normal text-[#616161] px-3 py-2",
            td: "text-xs text-[#303030] px-3 py-2 border-t border-[#E3E3E3]",
            base: "max-h-[220px] overflow-y-auto",
          }}
        >
          <TableHeader>
            <TableColumn className="!rounded-bl-none pl-3">
            Coupons
            </TableColumn>
            <TableColumn>Points</TableColumn>
            <TableColumn>Type</TableColumn>
            <TableColumn>Expiry</TableColumn>
            <TableColumn className="!rounded-br-none" align="end">
              Actions
            </TableColumn>
          </TableHeader>
  
          <TableBody>
            <TableRow key="1">
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="border border-[#DEDEDE] rounded-lg p-2 w-10 h-10 max-w-10 max-h-10 flex items-center justify-center">
                    <Image 
                      src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/percentage-discount.svg`} 
                      width={24} 
                      height={24} 
                      alt="Percentage Discount" 
                      priority 
                    />
                  </div>
                  <span className="font-bold">100% off</span>
                </div>
              </TableCell>
  
              <TableCell>
                <span className="font-bold">500 Points</span>
              </TableCell>
  
              <TableCell>Percentage Discount</TableCell>
  
              <TableCell>
                <span className="font-bold">1 Days</span>
              </TableCell>
  
              <TableCell>
                <div className="flex justify-end items-center gap-3">
                  <Switch 
                    defaultSelected 
                    size="sm"
                    classNames={{
                      wrapper: "group-data-[selected=true]:bg-green-500",
                    }}
                  />
                  <Tooltip showArrow={true} closeDelay={0} content="Edit">
                    <button className="bg-gray-700 rounded-lg p-1.5 hover:bg-gray-800 transition-colors">
                      <SquarePen
                        size={14}
                        className="text-white cursor-pointer"
                      />
                    </button>
                  </Tooltip>
                  <Tooltip showArrow={true} closeDelay={0} content="Delete">
                    <button className="bg-red-100 rounded-lg p-1.5 hover:bg-red-200 transition-colors">
                      <Trash2
                        size={14}
                        className="text-red-600 cursor-pointer"
                      />
                    </button>
                  </Tooltip>
                </div>
              </TableCell>
            </TableRow>

            <TableRow key="2">
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="border border-[#DEDEDE] rounded-lg p-2 w-10 h-10 max-w-10 max-h-10 flex items-center justify-center">
                    <Image 
                      src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/percentage-discount.svg`} 
                      width={24} 
                      height={24} 
                      alt="Percentage Discount" 
                      priority 
                    />
                  </div>
                  <span className="font-bold">100% off</span>
                </div>
              </TableCell>
  
              <TableCell>
                <span className="font-bold">500 Points</span>
              </TableCell>
  
              <TableCell>Percentage Discount</TableCell>
  
              <TableCell>
                <span className="font-bold">1 Days</span>
              </TableCell>
  
              <TableCell>
                <div className="flex justify-end items-center gap-3">
                  <Switch 
                    defaultSelected 
                    size="sm"
                    classNames={{
                      wrapper: "group-data-[selected=true]:bg-green-500",
                    }}
                  />
                  <Tooltip showArrow={true} closeDelay={0} content="Edit">
                    <button className="bg-gray-700 rounded-lg p-1.5 hover:bg-gray-800 transition-colors">
                      <SquarePen
                        size={14}
                        className="text-white cursor-pointer"
                      />
                    </button>
                  </Tooltip>
                  <Tooltip showArrow={true} closeDelay={0} content="Delete">
                    <button className="bg-red-100 rounded-lg p-1.5 hover:bg-red-200 transition-colors">
                      <Trash2
                        size={14}
                        className="text-red-600 cursor-pointer"
                      />
                    </button>
                  </Tooltip>
                </div>
              </TableCell>
            </TableRow>

            <TableRow key="3">
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="border border-[#DEDEDE] rounded-lg p-2 w-10 h-10 max-w-10 max-h-10 flex items-center justify-center">
                    <Image 
                      src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/percentage-discount.svg`} 
                      width={24} 
                      height={24} 
                      alt="Percentage Discount" 
                      priority 
                    />
                  </div>
                  <span className="font-bold">100% off</span>
                </div>
              </TableCell>
  
              <TableCell>
                <span className="font-bold">500 Points</span>
              </TableCell>
  
              <TableCell>Percentage Discount</TableCell>
  
              <TableCell>
                <span className="font-bold">1 Days</span>
              </TableCell>
  
              <TableCell>
                <div className="flex justify-end items-center gap-3">
                  <Switch 
                    defaultSelected 
                    size="sm"
                    classNames={{
                      wrapper: "group-data-[selected=true]:bg-green-500",
                    }}
                  />
                  <Tooltip showArrow={true} closeDelay={0} content="Edit">
                    <button className="bg-gray-700 rounded-lg p-1.5 hover:bg-gray-800 transition-colors">
                      <SquarePen
                        size={14}
                        className="text-white cursor-pointer"
                      />
                    </button>
                  </Tooltip>
                  <Tooltip showArrow={true} closeDelay={0} content="Delete">
                    <button className="bg-red-100 rounded-lg p-1.5 hover:bg-red-200 transition-colors">
                      <Trash2
                        size={14}
                        className="text-red-600 cursor-pointer"
                      />
                    </button>
                  </Tooltip>
                </div>
              </TableCell>
            </TableRow>

            <TableRow key="4">
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="border border-[#DEDEDE] rounded-lg p-2 w-10 h-10 max-w-10 max-h-10 flex items-center justify-center">
                    <Image 
                      src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/percentage-discount.svg`} 
                      width={24} 
                      height={24} 
                      alt="Percentage Discount" 
                      priority 
                    />
                  </div>
                  <span className="font-bold">100% off</span>
                </div>
              </TableCell>
  
              <TableCell>
                <span className="font-bold">500 Points</span>
              </TableCell>
  
              <TableCell>Percentage Discount</TableCell>
  
              <TableCell>
                <span className="font-bold">1 Days</span>
              </TableCell>
  
              <TableCell>
                <div className="flex justify-end items-center gap-3">
                  <Switch 
                    defaultSelected 
                    size="sm"
                    classNames={{
                      wrapper: "group-data-[selected=true]:bg-green-500",
                    }}
                  />
                  <Tooltip showArrow={true} closeDelay={0} content="Edit">
                    <button className="bg-gray-700 rounded-lg p-1.5 hover:bg-gray-800 transition-colors">
                      <SquarePen
                        size={14}
                        className="text-white cursor-pointer"
                      />
                    </button>
                  </Tooltip>
                  <Tooltip showArrow={true} closeDelay={0} content="Delete">
                    <button className="bg-red-100 rounded-lg p-1.5 hover:bg-red-200 transition-colors">
                      <Trash2
                        size={14}
                        className="text-red-600 cursor-pointer"
                      />
                    </button>
                  </Tooltip>
                </div>
              </TableCell>
            </TableRow>

            <TableRow key="5">
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="border border-[#DEDEDE] rounded-lg p-2 w-10 h-10 max-w-10 max-h-10 flex items-center justify-center">
                    <Image 
                      src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/percentage-discount.svg`} 
                      width={24} 
                      height={24} 
                      alt="Percentage Discount" 
                      priority 
                    />
                  </div>
                  <span className="font-bold">100% off</span>
                </div>
              </TableCell>
  
              <TableCell>
                <span className="font-bold">500 Points</span>
              </TableCell>
  
              <TableCell>Percentage Discount</TableCell>
  
              <TableCell>
                <span className="font-bold">1 Days</span>
              </TableCell>
  
              <TableCell>
                <div className="flex justify-end items-center gap-3">
                  <Switch 
                    defaultSelected 
                    size="sm"
                    classNames={{
                      wrapper: "group-data-[selected=true]:bg-green-500",
                    }}
                  />
                  <Tooltip showArrow={true} closeDelay={0} content="Edit">
                    <button className="bg-gray-700 rounded-lg p-1.5 hover:bg-gray-800 transition-colors">
                      <SquarePen
                        size={14}
                        className="text-white cursor-pointer"
                      />
                    </button>
                  </Tooltip>
                  <Tooltip showArrow={true} closeDelay={0} content="Delete">
                    <button className="bg-red-100 rounded-lg p-1.5 hover:bg-red-200 transition-colors">
                      <Trash2
                        size={14}
                        className="text-red-600 cursor-pointer"
                      />
                    </button>
                  </Tooltip>
                </div>
              </TableCell>
            </TableRow>

            <TableRow key="6">
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="border border-[#DEDEDE] rounded-lg p-2 w-10 h-10 max-w-10 max-h-10 flex items-center justify-center">
                    <Image 
                      src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/percentage-discount.svg`} 
                      width={24} 
                      height={24} 
                      alt="Percentage Discount" 
                      priority 
                    />
                  </div>
                  <span className="font-bold">100% off</span>
                </div>
              </TableCell>
  
              <TableCell>
                <span className="font-bold">500 Points</span>
              </TableCell>
  
              <TableCell>Percentage Discount</TableCell>
  
              <TableCell>
                <span className="font-bold">1 Days</span>
              </TableCell>
  
              <TableCell>
                <div className="flex justify-end items-center gap-3">
                  <Switch 
                    defaultSelected 
                    size="sm"
                    classNames={{
                      wrapper: "group-data-[selected=true]:bg-green-500",
                    }}
                  />
                  <Tooltip showArrow={true} closeDelay={0} content="Edit">
                    <button className="bg-gray-700 rounded-lg p-1.5 hover:bg-gray-800 transition-colors">
                      <SquarePen
                        size={14}
                        className="text-white cursor-pointer"
                      />
                    </button>
                  </Tooltip>
                  <Tooltip showArrow={true} closeDelay={0} content="Delete">
                    <button className="bg-red-100 rounded-lg p-1.5 hover:bg-red-200 transition-colors">
                      <Trash2
                        size={14}
                        className="text-red-600 cursor-pointer"
                      />
                    </button>
                  </Tooltip>
                </div>
              </TableCell>
            </TableRow>

            <TableRow key="7">
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="border border-[#DEDEDE] rounded-lg p-2 w-10 h-10 max-w-10 max-h-10 flex items-center justify-center">
                    <Image 
                      src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/percentage-discount.svg`} 
                      width={24} 
                      height={24} 
                      alt="Percentage Discount" 
                      priority 
                    />
                  </div>
                  <span className="font-bold">100% off</span>
                </div>
              </TableCell>
  
              <TableCell>
                <span className="font-bold">500 Points</span>
              </TableCell>
  
              <TableCell>Percentage Discount</TableCell>
  
              <TableCell>
                <span className="font-bold">1 Days</span>
              </TableCell>
  
              <TableCell>
                <div className="flex justify-end items-center gap-3">
                  <Switch 
                    defaultSelected 
                    size="sm"
                    classNames={{
                      wrapper: "group-data-[selected=true]:bg-green-500",
                    }}
                  />
                  <Tooltip showArrow={true} closeDelay={0} content="Edit">
                    <button className="bg-gray-700 rounded-lg p-1.5 hover:bg-gray-800 transition-colors">
                      <SquarePen
                        size={14}
                        className="text-white cursor-pointer"
                      />
                    </button>
                  </Tooltip>
                  <Tooltip showArrow={true} closeDelay={0} content="Delete">
                    <button className="bg-red-100 rounded-lg p-1.5 hover:bg-red-200 transition-colors">
                      <Trash2
                        size={14}
                        className="text-red-600 cursor-pointer"
                      />
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
  