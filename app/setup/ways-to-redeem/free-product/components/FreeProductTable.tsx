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

interface FreeProductTableProps {
  products?: Array<{
    id: number;
    name: string;
    imageUrl: string;
    url?: string;
    pointRequired: string;
  }>;
  onRemove?: (index: number) => void;
  onPointRequiredChange?: (index: number, value: string) => void;
}

export default function FreeProductTable({
  products = [],
  onRemove,
  onPointRequiredChange,
}: FreeProductTableProps) {
  if (products.length === 0) {
    return null;
  }

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

        <TableBody emptyContent="No products selected">
          {products.map((product, index) => (
            <TableRow key={`${product.id}-${index}`}>
              <TableCell>
                <div className="w-8 h-8 max-w-[36px] max-h-[36px] border border-[#DEDEDE] rounded-lg overflow-hidden">
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      width={36}
                      height={36}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to placeholder if image fails to load
                        (e.target as HTMLImageElement).src =
                          `${process.env.NEXT_PUBLIC_BASE_PATH}/images/placeholder-product.png`;
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <span className="text-[8px] text-gray-400">No Img</span>
                    </div>
                  )}
                </div>
              </TableCell>

              <TableCell>
                <div className="flex items-center gap-2">
                  <span className="text-xs max-w-[400px] truncate">
                    {product.name}
                  </span>
                  {product.url && (
                    <a
                      href={product.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              </TableCell>

              <TableCell>
                <div className="flex flex-col gap-1">
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={product.pointRequired}
                    onChange={(e) => {
                      if (onPointRequiredChange) {
                        onPointRequiredChange(index, e.target.value);
                      }
                    }}
                    onKeyDown={(e) => {
                      // Allow: backspace, delete, tab, escape, enter, and numbers
                      if (
                        [46, 8, 9, 27, 13, 110, 190].indexOf(e.keyCode) !==
                          -1 ||
                        // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                        (e.keyCode === 65 && e.ctrlKey === true) ||
                        (e.keyCode === 67 && e.ctrlKey === true) ||
                        (e.keyCode === 86 && e.ctrlKey === true) ||
                        (e.keyCode === 88 && e.ctrlKey === true) ||
                        // Allow: home, end, left, right
                        (e.keyCode >= 35 && e.keyCode <= 39)
                      ) {
                        return;
                      }
                      // Ensure that it is a number and stop the keypress
                      if (
                        (e.shiftKey || e.keyCode < 48 || e.keyCode > 57) &&
                        (e.keyCode < 96 || e.keyCode > 105)
                      ) {
                        e.preventDefault();
                      }
                    }}
                    placeholder="Enter points (1-999,999)"
                    className="w-full h-8 border border-[#8a8a8a] rounded-lg px-3 text-[13px] leading-none focus:outline-none bg-[#fdfdfd]"
                  />
                  <p className="text-[11px] text-gray-500">
                    Maximum 999,999 points
                  </p>
                </div>
              </TableCell>

              <TableCell>
                <div className="flex justify-end items-start pt-0">
                  {onRemove && (
                    <Tooltip showArrow={true} closeDelay={0} content="Delete">
                      <button
                        onClick={() => onRemove(index)}
                        className="bg-red-100 rounded-lg p-1.5 hover:bg-red-200 transition-colors -mt-1"
                      >
                        <Trash2
                          size={14}
                          className="text-red-600 cursor-pointer"
                        />
                      </button>
                    </Tooltip>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
