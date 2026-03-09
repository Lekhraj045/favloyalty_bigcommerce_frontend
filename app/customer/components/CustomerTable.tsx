"use client";
import { useAppSelector } from "@/store/hooks";
import {
  fetchAndStoreCustomers,
  getCustomers,
  getStoreId,
  type Customer,
} from "@/utils/api";
import useDebounce from "@/utils/useDebounce";
import { Button } from "@heroui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/table";
import { Tooltip } from "@heroui/tooltip";
import { Eye, Plus, Search, SquarePen, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import AdjustCustomerPointsModal from "./AdjustCustomerPointsModal";

export default function CustomerTable() {
  const router = useRouter();
  const { selectedChannel } = useAppSelector((state) => state.channel);
  const [searchKeyword, setSearchKeyword] = useState("");
  const debouncedSearchKeyword = useDebounce({
    value: searchKeyword,
    delay: 300,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [exportingJSON, setExportingJSON] = useState(false);
  const [exportingCSV, setExportingCSV] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Fetch all customers for export (without pagination)
  const fetchAllCustomers = useCallback(async (): Promise<Customer[]> => {
    const storeId = getStoreId();
    if (!storeId || !selectedChannel || !selectedChannel.channel_id) {
      throw new Error("Store ID or Channel not available");
    }

    const allCustomers: Customer[] = [];
    let currentPage = 1;
    let hasMore = true;

    while (hasMore) {
      try {
        const response = await getCustomers(
          storeId,
          selectedChannel.channel_id,
          currentPage,
          50, // Use same limit as regular fetch
        );

        allCustomers.push(...response.data);

        if (currentPage >= response.pagination.totalPages) {
          hasMore = false;
        } else {
          currentPage++;
        }
      } catch (err) {
        console.error("Error fetching customers for export:", err);
        throw err;
      }
    }

    return allCustomers;
  }, [selectedChannel]);

  const handleExportJSON = async () => {
    if (!selectedChannel || !selectedChannel.channel_id) {
      setError("Please select a channel to export customers");
      return;
    }

    try {
      setExportingJSON(true);
      setError(null);

      const allCustomers = await fetchAllCustomers();

      // Format customer data for export
      const exportData = allCustomers.map((customer) => ({
        customerId: customer.id,
        email: customer.email,
        shop: customer.shop || "",
        firstName: customer.firstName || "",
        lastName: customer.lastName || "",
        points: customer.points || 0,
        pointsEarned: customer.pointsEarned || 0,
        pointsRedeemed: customer.pointsRedeemed || 0,
        currentTier: customer.currentTier || null,
        tierDisplay: customer.tierDisplay || "None",
        ordersCount: customer.ordersCount || 0,
        totalSpent: customer.totalSpent || 0,
        joiningDate: customer.joiningDate,
        lastVisit: customer.lastVisit || null,
        referralCount: customer.refferalCount || 0,
        bcCustomerId: customer.bcCustomerId || null,
        channelId: customer.channelId,
        tags: customer.tags || [],
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt,
      }));

      // Create JSON blob
      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      // Create download link
      const link = document.createElement("a");
      link.href = url;
      link.download = `customers_${selectedChannel.channel_id}_${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error exporting JSON:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to export customers as JSON",
      );
    } finally {
      setExportingJSON(false);
    }
  };

  const handleExportCSV = async () => {
    if (!selectedChannel || !selectedChannel.channel_id) {
      setError("Please select a channel to export customers");
      return;
    }

    try {
      setExportingCSV(true);
      setError(null);

      const allCustomers = await fetchAllCustomers();

      // Define CSV headers
      const headers = [
        "Customer ID",
        "Email",
        "Shop",
        "First Name",
        "Last Name",
        "Points",
        "Points Earned",
        "Points Redeemed",
        "Tier Display",
        "Tier Index",
        "Tier Multiplier",
        "Tier Min Points Required",
        "Tier Max Points",
        "Orders Count",
        "Total Spent",
        "Joining Date",
        "Last Visit",
        "Referral Count",
        "BC Customer ID",
        "Channel ID",
        "Tags",
        "Created At",
        "Updated At",
      ];

      // Convert customers to CSV rows
      const csvRows = [
        headers.join(","), // Header row
        ...allCustomers.map((customer) => {
          const tier = customer.currentTier || {};
          const tags = (customer.tags || []).join(";"); // Join tags with semicolon

          return [
            `"${customer.id}"`,
            `"${customer.email || ""}"`,
            `"${(customer.shop || "").replace(/"/g, '""')}"`,
            `"${(customer.firstName || "").replace(/"/g, '""')}"`,
            `"${(customer.lastName || "").replace(/"/g, '""')}"`,
            customer.points || 0,
            customer.pointsEarned || 0,
            customer.pointsRedeemed || 0,
            `"${customer.tierDisplay || "None"}"`,
            tier.tierIndex ?? "",
            tier.multiplier ?? "",
            tier.minPointsRequired ?? "",
            tier.maxPoints ?? "",
            customer.ordersCount || 0,
            customer.totalSpent || 0,
            `"${customer.joiningDate ? new Date(customer.joiningDate).toISOString() : ""}"`,
            `"${customer.lastVisit ? new Date(customer.lastVisit).toISOString() : ""}"`,
            customer.refferalCount || 0,
            customer.bcCustomerId || "",
            customer.channelId,
            `"${tags}"`,
            `"${customer.createdAt ? new Date(customer.createdAt).toISOString() : ""}"`,
            `"${customer.updatedAt ? new Date(customer.updatedAt).toISOString() : ""}"`,
          ].join(",");
        }),
      ];

      // Create CSV blob
      const csvString = csvRows.join("\n");
      const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);

      // Create download link
      const link = document.createElement("a");
      link.href = url;
      link.download = `customers_${selectedChannel.channel_id}_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error exporting CSV:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to export customers as CSV",
      );
    } finally {
      setExportingCSV(false);
    }
  };

  // Fetch customers from database, automatically fetch from BigCommerce if none found
  const loadCustomers = useCallback(
    async (pageNum: number = 1, autoFetch: boolean = true) => {
      const storeId = getStoreId();
      if (!storeId || !selectedChannel) {
        setError("Store ID or Channel not available");
        return;
      }

      // Ensure channel_id is available
      if (!selectedChannel.channel_id) {
        setError("Channel ID not available");
        return;
      }

      setLoading(true);
      setError(null);
      try {
        console.log("Loading customers for:", {
          storeId,
          channelId: selectedChannel.channel_id,
          page: pageNum,
        });

        const response = await getCustomers(
          storeId,
          selectedChannel.channel_id,
          pageNum,
          50,
        );

        console.log("Customers loaded:", {
          count: response.data.length,
          total: response.pagination.total,
        });

        // If no customers found and autoFetch is true, try fetching from BigCommerce
        if (
          response.data.length === 0 &&
          response.pagination.total === 0 &&
          autoFetch &&
          pageNum === 1
        ) {
          console.log(
            "No customers found in database, fetching from BigCommerce...",
          );
          try {
            const fetchResponse = await fetchAndStoreCustomers(
              storeId,
              selectedChannel.channel_id,
            );

            // Use the fetched customers
            setCustomers(fetchResponse.data);
            setPage(fetchResponse.pagination.page);
            setTotalPages(fetchResponse.pagination.totalPages);
            setTotal(fetchResponse.pagination.total);

            console.log("Customers fetched from BigCommerce:", {
              count: fetchResponse.data.length,
              total: fetchResponse.pagination.total,
              source: fetchResponse.source,
            });
          } catch (fetchErr) {
            console.error(
              "Error fetching customers from BigCommerce:",
              fetchErr,
            );
            // Still set empty customers even if fetch fails
            setCustomers([]);
            setPage(1);
            setTotalPages(1);
            setTotal(0);
            setError(
              fetchErr instanceof Error
                ? fetchErr.message
                : "Failed to fetch customers from BigCommerce",
            );
          }
        } else {
          setCustomers(response.data);
          setPage(response.pagination.page);
          setTotalPages(response.pagination.totalPages);
          setTotal(response.pagination.total);
        }
      } catch (err) {
        console.error("Error loading customers:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load customers",
        );
      } finally {
        setLoading(false);
      }
    },
    [selectedChannel],
  );

  // Load customers when component mounts or channel changes
  useEffect(() => {
    if (selectedChannel && selectedChannel.channel_id) {
      // Clear existing customers when channel changes
      setCustomers([]);
      setPage(1);
      setTotalPages(1);
      setTotal(0);
      // Load customers for the new channel
      loadCustomers(1);
    } else {
      // Clear customers if no channel is selected
      setCustomers([]);
      setPage(1);
      setTotalPages(1);
      setTotal(0);
    }
  }, [selectedChannel?.channel_id, loadCustomers]);

  // Filter customers based on search keyword
  const filteredCustomers = useMemo(
    () =>
      customers.filter((customer) => {
        if (!debouncedSearchKeyword) return true;
        const keyword = debouncedSearchKeyword.toLowerCase();
        const fullName =
          `${customer.firstName || ""} ${customer.lastName || ""}`.toLowerCase();
        const email = customer.email.toLowerCase();
        return fullName.includes(keyword) || email.includes(keyword);
      }),
    [customers, debouncedSearchKeyword],
  );

  // Get tier name from customer data (uses tierDisplay from API if available)
  const getTierName = (customer: Customer) => {
    // Use tierDisplay from API if available (handles "None" case)
    if (customer.tierDisplay !== undefined) {
      return customer.tierDisplay;
    }
    // Fallback to calculating from tierIndex
    const tierIndex = customer.currentTier?.tierIndex || 0;
    const tiers = ["Silver", "Gold", "Platinum", "Diamond"];
    return tiers[tierIndex] || "Bronze";
  };

  // Get tier badge color
  const getTierBadgeColor = (customer: Customer) => {
    // If tierDisplay is "None", use a neutral color
    if (customer.tierDisplay === "None" || !customer.tierStatus) {
      return "bg-[#E5E5E5] text-[#666666]";
    }
    const tierIndex = customer.currentTier?.tierIndex || 0;
    const colors = [
      "bg-[#F0F0F0] text-[#303030]",
      "bg-[#FFEB78] text-[#4f4700]",
      "bg-[#d5ebff] text-[#003a5a]",
      "bg-[#e8d5ff] text-[#4a1a6b]",
    ];
    return colors[tierIndex] || colors[0];
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
              isDisabled={!selectedChannel || exportingJSON}
              isLoading={exportingJSON}
            >
              Export All Customers as JSON
            </Button>
            <Button
              variant="flat"
              onPress={handleExportCSV}
              className="custom-btn-default"
              isDisabled={!selectedChannel || exportingCSV}
              isLoading={exportingCSV}
            >
              Export All Customers as CSV
            </Button>
            <Button onPress={() => setIsModalOpen(true)} className="custom-btn">
              <Plus size={16} />
              Adjust Customer Points
            </Button>
          </div>
        </div>

        <div className="p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
          {!selectedChannel && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm">
              Please select a channel to view customers.
            </div>
          )}
          <div className="tierTable border border-[#DEDEDE] rounded-lg overflow-hidden">
            <Table
              aria-label="Customers table"
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
                <TableColumn>BC Customer ID</TableColumn>
                <TableColumn>Total Points</TableColumn>
                <TableColumn>Referrals</TableColumn>
                <TableColumn>Tier</TableColumn>
                <TableColumn className="!rounded-br-none" align="end">
                  Action
                </TableColumn>
              </TableHeader>

              <TableBody
                emptyContent={
                  loading
                    ? "Loading customers..."
                    : !selectedChannel
                      ? "Please select a channel"
                      : filteredCustomers.length === 0 && customers.length === 0
                        ? "No customers found."
                        : "No customers match your search"
                }
              >
                {filteredCustomers.map((customer) => {
                  const fullName =
                    `${customer.firstName || ""} ${customer.lastName || ""}`.trim() ||
                    customer.email;
                  return (
                    <TableRow key={customer.id}>
                      <TableCell>{fullName}</TableCell>
                      <TableCell>{customer.email}</TableCell>
                      <TableCell>{customer.bcCustomerId || "N/A"}</TableCell>
                      <TableCell>{customer.points || 0}</TableCell>
                      <TableCell>{customer.refferalCount || 0}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${getTierBadgeColor(customer)}`}
                        >
                          {getTierName(customer)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-4 text-gray-500">
                          <Tooltip
                            showArrow={true}
                            closeDelay={0}
                            content="Edit"
                          >
                            <SquarePen
                              size={14}
                              className="cursor-pointer hover:text-black"
                              onClick={() =>
                                router.push(
                                  `/customer/customer-details?id=${customer.id}`,
                                )
                              }
                            />
                          </Tooltip>
                          <Tooltip
                            showArrow={true}
                            closeDelay={0}
                            content="View in Bigcommerce"
                          >
                            <Eye
                              size={14}
                              className="cursor-pointer hover:text-black"
                              onClick={() =>
                                router.push(
                                  `/customer/customer-details?id=${customer.id}&viewOnly=1`,
                                )
                              }
                            />
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-600">
                Showing {(page - 1) * 50 + 1} to {Math.min(page * 50, total)} of{" "}
                {total} customers
              </div>
              <div className="flex gap-2">
                <Button
                  variant="flat"
                  size="sm"
                  onPress={() => loadCustomers(page - 1)}
                  isDisabled={page === 1 || loading}
                  className="custom-btn-default"
                >
                  Previous
                </Button>
                <Button
                  variant="flat"
                  size="sm"
                  onPress={() => loadCustomers(page + 1)}
                  isDisabled={page === totalPages || loading}
                  className="custom-btn-default"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <AdjustCustomerPointsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          // Reload customers after successful import
          loadCustomers(page);
        }}
      />
    </>
  );
}
