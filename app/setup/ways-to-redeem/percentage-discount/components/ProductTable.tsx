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

interface ProductTableProps {
  items?: Array<{
    value: string;
    type: string;
    src: string;
    pointRequired?: string;
    productUrl?: string;
    ids?: string;
    price?: string;
    variantId?: string;
    productId?: string;
  }>;
  onRemove?: (index: number) => void;
  type?: "product" | "collection";
}

export default function ProductTable({
  items = [],
  onRemove,
  type = "product",
}: ProductTableProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="tierTable border border-[#DEDEDE] rounded-lg overflow-hidden">
      <Table
        aria-label="Selected products table"
        shadow="none"
        removeWrapper
        classNames={{
          th: "bg-[#F7F7F7] text-xs font-normal text-[#616161] px-3 py-2",
          td: "text-xs text-[#2E2E2E] px-3 py-2 border-t border-[#E3E3E3]",
        }}
      >
        <TableHeader>
          <TableColumn className="!rounded-bl-none pl-3">Image</TableColumn>
          <TableColumn>Product</TableColumn>
          <TableColumn>Type</TableColumn>
          <TableColumn className="!rounded-br-none" align="end">
            Action
          </TableColumn>
        </TableHeader>

        <TableBody emptyContent="No products selected">
          {items.map((item, index) => (
            <TableRow key={`${item.ids || item.value}-${index}`}>
              <TableCell className="flex items-center gap-2">
                <div className="w-8 h-8 max-w-[36px] max-h-[36px] border border-[#DEDEDE] rounded-lg overflow-hidden">
                  {item.src ? (
                    <Image
                      src={item.src}
                      alt={item.value}
                      width={36}
                      height={36}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to placeholder if image fails to load
                        (e.target as HTMLImageElement).src = `${process.env.NEXT_PUBLIC_BASE_PATH}/images/placeholder-product.png`;
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
                    {item.value}
                  </span>
                  {item.productUrl && (
                    <a
                      href={item.productUrl}
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
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-green-100 text-green-700">
                  {type === "product" ? "Product" : "Collection"}
                </span>
              </TableCell>

              <TableCell>
                {onRemove && (
                  <Tooltip showArrow={true} closeDelay={0} content="Delete">
                    <button
                      onClick={() => onRemove(index)}
                      className="bg-red-100 rounded-lg p-1.5 hover:bg-red-200 transition-colors"
                    >
                      <Trash2 size={14} className="text-red-600 cursor-pointer" />
                    </button>
                  </Tooltip>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
