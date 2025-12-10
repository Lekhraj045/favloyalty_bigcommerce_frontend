import {
    Table,
    TableHeader,
    TableBody,
    TableColumn,
    TableRow,
    TableCell,
  } from "@heroui/table";
  import { Button } from "@heroui/button";
import { SquarePen } from "lucide-react";
  
  export default function TierTable() {
    return (
      <div className="tierTable border border-[#DEDEDE] rounded-lg overflow-hidden">
        <Table
          aria-label="Tier points table"
          shadow="none"
          removeWrapper
          classNames={{
            th: "bg-[#F7F7F7] text-xs font-normal text-[#616161] px-1.5 py-2",
            td: "text-xs text-foreground-600 px-3 py-2 border-t border-[#e3e3e3] px-1.5 py-2",
            tbody: "-mt-1"
          }}
        >
          <TableHeader>
            <TableColumn className="!rounded-bl-none pl-3">
              Title
            </TableColumn>
            <TableColumn className="">
              Tier 1
            </TableColumn>
            <TableColumn className="">
              Tier 2
            </TableColumn>
            <TableColumn className="">
              Tier 3
            </TableColumn>
            <TableColumn className="!rounded-br-none"
              align="end"
            >
              <button className="bg-transparent border-none p-0 mr-2 cursor-pointer">
                <SquarePen width={16} height={16} />
              </button>
            </TableColumn>
          </TableHeader>  
          
          <TableBody>
            <TableRow key="1">
              <TableCell className="pl-3">
                Tier Name
              </TableCell>
              <TableCell>Silver</TableCell>
              <TableCell>Gold</TableCell>
              <TableCell>Platinum</TableCell>
              <TableCell>&nbsp;</TableCell>
            </TableRow>
  
            <TableRow key="2">
              <TableCell className="pl-3">
                Points Required
              </TableCell>
              <TableCell>0</TableCell>
              <TableCell>1000</TableCell>
              <TableCell>5000</TableCell>
              <TableCell>&nbsp;</TableCell>
            </TableRow>
  
            <TableRow key="3">
              <TableCell className="pl-3">
                Point Multiplier
              </TableCell>
              <TableCell>1</TableCell>
              <TableCell>1.2</TableCell>
              <TableCell>1.5</TableCell>
              <TableCell>&nbsp;</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }
  