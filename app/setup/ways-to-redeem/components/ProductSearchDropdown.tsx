"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import Image from "next/image";
import { getProducts, type BigCommerceProduct } from "@/utils/api";
import { getStoreId } from "@/utils/api";
import { useAppSelector } from "@/store/hooks";

interface ProductSearchDropdownProps {
  onSelectProduct: (product: BigCommerceProduct) => void;
  selectedProducts?: BigCommerceProduct[];
  type?: "product" | "collection";
}

export default function ProductSearchDropdown({
  onSelectProduct,
  selectedProducts = [],
  type = "product",
}: ProductSearchDropdownProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<BigCommerceProduct[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const selectedChannel = useAppSelector(
    (state) => state.channel.selectedChannel
  );
  const storeId = getStoreId();
  const channelId = selectedChannel?.id || null;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch products when search query changes
  useEffect(() => {
    if (!storeId) {
      setError("Store ID not found");
      return;
    }

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce search
    searchTimeoutRef.current = setTimeout(async () => {
      if (searchQuery.trim().length === 0) {
        setProducts([]);
        setIsOpen(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await getProducts(
          storeId,
          channelId,
          searchQuery.trim(),
          50,
          1
        );

        if (response.success && response.data) {
          // Filter out already selected products
          const selectedIds = new Set(selectedProducts.map((p) => p.id));
          const filteredProducts = response.data.filter(
            (product) => !selectedIds.has(product.id)
          );
          setProducts(filteredProducts);
          setIsOpen(filteredProducts.length > 0);
        } else {
          setProducts([]);
          setIsOpen(false);
        }
      } catch (err: any) {
        console.error("Error fetching products:", err);
        setError(err.message || "Failed to fetch products");
        setProducts([]);
        setIsOpen(false);
      } finally {
        setLoading(false);
      }
    }, 300); // 300ms debounce

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, storeId, channelId, selectedProducts]);

  const handleSelectProduct = (product: BigCommerceProduct) => {
    onSelectProduct(product);
    setSearchQuery("");
    setProducts([]);
    setIsOpen(false);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setProducts([]);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            if (e.target.value.trim().length > 0) {
              setIsOpen(true);
            }
          }}
          onFocus={() => {
            if (products.length > 0) {
              setIsOpen(true);
            }
          }}
          placeholder={`Search ${type === "product" ? "Products" : "Collections"}`}
          className="w-full h-8 border border-[#8a8a8a] rounded-lg px-3 pl-9 text-[13px] leading-none focus:outline-none bg-[#fdfdfd] focus:border-blue-500"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        {searchQuery && (
          <button
            onClick={handleClearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-[#DEDEDE] rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {loading && (
            <div className="p-4 text-center text-sm text-gray-500">
              Loading...
            </div>
          )}

          {error && (
            <div className="p-4 text-center text-sm text-red-500">{error}</div>
          )}

          {!loading && !error && products.length === 0 && searchQuery.trim() && (
            <div className="p-4 text-center text-sm text-gray-500">
              No products found
            </div>
          )}

          {!loading && !error && products.length > 0 && (
            <div className="py-2">
              {products.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleSelectProduct(product)}
                  className="w-full flex items-center gap-3 px-4 py-2 hover:bg-[#f3f3f3] transition-colors text-left"
                >
                  <div className="w-10 h-10 max-w-10 max-h-10 border border-[#DEDEDE] rounded-lg overflow-hidden flex-shrink-0">
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to placeholder if image fails to load
                          (e.target as HTMLImageElement).src = `${process.env.NEXT_PUBLIC_BASE_PATH}/images/placeholder-product.png`;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <span className="text-xs text-gray-400">No Image</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {product.name}
                    </p>
                    {product.sku && (
                      <p className="text-xs text-gray-500 truncate">
                        SKU: {product.sku}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

