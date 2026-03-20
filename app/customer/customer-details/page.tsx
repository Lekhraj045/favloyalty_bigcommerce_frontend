"use client";

import {
  getCustomerById,
  getStorePlan,
  StorePlan,
  type Customer,
} from "@/utils/api";
import { Button } from "@heroui/button";
import { Skeleton } from "@heroui/skeleton";
import {
  ArrowLeft,
  Calendar,
  CalendarHeart,
  Mail,
  Phone,
  Users,
  VenusAndMars,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import AdjustBalanceModal from "./components/AdjustBalanceModal";
import AdjustTierModal from "./components/AdjustTierModal";
import CustomerActivityTableArea from "./components/CustomerActivityTable";
import SuccessfulReferralsModal from "./components/SuccessfulReferralsModal";

function CustomerDetailsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const customerId = searchParams.get("id");

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdjustBalanceModalOpen, setIsAdjustBalanceModalOpen] =
    useState(false);
  const [isAdjustTierModalOpen, setIsAdjustTierModalOpen] = useState(false);
  const [isSuccessfulReferralsModalOpen, setIsSuccessfulReferralsModalOpen] =
    useState(false);
  const [transactionRefreshKey, setTransactionRefreshKey] = useState(0);
  const [storePlan, setStorePlan] = useState<StorePlan | null>(null);
  const viewOnly = searchParams.get("viewOnly") === "1";

  // Fetch customer data
  const fetchCustomer = async () => {
    if (!customerId) {
      setError("Customer ID is required");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await getCustomerById(customerId);
      setCustomer(response.data);
    } catch (err) {
      console.error("Error fetching customer:", err);
      setError(err instanceof Error ? err.message : "Failed to load customer");
    } finally {
      setLoading(false);
    }
  };

  // Load store plan information
  useEffect(() => {
    const loadStorePlan = async () => {
      try {
        const plan = await getStorePlan();
        setStorePlan(plan);
      } catch (error) {
        console.error("Error loading store plan:", error);
        // Default to free plan if error
        setStorePlan({
          plan: "free",
          trialDaysRemaining: null,
          paypalSubscriptionId: null,
          limitReached: false,
          orderCount: 0,
          selectedOrderLimit: 0,
        });
      }
    };
    loadStorePlan();
  }, []);

  useEffect(() => {
    fetchCustomer();
  }, [customerId]);

  // Format date helper
  const formatDate = (date: Date | string | null | undefined): string => {
    if (!date) return "N/A";
    try {
      const d = typeof date === "string" ? new Date(date) : date;
      return d.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  // Format date for display (e.g., "19th November 2025")
  const formatDateWithOrdinal = (
    date: Date | string | null | undefined,
  ): string => {
    if (!date) return "N/A";
    try {
      const d = typeof date === "string" ? new Date(date) : date;
      const day = d.getDate();
      const month = d.toLocaleDateString("en-GB", { month: "long" });
      const year = d.getFullYear();
      const ordinal = getOrdinal(day);
      return `${day}${ordinal} ${month} ${year}`;
    } catch {
      return "N/A";
    }
  };

  // Get ordinal suffix
  const getOrdinal = (n: number): string => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  };

  // Format date for DOB/Anniversary (e.g., "20-01-2026")
  const formatDateShort = (date: Date | string | null | undefined): string => {
    if (!date) return "N/A";
    try {
      const d = typeof date === "string" ? new Date(date) : date;
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      return `${day}-${month}-${year}`;
    } catch {
      return "N/A";
    }
  };

  // Get initials from name
  const getInitials = (
    firstName: string | null,
    lastName: string | null,
  ): string => {
    const first = firstName?.charAt(0).toUpperCase() || "";
    const last = lastName?.charAt(0).toUpperCase() || "";
    return first + last || "?";
  };

  // Get full name
  const getFullName = (): string => {
    if (!customer) return "";
    const firstName = customer.firstName || "";
    const lastName = customer.lastName || "";
    return `${firstName} ${lastName}`.trim() || customer.email || "Customer";
  };

  // Get tier display name
  const getTierDisplay = (): string => {
    if (!customer) return "None";
    return (
      customer.tierDisplay || (customer.tierStatus ? "Silver Tier" : "None")
    );
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col gap-4">
          {/* Header Skeleton */}
          <div className="flex gap-2 justify-between items-center">
            <div className="flex gap-2 items-center">
              <Skeleton className="w-9 h-9 rounded-lg" />
              <div className="flex flex-col gap-1">
                <Skeleton className="h-6 w-48 rounded" />
                <Skeleton className="h-4 w-40 rounded" />
              </div>
            </div>
            <Skeleton className="h-9 w-24 rounded" />
          </div>

          {/* Content Skeleton */}
          <div className="flex gap-4">
            {/* Left Sidebar Skeleton */}
            <div className="w-2xs">
              <div className="card !p-0">
                <div className="flex flex-col">
                  <div className="flex gap-3 items-center border-b border-[#DEDEDE] p-4">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="flex flex-col gap-1.5">
                      <Skeleton className="h-5 w-32 rounded" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 p-4">
                    <Skeleton className="h-4 w-full rounded" />
                    <Skeleton className="h-4 w-full rounded" />
                    <Skeleton className="h-4 w-full rounded" />
                    <Skeleton className="h-4 w-full rounded" />
                    <Skeleton className="h-4 w-full rounded" />
                    <Skeleton className="h-4 w-full rounded" />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content Skeleton */}
            <div className="flex-1">
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="card">
                    <div className="flex gap-4 justify-between items-center">
                      <div className="flex flex-col gap-1">
                        <Skeleton className="h-4 w-24 rounded" />
                        <Skeleton className="h-6 w-16 rounded" />
                      </div>
                      {!viewOnly && <Skeleton className="h-9 w-32 rounded" />}
                    </div>
                  </div>
                  <div className="card">
                    <div className="flex gap-4 justify-between items-center">
                      <div className="flex flex-col gap-1">
                        <Skeleton className="h-4 w-32 rounded" />
                        <Skeleton className="h-6 w-8 rounded" />
                      </div>
                      <Skeleton className="h-9 w-28 rounded" />
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="flex gap-4 justify-between items-center">
                    <div className="flex flex-col gap-1">
                      <Skeleton className="h-4 w-24 rounded" />
                      <Skeleton className="h-6 w-20 rounded" />
                    </div>
                    <Skeleton className="h-9 w-28 rounded" />
                  </div>
                </div>

                <div className="card !p-0">
                  <div className="flex justify-between items-center gap-4 border-b border-[#DEDEDE] p-4">
                    <Skeleton className="h-5 w-32 rounded" />
                  </div>
                  <div className="flex flex-col gap-2 p-4">
                    {/* Activity table header skeleton */}
                    <div className="flex items-center gap-4 pb-2 border-b border-[#DEDEDE]">
                      <Skeleton className="h-4 w-20 rounded" />
                      <Skeleton className="h-4 w-32 rounded" />
                      <Skeleton className="h-4 w-20 rounded" />
                      <Skeleton className="h-4 w-16 rounded" />
                      <Skeleton className="h-4 w-12 rounded ml-auto" />
                    </div>
                    {/* Activity table rows skeleton */}
                    {[1, 2].map((index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 py-2 border-b border-[#DEDEDE]"
                      >
                        <Skeleton className="h-4 w-24 rounded" />
                        <Skeleton className="h-4 w-40 rounded" />
                        <Skeleton className="h-5 w-20 rounded-full" />
                        <Skeleton className="h-4 w-16 rounded" />
                        <Skeleton className="h-4 w-12 rounded ml-auto" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-500 mb-2">{error || "Customer not found"}</p>
            <Button
              className="custom-btn"
              onPress={() => router.push("/customer")}
            >
              Back to Customers
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col gap-4">
          <div className="flex gap-2 justify-between items-center">
            <div className="flex gap-2 items-center">
              <button
                className="h-9 w-9 hover:bg-[#d4d4d4] rounded-lg flex items-center justify-center cursor-pointer"
                onClick={() => router.push("/customer")}
              >
                <ArrowLeft />
              </button>
              <div className="flex flex-col gap-1">
                <h1 className="text-xl font-bold">{getFullName()}</h1>
                <p>
                  Member Since {formatDateWithOrdinal(customer.joiningDate)}
                </p>
              </div>
            </div>

            <div className="flex gap-2.5 items-center">
              {/* Only show Upgrade button for free plan users or when limit reached */}
              {(storePlan?.plan === "free" || storePlan?.limitReached) && (
                <Button
                  onClick={() => router.push("/pricing")}
                  className="custom-btn"
                >
                  Upgrade
                </Button>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-2xs">
              <div className="card !p-0">
                <div className="flex flex-col">
                  <div className="flex gap-3 items-center border-b border-[#DEDEDE] p-4">
                    <div className="w-10 h-10 min-w-10 min-h-10 max-w-10 max-h-10 rounded-full border border-[#DEDEDE] flex items-center justify-center bg-[#392D5D] text-white font-bold uppercase">
                      {getInitials(customer.firstName, customer.lastName)}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <div className="flex gap-2 items-center font-bold">
                        {getFullName()}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 p-4">
                    <div className="flex gap-2 items-center">
                      <Mail size={14} /> {customer.email}
                    </div>
                    <div className="flex gap-2 items-center">
                      <Phone size={14} />{" "}
                      {customer.profile?.contactNo || "No contact number"}
                    </div>
                    <div className="flex gap-2 items-center">
                      <VenusAndMars size={14} /> Gender:{" "}
                      {customer.profile?.gender || "N/A"}
                    </div>
                    <div className="flex gap-2 items-center">
                      <Users size={14} /> Age Group:{" "}
                      {customer.profile?.ageGroup || "N/A"}
                    </div>
                    <div className="flex gap-2 items-center">
                      <Calendar size={14} /> DOB:{" "}
                      {customer.dob || customer.profile?.dateOfBirth
                        ? formatDateShort(
                            customer.dob || customer.profile?.dateOfBirth,
                          )
                        : "N/A"}
                    </div>
                    <div className="flex gap-2 items-center">
                      <CalendarHeart size={14} /> Wedding Anniversary:{" "}
                      {customer.profile?.weddingAnniversary
                        ? formatDateShort(customer.profile.weddingAnniversary)
                        : "N/A"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1">
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="card">
                    <div className="flex gap-4 justify-between items-center">
                      <div className="flex flex-col gap-1">
                        <p>Point Balance</p>
                        <h2 className="text-lg font-bold">
                          {customer.points || 0}
                        </h2>
                      </div>

                      {!viewOnly && (
                        <Button
                          className="custom-btn"
                          onPress={() => setIsAdjustBalanceModalOpen(true)}
                        >
                          Adjust Balance
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="card">
                    <div className="flex gap-4 justify-between items-center">
                      <div className="flex flex-col gap-1">
                        <p>Successful Referrals</p>
                        <h2 className="text-lg font-bold">
                          {(customer.referral_points ?? 0).toLocaleString()}
                        </h2>
                        {(customer.refferalCount ?? 0) > 0 && (
                          <p className="text-xs text-[#616161]">
                            from {customer.refferalCount} referral
                            {(customer.refferalCount ?? 0) !== 1 ? "s" : ""}
                          </p>
                        )}
                      </div>
                      <Button
                        className="custom-btn"
                        onPress={() => setIsSuccessfulReferralsModalOpen(true)}
                      >
                        Show Details
                      </Button>
                    </div>
                  </div>
                </div>

                {customer.tierStatus && (
                  <div className="card">
                    <div className="flex gap-4 justify-between items-center">
                      <div className="flex flex-col gap-1">
                        <p>Current Tier</p>
                        <h2 className="text-lg">{getTierDisplay()}</h2>
                      </div>
                      {(() => {
                        const currentTierIndex =
                          customer.currentTier?.tierIndex ?? 0;
                        const maxTierIndex =
                          customer.tierOptions?.maxTierIndex ?? 3;
                        const isTopTier =
                          !customer.tierOptions ||
                          currentTierIndex >= maxTierIndex;
                        return !viewOnly ? (
                          <Button
                            className="custom-btn"
                            onPress={() => setIsAdjustTierModalOpen(true)}
                            isDisabled={isTopTier}
                          >
                            {isTopTier
                              ? "Top Tier (no upgrade)"
                              : "Change Tier"}
                          </Button>
                        ) : null;
                      })()}
                    </div>
                  </div>
                )}

                <div className="card !p-0">
                  <div className="flex justify-between items-center gap-4 border-b border-[#DEDEDE] p-4">
                    <h2 className="text-sm font-bold">Customer Activity</h2>
                  </div>
                  <div className="flex flex-col gap-2 p-4">
                    <CustomerActivityTableArea
                      customerId={customer.id}
                      refreshKey={transactionRefreshKey}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AdjustBalanceModal
        isOpen={isAdjustBalanceModalOpen}
        onClose={() => setIsAdjustBalanceModalOpen(false)}
        currentBalance={customer.points || 0}
        customerId={customer.id}
        channelId={customer.channelId}
        onSuccess={() => {
          fetchCustomer();
          // Trigger transaction refresh
          setTransactionRefreshKey((prev) => prev + 1);
        }}
      />

      {customer.tierStatus && (
        <AdjustTierModal
          isOpen={isAdjustTierModalOpen}
          onClose={() => setIsAdjustTierModalOpen(false)}
          customerId={customer.id}
          currentTierIndex={customer.currentTier?.tierIndex ?? 0}
          currentTierDisplay={customer.tierDisplay || "Silver"}
          tierOptions={customer.tierOptions ?? null}
          onSuccess={() => fetchCustomer()}
        />
      )}

      <SuccessfulReferralsModal
        isOpen={isSuccessfulReferralsModalOpen}
        onClose={() => setIsSuccessfulReferralsModalOpen(false)}
        customerId={customer.id}
      />
    </>
  );
}

export default function CustomerDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">Loading...</p>
          </div>
        </div>
      }
    >
      <CustomerDetailsContent />
    </Suspense>
  );
}
