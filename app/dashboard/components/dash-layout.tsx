"use client";

import { useAppSelector } from "@/store/hooks";
import {
  getCustomers,
  getPoints,
  getPointsAwardedStats,
  getPointsRedeemedStats,
  getStoreId,
  type Customer,
  type PointData,
  type PointsAwardedStat,
  type PointsRedeemedStat,
} from "@/utils/api";
import { Button } from "@heroui/button";
import { DateRangePicker } from "@heroui/date-picker";
import { Divider } from "@heroui/divider";
import { Tab, Tabs } from "@heroui/tabs";
import { DateValue, today } from "@internationalized/date";
import { ArrowDown, ArrowUp, MoveHorizontal } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import CampaignTableArea from "./CampaignTable";

// Dynamic tier counts: tierIndex -> { total, new }
type TierCounts = Record<number, { total: number; new: number }>;

// Calculate default date range: 15 days ago to today
const getDefaultDateRange = (): { start: DateValue; end: DateValue } => {
  const todayDate = today("UTC");
  const fifteenDaysAgo = todayDate.subtract({ days: 15 });
  return {
    start: fifteenDaysAgo,
    end: todayDate,
  };
};

export default function DashLayout() {
  const router = useRouter();
  const selectedChannel = useAppSelector(
    (state) => state.channel.selectedChannel,
  );
  const [campaignTierStatus, setCampaignTierStatus] = useState<boolean | null>(
    null,
  );

  const [dateRange, setDateRange] = useState<{
    start: DateValue | null;
    end: DateValue | null;
  }>(getDefaultDateRange());
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [newCustomers, setNewCustomers] = useState<Customer[]>([]);
  const [tierCounts, setTierCounts] = useState<TierCounts>({});
  const [pointsConfig, setPointsConfig] = useState<PointData | null>(null);
  const [loading, setLoading] = useState(false);
  const [pointsAwardedStats, setPointsAwardedStats] = useState<
    PointsAwardedStat[]
  >([]);
  const [totalPointsAwarded, setTotalPointsAwarded] = useState(0);
  const [equivalentPointsAwarded, setEquivalentPointsAwarded] = useState(0);
  const [pointsLoading, setPointsLoading] = useState(false);
  const [pointsRedeemedStats, setPointsRedeemedStats] = useState<
    PointsRedeemedStat[]
  >([]);
  const [totalPointsRedeemed, setTotalPointsRedeemed] = useState(0);
  const [pointsRedeemedLoading, setPointsRedeemedLoading] = useState(false);
  const storeCurrency = useAppSelector((state) => state.channel.storeCurrency);

  const today = new Date();
  today.setHours(23, 59, 59, 999); // Set to end of today

  const isDateUnavailable = (date: DateValue) => {
    const dateObj = date.toDate
      ? date.toDate("UTC")
      : new Date(date.toString());
    return dateObj > today;
  };

  // Fetch all customers for the selected channel
  const fetchAllCustomers = useCallback(async () => {
    if (!selectedChannel?.channel_id) {
      setCustomers([]);
      setNewCustomers([]);
      setTierCounts({});
      return;
    }

    setLoading(true);
    try {
      const storeId = getStoreId();
      if (!storeId) {
        console.error("Store ID not found");
        return;
      }

      // Fetch all customers (without pagination limit)
      const allCustomers: Customer[] = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const response = await getCustomers(
          storeId,
          selectedChannel.channel_id,
          page,
          100, // Fetch 100 per page
        );

        if (response.data && response.data.length > 0) {
          allCustomers.push(...response.data);
          page++;
          hasMore = response.pagination.page < response.pagination.totalPages;
        } else {
          hasMore = false;
        }
      }

      setCustomers(allCustomers);

      // Filter new customers based on date range
      let filteredNewCustomers: Customer[] = [];
      if (dateRange.start && dateRange.end) {
        const startDate = dateRange.start.toDate
          ? dateRange.start.toDate("UTC")
          : new Date(dateRange.start.toString());
        const endDate = dateRange.end.toDate
          ? dateRange.end.toDate("UTC")
          : new Date(dateRange.end.toString());
        endDate.setHours(23, 59, 59, 999); // Set to end of day

        filteredNewCustomers = allCustomers.filter((customer) => {
          const customerDate = customer.createdAt
            ? new Date(customer.createdAt)
            : customer.joiningDate
              ? new Date(customer.joiningDate)
              : null;

          if (!customerDate) return false;

          return customerDate >= startDate && customerDate <= endDate;
        });
      }

      setNewCustomers(filteredNewCustomers);

      // Calculate tier counts (dynamic - supports any number of tiers)
      const counts: TierCounts = {};

      const addToCount = (tierIndex: number, isNew: boolean) => {
        if (!counts[tierIndex]) counts[tierIndex] = { total: 0, new: 0 };
        counts[tierIndex].total++;
        if (isNew) counts[tierIndex].new++;
      };

      allCustomers.forEach((customer) => {
        const tierIndex = customer.currentTier?.tierIndex ?? 0;
        const isNew = filteredNewCustomers.some(
          (c) =>
            c.id === customer.id || c.bcCustomerId === customer.bcCustomerId,
        );
        addToCount(tierIndex, isNew);
      });

      setTierCounts(counts);
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedChannel?.channel_id, dateRange]);

  // Fetch points awarded statistics
  const fetchPointsAwardedStats = useCallback(async () => {
    if (!selectedChannel?.id || !dateRange.start || !dateRange.end) {
      setPointsAwardedStats([]);
      setTotalPointsAwarded(0);
      setEquivalentPointsAwarded(0);
      return;
    }

    setPointsLoading(true);
    try {
      const storeId = getStoreId();
      if (!storeId) {
        console.error("Store ID not found");
        return;
      }

      const startDate = dateRange.start.toDate
        ? dateRange.start.toDate("UTC")
        : new Date(dateRange.start.toString());
      const endDate = dateRange.end.toDate
        ? dateRange.end.toDate("UTC")
        : new Date(dateRange.end.toString());
      endDate.setHours(23, 59, 59, 999);

      const response = await getPointsAwardedStats(
        storeId,
        selectedChannel.id,
        startDate.toISOString(),
        endDate.toISOString(),
      );

      if (response.success && response.data) {
        setPointsAwardedStats(response.data.stats);
        setTotalPointsAwarded(response.data.totalPointsAwarded);
        setEquivalentPointsAwarded(response.data.totalPointsAwardedEquivalent);
      }
    } catch (error) {
      console.error("Error fetching points awarded stats:", error);
      setPointsAwardedStats([]);
      setTotalPointsAwarded(0);
      setEquivalentPointsAwarded(0);
    } finally {
      setPointsLoading(false);
    }
  }, [selectedChannel?.id, dateRange]);

  // Fetch customers when channel or date range changes
  useEffect(() => {
    fetchAllCustomers();
  }, [fetchAllCustomers]);

  // Fetch points awarded stats when channel or date range changes
  useEffect(() => {
    fetchPointsAwardedStats();
  }, [fetchPointsAwardedStats]);

  // Fetch points redeemed statistics
  const fetchPointsRedeemedStats = useCallback(async () => {
    if (!selectedChannel?.id || !dateRange.start || !dateRange.end) {
      setPointsRedeemedStats([]);
      setTotalPointsRedeemed(0);
      return;
    }
    setPointsRedeemedLoading(true);
    try {
      const storeId = getStoreId();
      if (!storeId) return;
      const startDate = dateRange.start.toDate
        ? dateRange.start.toDate("UTC")
        : new Date(dateRange.start.toString());
      const endDate = dateRange.end.toDate
        ? dateRange.end.toDate("UTC")
        : new Date(dateRange.end.toString());
      endDate.setHours(23, 59, 59, 999);
      const response = await getPointsRedeemedStats(
        storeId,
        selectedChannel.id,
        startDate.toISOString(),
        endDate.toISOString(),
      );
      if (response.success && response.data) {
        setPointsRedeemedStats(response.data.stats);
        setTotalPointsRedeemed(response.data.totalPointsRedeemed);
      }
    } catch (error) {
      console.error("Error fetching points redeemed stats:", error);
      setPointsRedeemedStats([]);
      setTotalPointsRedeemed(0);
    } finally {
      setPointsRedeemedLoading(false);
    }
  }, [selectedChannel?.id, dateRange]);

  useEffect(() => {
    fetchPointsRedeemedStats();
  }, [fetchPointsRedeemedStats]);

  // Fetch points config (tier names) when channel changes
  const fetchPointsConfig = useCallback(async () => {
    if (!selectedChannel?.id) {
      setPointsConfig(null);
      return;
    }
    const storeId = getStoreId();
    if (!storeId) return;
    try {
      const data = await getPoints(storeId, selectedChannel.id);
      setPointsConfig(data);
    } catch {
      setPointsConfig(null);
    }
  }, [selectedChannel?.id]);

  useEffect(() => {
    fetchPointsConfig();
  }, [fetchPointsConfig]);

  const totalMembers = customers.length;
  const newMembers = newCustomers.length;

  // Helper function to get stats for a transaction type
  const getStatForTransaction = (
    transactionName: string,
  ): PointsAwardedStat | null => {
    return (
      pointsAwardedStats.find(
        (stat) => stat.transactionName === transactionName,
      ) || null
    );
  };

  const getStatForRedeemed = (
    transactionName: string,
  ): PointsRedeemedStat | null => {
    return (
      pointsRedeemedStats.find((s) => s.transactionName === transactionName) ??
      null
    );
  };

  // Calculate currency value (assuming 1000 points = 1 currency unit)
  const pointsToCurrency = (points: number): number => {
    return points / 1000;
  };

  // Helper to render growth indicator
  const renderGrowthIndicator = (growth: number) => {
    if (growth > 0) {
      return (
        <div className="flex items-center gap-1 bg-[#219653] text-white px-2 py-0.5 rounded-full text-xs">
          <span>{Math.abs(growth).toFixed(0)}%</span>
          <span>
            <ArrowUp strokeWidth={3} className="w-3 h-3 text-white" />
          </span>
        </div>
      );
    } else if (growth < 0) {
      return (
        <div className="flex items-center gap-1 bg-[#F95353] text-white px-2 py-0.5 rounded-full text-xs">
          <span>{Math.abs(growth).toFixed(0)}%</span>
          <span>
            <ArrowDown strokeWidth={3} className="w-3 h-3 text-white" />
          </span>
        </div>
      );
    } else {
      return <MoveHorizontal className="w-4 h-4 text-[#303030]" />;
    }
  };
  return (
    <>
      <div className="card !p-0">
        <div className="flex w-full flex-col relative">
          <Tabs
            aria-label="Options"
            variant="solid"
            size="sm"
            color="success"
            classNames={{
              tabList: "bg-transparent gap-0 p-0 rounded-none",
              cursor: "bg-[#EBEBEB]",
              tabContent:
                "text-[#414141] group-data-[selected=true]:text-[#303030] group-data-[selected=true]:bg-[#EBEBEB] font-medium px-3 py-1 group-data-[selected=true]:rounded-md",
              tab: "text-[13px] p-0 rounded-md",
              panel: "p-0",
              base: "p-4",
            }}
          >
            <Tab key="reward-program-summary" title="Reward Program Summary">
              <div className="absolute right-4 top-[14px]">
                <DateRangePicker
                  className="selectorButton"
                  showMonthAndYearPickers
                  visibleMonths={2}
                  variant="bordered"
                  isDateUnavailable={isDateUnavailable}
                  value={
                    dateRange.start && dateRange.end
                      ? { start: dateRange.start, end: dateRange.end }
                      : null
                  }
                  onChange={(range) => {
                    if (range && range.start && range.end) {
                      setDateRange({
                        start: range.start,
                        end: range.end,
                      });
                    } else {
                      // Reset to default 15 days range if cleared
                      setDateRange(getDefaultDateRange());
                    }
                  }}
                  classNames={{
                    inputWrapper:
                      "border border-[#EBEBEB] bg-white focus:ring-0 focus:border-[#EBEBEB] cursor-pointer",
                    input: "cursor-pointer",
                    selectorButton: "cursor-pointer",
                  }}
                  size="sm"
                />
              </div>

              <div className="border-t border-[#e5e7eb] p-4">
                <div className="flex flex-col gap-4">
                  {/* Member Overview Section */}
                  <div className="card default-card">
                    <div className="flex items-center mb-4">
                      <div className="flex gap-2 items-center">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-bold text-[#303030]">
                            Total Members:
                          </span>
                          <span className="text-base font-bold text-[#219653]">
                            {loading ? "..." : totalMembers}
                          </span>
                        </div>

                        <Divider orientation="vertical" className="h-5 mx-2" />

                        <div className="flex items-center gap-2">
                          <span className="text-base font-bold text-[#303030]">
                            New Members:
                          </span>
                          <span className="text-base font-bold text-[#303030]">
                            {loading ? "..." : newMembers}
                          </span>
                        </div>
                      </div>
                    </div>

                    {pointsConfig?.tierStatus &&
                    (pointsConfig.tier?.length ?? 0) > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {pointsConfig.tier!.map((tier, tierIndex) => {
                          const count = tierCounts[tierIndex] ?? {
                            total: 0,
                            new: 0,
                          };
                          return (
                            <div key={tier._id ?? tierIndex} className="card">
                              <div className="flex flex-col gap-2">
                                <span className="text-sm font-bold text-[#303030]">
                                  {tier.tierName}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="text-xl font-bold text-[#303030]">
                                    {loading ? "..." : count.total}
                                  </span>
                                  {count.new > 0 ? (
                                    <div className="flex items-center gap-1 bg-[#219653] text-white px-2 py-0.5 rounded-full text-xs">
                                      <span>{count.new}</span>
                                      <span>
                                        <ArrowUp
                                          strokeWidth={3}
                                          className="w-3 h-3 text-white"
                                        />
                                      </span>
                                    </div>
                                  ) : (
                                    <MoveHorizontal className="w-4 h-4 text-[#303030]" />
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-[#666]">
                        Tier system is disabled. Enable tiers in Points & Tier
                        System to see tier breakdown.
                      </p>
                    )}
                  </div>

                  {/* Points Awarded Section */}
                  <div className="card default-card">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-[#303030]">
                          Points Awarded:
                        </span>
                        <span className="text-base font-bold text-[#219653]">
                          {pointsLoading
                            ? "..."
                            : totalPointsAwarded.toLocaleString()}
                        </span>
                      </div>
                      <div className="text-sm text-[#303030]">
                        <span className="font-bold">
                          {pointsLoading
                            ? "..."
                            : `${totalPointsAwarded.toLocaleString()} = ${storeCurrency || "USD"}. ${Number(equivalentPointsAwarded).toFixed(2)}`}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {/* Sign Up Bonus */}
                      <div className="card">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2.5">
                            <Image
                              src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/signup-dash-icon.svg`}
                              alt="Sign Up Bonus"
                              width={18}
                              height={18}
                            />
                            <span className="text-sm font-bold">
                              Sign Up Bonus
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-[#303030]">
                              {pointsLoading
                                ? "..."
                                : (
                                    getStatForTransaction("Sign Up Bonus")
                                      ?.totalPointsCurrent || 0
                                  ).toLocaleString()}
                            </span>
                            {!pointsLoading &&
                              getStatForTransaction("Sign Up Bonus") &&
                              renderGrowthIndicator(
                                getStatForTransaction("Sign Up Bonus")!.growth,
                              )}
                            {!pointsLoading &&
                              !getStatForTransaction("Sign Up Bonus") && (
                                <MoveHorizontal className="w-4 h-4 text-[#303030]" />
                              )}
                          </div>
                        </div>
                      </div>

                      {/* Referral */}
                      <div className="card">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2.5">
                            <Image
                              src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/referral-dash-icon.svg`}
                              alt="Referral"
                              width={18}
                              height={18}
                            />
                            <span className="text-sm font-bold">Referral</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-[#303030]">
                              {pointsLoading
                                ? "..."
                                : (
                                    getStatForTransaction("Referral")
                                      ?.totalPointsCurrent || 0
                                  ).toLocaleString()}
                            </span>
                            {!pointsLoading &&
                              getStatForTransaction("Referral") &&
                              renderGrowthIndicator(
                                getStatForTransaction("Referral")!.growth,
                              )}
                            {!pointsLoading &&
                              !getStatForTransaction("Referral") && (
                                <MoveHorizontal className="w-4 h-4 text-[#303030]" />
                              )}
                          </div>
                        </div>
                      </div>

                      {/* Purchase Product */}
                      <div className="card">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2.5">
                            <Image
                              src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/purchase-product-dash-icon.svg`}
                              alt="Purchase Product"
                              width={18}
                              height={18}
                            />
                            <span className="text-sm font-bold">
                              Purchase Product
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-[#303030]">
                              {pointsLoading
                                ? "..."
                                : (
                                    getStatForTransaction("Purchase Product")
                                      ?.totalPointsCurrent || 0
                                  ).toLocaleString()}
                            </span>
                            {!pointsLoading &&
                              getStatForTransaction("Purchase Product") &&
                              renderGrowthIndicator(
                                getStatForTransaction("Purchase Product")!
                                  .growth,
                              )}
                            {!pointsLoading &&
                              !getStatForTransaction("Purchase Product") && (
                                <MoveHorizontal className="w-4 h-4 text-[#303030]" />
                              )}
                          </div>
                        </div>
                      </div>

                      {/* Birthday Celebration */}
                      <div className="card">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2.5">
                            <Image
                              src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/birthday-dash-icon.svg`}
                              alt="Birthday Celebration"
                              width={18}
                              height={18}
                            />
                            <span className="text-sm font-bold">
                              Birthday Celebration
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-[#303030]">
                              {pointsLoading
                                ? "..."
                                : (
                                    getStatForTransaction(
                                      "Birthday Celebration",
                                    )?.totalPointsCurrent || 0
                                  ).toLocaleString()}
                            </span>
                            {!pointsLoading &&
                              getStatForTransaction("Birthday Celebration") &&
                              renderGrowthIndicator(
                                getStatForTransaction("Birthday Celebration")!
                                  .growth,
                              )}
                            {!pointsLoading &&
                              !getStatForTransaction(
                                "Birthday Celebration",
                              ) && (
                                <MoveHorizontal className="w-4 h-4 text-[#303030]" />
                              )}
                          </div>
                        </div>
                      </div>

                      {/* Newsletter Bonus */}
                      <div className="card">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2.5">
                            <Image
                              src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/newsletter-dash-icon.svg`}
                              alt="Newsletter Bonus"
                              width={18}
                              height={18}
                            />
                            <span className="text-sm font-bold">
                              Newsletter Bonus
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-[#303030]">
                              {pointsLoading
                                ? "..."
                                : (
                                    getStatForTransaction("Newsletter Bonus")
                                      ?.totalPointsCurrent || 0
                                  ).toLocaleString()}
                            </span>
                            {!pointsLoading &&
                              getStatForTransaction("Newsletter Bonus") &&
                              renderGrowthIndicator(
                                getStatForTransaction("Newsletter Bonus")!
                                  .growth,
                              )}
                            {!pointsLoading &&
                              !getStatForTransaction("Newsletter Bonus") && (
                                <MoveHorizontal className="w-4 h-4 text-[#303030]" />
                              )}
                          </div>
                        </div>
                      </div>

                      {/* Profile Completion */}
                      <div className="card">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2.5">
                            <Image
                              src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/profile-dash-icon.svg`}
                              alt="Profile Completion"
                              width={18}
                              height={18}
                            />
                            <span className="text-sm font-bold">
                              Profile Completion
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-[#303030]">
                              {pointsLoading
                                ? "..."
                                : (
                                    getStatForTransaction("Profile Completion")
                                      ?.totalPointsCurrent || 0
                                  ).toLocaleString()}
                            </span>
                            {!pointsLoading &&
                              getStatForTransaction("Profile Completion") &&
                              renderGrowthIndicator(
                                getStatForTransaction("Profile Completion")!
                                  .growth,
                              )}
                            {!pointsLoading &&
                              !getStatForTransaction("Profile Completion") && (
                                <MoveHorizontal className="w-4 h-4 text-[#303030]" />
                              )}
                          </div>
                        </div>
                      </div>

                      {/* Event Celebration */}
                      <div className="card">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2.5">
                            <Image
                              src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/event-dash-icon.svg`}
                              alt="Event Celebration"
                              width={18}
                              height={18}
                            />
                            <span className="text-sm font-bold">
                              Event Celebration
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-[#303030]">
                              {pointsLoading
                                ? "..."
                                : (
                                    getStatForTransaction("Event Celebration")
                                      ?.totalPointsCurrent || 0
                                  ).toLocaleString()}
                            </span>
                            {!pointsLoading &&
                              getStatForTransaction("Event Celebration") &&
                              renderGrowthIndicator(
                                getStatForTransaction("Event Celebration")!
                                  .growth,
                              )}
                            {!pointsLoading &&
                              !getStatForTransaction("Event Celebration") && (
                                <MoveHorizontal className="w-4 h-4 text-[#303030]" />
                              )}
                          </div>
                        </div>
                      </div>

                      {/* Rejoin Bonus */}
                      <div className="card">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2.5">
                            <Image
                              src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/rejoin-dash-icon.svg`}
                              alt="Rejoin Bonus"
                              width={18}
                              height={18}
                            />
                            <span className="text-sm font-bold">
                              Rejoin Bonus
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-[#303030]">
                              {pointsLoading
                                ? "..."
                                : (
                                    getStatForTransaction("Rejoin Bonus")
                                      ?.totalPointsCurrent || 0
                                  ).toLocaleString()}
                            </span>
                            {!pointsLoading &&
                              getStatForTransaction("Rejoin Bonus") &&
                              renderGrowthIndicator(
                                getStatForTransaction("Rejoin Bonus")!.growth,
                              )}
                            {!pointsLoading &&
                              !getStatForTransaction("Rejoin Bonus") && (
                                <MoveHorizontal className="w-4 h-4 text-[#303030]" />
                              )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Points Redeemed Section */}
                  <div className="card default-card">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-[#303030]">
                          Points Redeemed:
                        </span>
                        <span className="text-base font-bold text-[#219653]">
                          {pointsRedeemedLoading
                            ? "..."
                            : totalPointsRedeemed.toLocaleString()}
                        </span>
                      </div>
                      <div className="text-sm text-[#303030]">
                        <span className="font-bold">
                          {pointsRedeemedLoading
                            ? "..."
                            : `${totalPointsRedeemed.toLocaleString()} = ${storeCurrency || "USD"}. ${pointsToCurrency(totalPointsRedeemed).toFixed(2)}`}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {/* Percentage Discount */}
                      <div className="card">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2.5">
                            <Image
                              src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/percentage-dash-icon.svg`}
                              alt="Percentage Discount"
                              width={18}
                              height={18}
                            />
                            <span className="text-sm font-bold">
                              Percentage Discount
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-[#303030]">
                              {pointsRedeemedLoading
                                ? "..."
                                : (
                                    getStatForRedeemed("Percentage Discount")
                                      ?.totalPointsRedeemed ?? 0
                                  ).toLocaleString()}
                            </span>
                            {!pointsRedeemedLoading &&
                              getStatForRedeemed("Percentage Discount") &&
                              renderGrowthIndicator(
                                getStatForRedeemed("Percentage Discount")!
                                  .growth,
                              )}
                            {!pointsRedeemedLoading &&
                              !getStatForRedeemed("Percentage Discount") && (
                                <MoveHorizontal className="w-4 h-4 text-[#303030]" />
                              )}
                          </div>
                        </div>
                      </div>

                      {/* Fixed Discount */}
                      <div className="card">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2.5">
                            <Image
                              src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/fixed-discount-dash-icon.svg`}
                              alt="Fixed Discount"
                              width={18}
                              height={18}
                            />
                            <span className="text-sm font-bold">
                              Fixed Discount
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-[#303030]">
                              {pointsRedeemedLoading
                                ? "..."
                                : (
                                    getStatForRedeemed("Fixed Discount")
                                      ?.totalPointsRedeemed ?? 0
                                  ).toLocaleString()}
                            </span>
                            {!pointsRedeemedLoading &&
                              getStatForRedeemed("Fixed Discount") &&
                              renderGrowthIndicator(
                                getStatForRedeemed("Fixed Discount")!.growth,
                              )}
                            {!pointsRedeemedLoading &&
                              !getStatForRedeemed("Fixed Discount") && (
                                <MoveHorizontal className="w-4 h-4 text-[#303030]" />
                              )}
                          </div>
                        </div>
                      </div>

                      {/* Free Shipping */}
                      <div className="card">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2.5">
                            <Image
                              src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/free-shipping-dash-icon.svg`}
                              alt="Free Shipping"
                              width={18}
                              height={18}
                            />
                            <span className="text-sm font-bold">
                              Free Shipping
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-[#303030]">
                              {pointsRedeemedLoading
                                ? "..."
                                : (
                                    getStatForRedeemed("Free Shipping")
                                      ?.totalPointsRedeemed ?? 0
                                  ).toLocaleString()}
                            </span>
                            {!pointsRedeemedLoading &&
                              getStatForRedeemed("Free Shipping") &&
                              renderGrowthIndicator(
                                getStatForRedeemed("Free Shipping")!.growth,
                              )}
                            {!pointsRedeemedLoading &&
                              !getStatForRedeemed("Free Shipping") && (
                                <MoveHorizontal className="w-4 h-4 text-[#303030]" />
                              )}
                          </div>
                        </div>
                      </div>

                      {/* Free Product */}
                      <div className="card">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2.5">
                            <Image
                              src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/rejoin-dash-icon.svg`}
                              alt="Free Product"
                              width={18}
                              height={18}
                            />
                            <span className="text-sm font-bold">
                              Free Product
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-[#303030]">
                              {pointsRedeemedLoading
                                ? "..."
                                : (
                                    getStatForRedeemed("Free Product")
                                      ?.totalPointsRedeemed ?? 0
                                  ).toLocaleString()}
                            </span>
                            {!pointsRedeemedLoading &&
                              getStatForRedeemed("Free Product") &&
                              renderGrowthIndicator(
                                getStatForRedeemed("Free Product")!.growth,
                              )}
                            {!pointsRedeemedLoading &&
                              !getStatForRedeemed("Free Product") && (
                                <MoveHorizontal className="w-4 h-4 text-[#303030]" />
                              )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Tab>

            <Tab
              key="campaign-features-summary"
              title="Campaign Features Summary"
              className="text-[13px]"
            >
              {campaignTierStatus === false && (
                <div className="absolute right-4 top-[14px]">
                  <Button
                    className="custom-btn"
                    onPress={() => router.push("/setup/points-tier-system")}
                  >
                    Enable Tier
                  </Button>
                </div>
              )}
              <div className="border-t border-[#e5e7eb] p-4">
                <CampaignTableArea onTierStatusChange={setCampaignTierStatus} />
              </div>
            </Tab>
          </Tabs>
        </div>
      </div>
    </>
  );
}
