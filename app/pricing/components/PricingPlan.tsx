"use client";

import {
  capturePayPalSubscription,
  createPayPalSubscription,
  downgradeToFree,
  getStorePlan,
  type StorePlan,
} from "@/utils/api";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/modal";
import { Skeleton } from "@heroui/skeleton";
import { Spinner } from "@heroui/spinner";
import { addToast } from "@heroui/toast";
import { AlertTriangle, Check, Lock, Shield, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface PricingPlanAreaProps {
  orderCount: number;
  price: number;
  onPlanChange?: () => void;
}

declare global {
  interface Window {
    paypal?: any;
  }
}

export default function PricingPlanArea({
  orderCount,
  price,
  onPlanChange,
}: PricingPlanAreaProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [paypalButtonsRendering, setPaypalButtonsRendering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [planId, setPlanId] = useState<string | null>(null);
  const [storePlan, setStorePlan] = useState<StorePlan | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(true);
  const [showDowngradeWarning, setShowDowngradeWarning] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const router = useRouter();
  const paypalClientId =
    process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ||
    "AaNA_352JsMdxnfzmVrvDMXwDfEr0EPlVGkk_FxyvX-tZ6ZDnIpKDzQQ9smH1O9Gqpkv1yUu2g_6HKWZ";

  // Get user, channel, and store IDs from localStorage
  const getIds = () => {
    if (typeof window === "undefined")
      return { userId: null, channelId: null, storeId: null };

    const storeId = localStorage.getItem("bc_store_id");
    const channels = localStorage.getItem("bc_channels");
    let channelId = null;

    if (channels) {
      try {
        const channelsArray = JSON.parse(channels);
        if (channelsArray && channelsArray.length > 0) {
          channelId = channelsArray[0].channel_id || channelsArray[0].id;
        }
      } catch (e) {
        console.error("Error parsing channels:", e);
      }
    }

    // For userId, you might need to get it from your auth system
    // For now, we'll use storeId as userId if no separate userId exists
    const userId = localStorage.getItem("bc_user_id") || storeId;

    return { userId, channelId, storeId };
  };

  // Fetch store plan and Pro plan ID
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch store plan
        try {
          const planData = await getStorePlan();
          setStorePlan(planData);
        } catch (err) {
          console.error("Error fetching store plan:", err);
          // Set default if fetch fails
          setStorePlan({
            plan: "free",
            trialDaysRemaining: null,
            paypalSubscriptionId: null,
            limitReached: false,
            orderCount: 0,
            selectedOrderLimit: 0,
          });
        }

        // Fetch Pro plan ID
        const API_URL =
          process.env.NEXT_PUBLIC_BACKEND_URL ||
          "https://favbigcommerce.share.zrok.io";
        const response = await fetch(`${API_URL}/api/plans/pro`);
        if (response.ok) {
          const plan = await response.json();
          setPlanId(plan._id || plan.id);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoadingPlan(false);
      }
    };
    fetchData();
  }, []);

  // Load PayPal SDK for subscriptions
  useEffect(() => {
    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${paypalClientId}&currency=USD&vault=true&intent=subscription&enable-funding=card`;
    script.async = true;
    script.onload = () => {
      setPaypalLoaded(true);
    };
    document.body.appendChild(script);

    return () => {
      const existingScript = document.querySelector(
        'script[src*="paypal.com/sdk"]',
      );
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }, [paypalClientId]);

  // Auto-render PayPal subscription buttons when modal opens
  useEffect(() => {
    if (showPaymentModal && paypalLoaded && window.paypal) {
      const timer = setTimeout(() => {
        const paypalContainer = document.getElementById(
          "paypal-payment-container",
        );
        if (paypalContainer && paypalContainer.children.length === 0) {
          setPaypalButtonsRendering(true);
          handlePayWithPayPal();
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [showPaymentModal, paypalLoaded]);

  const handleDowngradeClick = () => {
    setShowDowngradeWarning(true);
  };

  const handleDowngradeConfirm = async () => {
    setShowDowngradeWarning(false);
    setIsProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      await downgradeToFree();

      // Show success toast - if we reach here, the API call was successful
      addToast({
        title: "Success",
        description: "Successfully downgraded to Free plan",
        color: "success",
      });

      // Refresh store plan after downgrade
      const updatedPlan = await getStorePlan();
      setStorePlan(updatedPlan);

      // Notify parent component to refresh its store plan state
      if (onPlanChange) {
        onPlanChange();
      }

      setSuccess("Successfully downgraded to Free plan");
      setIsProcessing(false);

      setTimeout(() => {
        setSuccess(null);
      }, 5000);
    } catch (err: any) {
      setError(err.message || "Failed to downgrade plan");
      setIsProcessing(false);

      // Show error toast
      addToast({
        title: "Error",
        description: err.message || "Failed to downgrade plan",
        color: "danger",
      });
    }
  };

  const handleDowngradeCancel = () => {
    setShowDowngradeWarning(false);
  };

  const handleSimpleUpgrade = () => {
    setShowPaymentModal(true);
    setError(null);
    setSuccess(null);
  };

  const handlePayWithPayPal = async () => {
    if (!paypalLoaded || !window.paypal) {
      setError(
        "PayPal SDK is still loading. Please wait a moment and try again.",
      );
      setPaypalButtonsRendering(false);
      return;
    }

    setError(null);

    try {
      const paypalContainer = document.getElementById(
        "paypal-payment-container",
      );
      if (paypalContainer) {
        paypalContainer.innerHTML = "";

        const buttons = window.paypal.Buttons({
          style: {
            layout: "vertical",
            color: "blue",
            shape: "rect",
            label: "paypal",
          },
          createSubscription: async () => {
            const { userId, channelId, storeId } = getIds();
            const subscription = await createPayPalSubscription(
              price.toFixed(2),
              "USD",
              storeId || undefined,
              planId || undefined,
              orderCount,
              userId || undefined,
              channelId ? String(channelId) : undefined,
            );
            return subscription.id;
          },
          onApprove: async (data: any) => {
            try {
              setIsProcessing(true);
              const { userId, channelId, storeId } = getIds();

              const captureResponse = await capturePayPalSubscription(
                data.subscriptionID,
                storeId || undefined,
                planId || undefined,
                orderCount,
                "EVERY_30_DAYS",
                price.toFixed(2),
              );

              setSuccess(
                `Subscription started! $${captureResponse.amount || price.toFixed(2)}/month`,
              );
              setIsProcessing(false);
              setShowPaymentModal(false);

              try {
                const updatedPlan = await getStorePlan();
                setStorePlan(updatedPlan);
                if (onPlanChange) {
                  onPlanChange();
                }
              } catch (err) {
                console.error("Error refreshing store plan:", err);
              }

              const params = new URLSearchParams();
              if (userId) params.append("userId", userId);
              if (channelId) params.append("channelId", String(channelId));
              if (storeId) params.append("storeId", storeId);
              params.append("payment", "success");

              setTimeout(() => {
                router.push(`pricing?${params.toString()}`);
              }, 2000);
            } catch (err: any) {
              setError(err.message || "Failed to activate subscription");
              setIsProcessing(false);
            }
          },
          onError: (err: any) => {
            setError(err.message || "An error occurred during subscription");
            setIsProcessing(false);
          },
          onCancel: () => {
            setError("Subscription was cancelled");
            setIsProcessing(false);
          },
        });

        buttons
          .render("#paypal-payment-container")
          .then(() => {
            setPaypalButtonsRendering(false);
          })
          .catch((err: any) => {
            setPaypalButtonsRendering(false);
            setError(err.message || "Failed to render PayPal buttons");
          });
      }
    } catch (err: any) {
      setPaypalButtonsRendering(false);
      setError(err.message || "Failed to initialize PayPal subscription");
      setIsProcessing(false);
    }
  };
  const features = [
    { name: "Monthly Order Limit", free: "Up to 300", pro: "--" },
    // { name: 'Additional order rate', free: '--', pro: '$5.00 / 100 orders*' },
    { name: "Customer Summary", free: true, pro: true },
    { name: "Tailored Communication", free: true, pro: true },
    { name: "Loyalty Program Widget", free: true, pro: true },
    { name: "Sign-up Bonus", free: true, pro: true },
    { name: "Purchase Points", free: true, pro: true },
    { name: "Birthday Treats", free: false, pro: true },
    { name: "Referral Rewards", free: false, pro: true },
    { name: "Newsletter Subscriptions", free: false, pro: true },
    { name: "Rejoining Perks", free: false, pro: true },
    { name: "Festivals and Events", free: false, pro: true },
    { name: "Shipping Discounts", free: false, pro: true },
    { name: "Flat Discounts", free: true, pro: true },
    { name: "Free Products", free: false, pro: true },
    { name: "Exclusive Coupons", free: false, pro: true },
    { name: "Point Tiers and Levels", free: false, pro: true },
    { name: "Redemption Restrictions", free: false, pro: true },
    { name: "Points and Coupon Expiry", free: false, pro: true },
    { name: "Customer Data Management", free: true, pro: true },
    { name: "Onboarding Support", free: true, pro: true },
    { name: "24/7 Chat Support", free: true, pro: true },
  ];

  return (
    <div>
      {/* Payment Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => {
          // Prevent closing during payment processing
          if (isProcessing) {
            return;
          }
          setShowPaymentModal(false);
          setError(null);
          setPaypalButtonsRendering(false);
          // Clear PayPal container
          const paypalContainer = document.getElementById(
            "paypal-payment-container",
          );
          if (paypalContainer) {
            paypalContainer.innerHTML = "";
          }
        }}
        size="5xl"
        placement="center"
        scrollBehavior="inside"
        isDismissable={!isProcessing}
        hideCloseButton={isProcessing}
        classNames={{
          base: "max-w-6xl",
          body: "p-0",
        }}
      >
        <ModalContent className="relative">
          <ModalHeader className="flex flex-col gap-1 px-6 pt-6">
            <h2 className="text-2xl font-bold">Complete Your Purchase</h2>
            <p className="text-sm text-gray-600 font-normal">
              You're just one step away from upgrading your loyalty program
              experience.
            </p>
          </ModalHeader>
          <ModalBody className="px-6 pb-6 relative">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Order Summary - Left Side */}
              <Card className="bg-gray-50">
                <CardHeader className="pb-3">
                  <h3 className="text-lg font-semibold">Order Summary</h3>
                </CardHeader>
                <CardBody className="space-y-4">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold">Pro Plan</p>
                        <p className="text-sm text-gray-600">
                          Unlimited features for your business
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Billing Cycle:</span>
                        <span className="font-medium">Monthly</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Free Trial:</span>
                        <span className="font-medium flex items-center gap-1">
                          <span>
                            {storePlan?.trialDaysRemaining === null
                              ? 14
                              : storePlan?.trialDaysRemaining || 0}{" "}
                            days
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-lg font-semibold">Total:</span>
                      <span className="text-2xl font-bold">
                        ${price.toFixed(2)}/month
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Based on {orderCount.toLocaleString()} selected orders
                    </p>
                  </div>

                  <div className="border-t pt-4">
                    <p className="text-sm font-semibold mb-2">
                      What you'll get:
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-teal-500 flex-shrink-0" />
                        <span>Unlimited orders (with overage charges)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-teal-500 flex-shrink-0" />
                        <span>All Pro features unlocked</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-teal-500 flex-shrink-0" />
                        <span>
                          {storePlan?.trialDaysRemaining === null
                            ? 14
                            : storePlan?.trialDaysRemaining || 0}
                          -day free trial
                        </span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-teal-500 flex-shrink-0" />
                        <span>Priority support</span>
                      </li>
                    </ul>
                  </div>
                </CardBody>
              </Card>

              {/* Payment Details - Right Side */}
              <Card className="relative">
                {isProcessing ? (
                  // Show only loader during payment processing
                  <div className="min-h-[400px] flex flex-col items-center justify-center p-6">
                    <Spinner size="lg" color="primary" />
                    <div className="text-center mt-4">
                      <p className="text-lg font-semibold text-gray-900 mb-2">
                        Processing Payment...
                      </p>
                      <p className="text-sm text-gray-600 max-w-md">
                        Please wait while we process your payment. Do not close
                        this window or refresh the page.
                      </p>
                    </div>
                  </div>
                ) : (
                  // Show payment options when not processing
                  <>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between w-full">
                        <h3 className="text-lg font-semibold">
                          Payment Details
                        </h3>
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-green-600" />
                          <span className="text-xs text-gray-600">
                            SSL Encrypted
                          </span>
                          <Lock className="w-4 h-4 text-blue-600" />
                          <span className="text-xs text-gray-600">
                            PayPal Secure
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardBody className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-1">Pay with PayPal</h4>
                        <p className="text-sm text-gray-600 mb-4">
                          Secure payment powered by PayPal. You can pay with
                          your PayPal account or credit card.
                        </p>
                      </div>

                      {/* PayPal Payment Section */}
                      <div className="space-y-4">
                        <p className="text-sm text-gray-700">
                          Click the button below to pay securely with PayPal.
                          You can use your PayPal account or credit card.
                        </p>

                        {/* PayPal Payment Container - Will render PayPal buttons here */}
                        <div
                          id="paypal-payment-container"
                          className="min-h-[200px] flex items-center justify-center relative"
                        >
                          {(paypalButtonsRendering || !paypalLoaded) && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white rounded-lg border border-gray-200">
                              <div className="flex flex-col items-center gap-3">
                                <div className="relative w-12 h-12">
                                  <div className="absolute inset-0 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                                </div>
                                <p className="text-sm text-gray-600 font-medium">
                                  Loading subscription options...
                                </p>
                                <p className="text-xs text-gray-500">
                                  Please wait while we set up your secure
                                  subscription
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Powered by PayPal Text */}
                        <p className="text-xs text-center text-gray-500">
                          Powered by PayPal
                        </p>
                      </div>

                      {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <p className="text-sm text-red-600">{error}</p>
                        </div>
                      )}

                      {success && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <p className="text-sm text-green-600">{success}</p>
                        </div>
                      )}

                      <div className="border-t pt-4 space-y-2 text-xs text-gray-600">
                        <p>
                          By completing your purchase, you agree to our{" "}
                          <a href="#" className="text-blue-600 hover:underline">
                            Terms of Service
                          </a>{" "}
                          and{" "}
                          <a href="#" className="text-blue-600 hover:underline">
                            Privacy Policy
                          </a>
                        </p>
                        <p className="text-green-600 font-medium">
                          {storePlan?.trialDaysRemaining === null ||
                          (storePlan?.trialDaysRemaining &&
                            storePlan.trialDaysRemaining > 0)
                            ? `Your ${storePlan?.trialDaysRemaining === null ? 14 : storePlan.trialDaysRemaining}-day free trial starts today. You won't be charged until the trial period ends.`
                            : "No trial period. You will be charged immediately."}
                        </p>
                      </div>
                    </CardBody>
                  </>
                )}
              </Card>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Downgrade Warning Modal */}
      <Modal
        isOpen={showDowngradeWarning}
        onClose={handleDowngradeCancel}
        size="lg"
        placement="center"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-yellow-500" />
              <span>Warning: Downgrade to Free Plan</span>
            </div>
          </ModalHeader>
          <ModalBody>
            <div className="flex flex-col gap-4">
              <p className="text-sm text-gray-700">
                Are you sure you want to downgrade to the Free plan? This action
                will:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-2 ml-2">
                <li>Cancel your current Pro subscription</li>
                <li>Remove access to all Pro features immediately</li>
                <li>
                  Limit your monthly orders to 300 (from your current limit)
                </li>
                <li>
                  Disable advanced features like Birthday Treats, Referral
                  Rewards, Newsletter Subscriptions, etc.
                </li>
                <li>
                  You will need to upgrade again if you want to access Pro
                  features in the future
                </li>
              </ul>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800 font-semibold">
                  ⚠️ This action cannot be undone. You will lose all Pro plan
                  benefits immediately.
                </p>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              color="default"
              variant="light"
              onPress={handleDowngradeCancel}
              isDisabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              color="danger"
              onPress={handleDowngradeConfirm}
              isLoading={isProcessing}
            >
              {isProcessing ? "Processing..." : "Yes, Downgrade to Free"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <div className="max-w-7xl mx-auto">
        {loadingPlan ? (
          // Skeleton Loader
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Core Features Skeleton */}
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-4 h-[220px] border-b border-[#E0E0E0]">
                <Skeleton className="h-6 w-40 rounded mb-4" />
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full rounded" />
                  <Skeleton className="h-4 w-3/4 rounded" />
                  <Skeleton className="h-4 w-5/6 rounded" />
                  <Skeleton className="h-4 w-4/5 rounded" />
                </div>
              </div>
              <div>
                {Array.from({ length: features.length }).map((_, idx) => (
                  <div
                    key={idx}
                    className={`py-1 px-4 h-[45px] flex items-center ${idx % 2 === 0 ? "bg-[#f9f9f9]" : "bg-white"} ${idx === features.length - 1 ? "rounded-b-xl" : ""}`}
                  >
                    <Skeleton className="h-4 w-32 rounded" />
                  </div>
                ))}
              </div>
            </div>

            {/* Free Plan Skeleton */}
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-4 h-[220px] flex flex-col justify-between border-b border-[#E0E0E0]">
                <div className="flex flex-col gap-2.5">
                  <div>
                    <Skeleton className="h-6 w-16 rounded mb-2" />
                    <Skeleton className="h-4 w-40 rounded" />
                  </div>
                  <div>
                    <Skeleton className="h-8 w-20 rounded mb-1" />
                    <Skeleton className="h-4 w-24 rounded" />
                  </div>
                </div>
                <div>
                  <Skeleton className="h-10 w-full rounded mb-2" />
                  <Skeleton className="h-3 w-full rounded" />
                </div>
              </div>
              <div>
                {Array.from({ length: features.length }).map((_, idx) => (
                  <div
                    key={idx}
                    className={`py-1 px-4 h-[45px] flex items-center justify-center ${idx % 2 === 0 ? "bg-[#f9f9f9]" : "bg-white"} ${idx === features.length - 1 ? "rounded-b-xl" : ""}`}
                  >
                    <Skeleton className="h-5 w-5 rounded" />
                  </div>
                ))}
              </div>
            </div>

            {/* Pro Plan Skeleton */}
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-4 h-[220px] flex flex-col justify-between border-b border-[#E0E0E0]">
                <div className="flex flex-col gap-2.5">
                  <div>
                    <Skeleton className="h-6 w-16 rounded mb-2" />
                    <Skeleton className="h-4 w-48 rounded" />
                  </div>
                  <div>
                    <Skeleton className="h-8 w-24 rounded mb-1" />
                    <Skeleton className="h-3 w-40 rounded" />
                  </div>
                </div>
                <div>
                  <Skeleton className="h-10 w-full rounded mb-2" />
                  <Skeleton className="h-3 w-full rounded" />
                </div>
              </div>
              <div>
                {Array.from({ length: features.length }).map((_, idx) => (
                  <div
                    key={idx}
                    className={`py-1 px-4 h-[45px] flex items-center justify-center ${idx % 2 === 0 ? "bg-[#f9f9f9]" : "bg-white"} ${idx === features.length - 1 ? "rounded-b-xl" : ""}`}
                  >
                    <Skeleton className="h-5 w-5 rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          // Actual Content
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Core Features Column */}
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-4 h-[220px] min-height-[220px] border-b border-[#E0E0E0] sticky top-0 bg-white rounded-t-xl">
                <h2 className="text-base font-bold">Core Loyalty Features</h2>
                <ul className="space-y-3 text-xs text-[#303030] mt-3.5">
                  <li className="flex items-start">
                    <span className="mr-2">○</span>
                    <span>Collect points for purchases</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">○</span>
                    <span>Birthdays, referrals and special events</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">○</span>
                    <span>Redeem for discounts or free products</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">○</span>
                    <span>
                      Manage through a simple dashboard, and access 24/7 support
                    </span>
                  </li>
                </ul>
              </div>

              <div>
                {features.map((feature, idx) => (
                  <div
                    key={idx}
                    className={`py-1 px-4 h-[45px] min-height-[45px] flex items-center ${idx % 2 === 0 ? "bg-[#f9f9f9]" : "bg-white"} ${idx === features.length - 1 ? "rounded-b-xl" : ""}`}
                  >
                    <span className="text-[13px] text-[#303030]">
                      {feature.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Free Plan Column */}
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-4 h-[220px] min-height-[220px] flex flex-col justify-between border-b border-[#E0E0E0] sticky top-0 bg-white rounded-t-xl">
                <div className="flex flex-col gap-2.5">
                  <div>
                    <h3 className="text-base font-bold">Free</h3>
                    <p className="text-sm text-gray-600">
                      Essential loyalty features.
                    </p>
                  </div>

                  <div>
                    <span className="text-2xl font-bold text-[#303030]">
                      $0
                    </span>
                    <span className="text-gray-600">/month</span>
                  </div>
                </div>
                <div>
                  {storePlan?.plan === "free" ? (
                    <Button isDisabled className="custom-btn w-full">
                      Current Plan
                    </Button>
                  ) : (
                    <Button
                      className="custom-btn w-full"
                      onClick={handleDowngradeClick}
                      isLoading={isProcessing}
                      isDisabled={isProcessing || loadingPlan}
                    >
                      {isProcessing ? "Processing..." : "Switch to Free Plan"}
                    </Button>
                  )}
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    {storePlan?.plan === "free"
                      ? "Your current subscription plan"
                      : "Downgrade to free plan and cancel your subscription"}
                  </p>
                </div>
              </div>

              <div>
                {features.map((feature, idx) => (
                  <div
                    key={idx}
                    className={`py-1 px-4 h-[45px] min-height-[45px] flex items-center justify-center font-bold ${idx % 2 === 0 ? "bg-[#f9f9f9]" : "bg-white"} ${idx === features.length - 1 ? "rounded-b-xl" : ""}`}
                  >
                    {typeof feature.free === "boolean" ? (
                      feature.free ? (
                        <Check className="w-5 h-5 text-teal-500" />
                      ) : (
                        <X className="w-5 h-5 text-red-500" />
                      )
                    ) : (
                      <span className="text-[13px] text-[#303030]">
                        {feature.free}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Pro Plan Column */}
            <div
              className={`bg-white rounded-xl shadow-sm ${storePlan?.plan === "paid" ? (storePlan?.limitReached ? "ring-2 ring-yellow-500" : "ring-2 ring-teal-500") : ""}`}
            >
              {/* Order Limit Warning Banner */}
              {storePlan?.plan === "paid" && storePlan?.limitReached && (
                <div className="bg-yellow-50 border-b border-yellow-200 p-3 rounded-t-xl">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-yellow-800">
                        Order Limit Reached
                      </p>
                      <p className="text-xs text-yellow-700">
                        You've used {storePlan.orderCount?.toLocaleString()} of{" "}
                        {storePlan.selectedOrderLimit?.toLocaleString()} orders.
                        Premium features are restricted. Resumes on next billing cycle.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <div
                className={`p-4 ${storePlan?.plan === "paid" && storePlan?.limitReached ? "h-[140px]" : "h-[220px]"} min-height-[140px] flex flex-col justify-between border-b border-[#E0E0E0] sticky top-0 bg-white ${!(storePlan?.plan === "paid" && storePlan?.limitReached) ? "rounded-t-xl" : ""}`}
              >
                <div className="flex flex-col gap-2.5">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold">Pro</h3>
                      {storePlan?.plan === "paid" && (
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                            storePlan?.limitReached
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-teal-100 text-teal-700"
                          }`}
                        >
                          {storePlan?.limitReached ? "Limit Reached" : "Active"}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Base price + dynamic orders.
                    </p>
                  </div>
                  <div>
                    <span className="text-2xl font-bold text-[#303030]">
                      ${price.toFixed(2)}
                    </span>
                    <span className="text-gray-600">/month</span>
                    <p className="text-xs text-gray-500">
                      Based on {orderCount.toLocaleString()} selected orders.
                    </p>
                  </div>
                </div>
                <div>
                  {storePlan?.plan === "paid" ? (
                    <Button isDisabled className="custom-btn w-full">
                      Current Plan
                    </Button>
                  ) : (

                    <Button
                      className="custom-btn w-full"
                      onClick={handleSimpleUpgrade}
                      isLoading={isProcessing}
                      isDisabled={isProcessing || loadingPlan}
                    >
                      {isProcessing
                        ? "Processing..."
                        : `Upgrade to Pro ($${price.toFixed(2)}/month)`}
                        {/* Upgrade to Pro will be available soon. */}
                    </Button>
                    
                  )}
                  {error && (
                    <p className="text-xs text-red-500 mt-2 text-center">
                      {error}
                    </p>
                  )}
                  {success && (
                    <p className="text-xs text-green-500 mt-2 text-center">
                      {success}
                    </p>
                  )}
                  {storePlan?.plan === "paid" &&
                    storePlan.trialDaysRemaining !== null &&
                    storePlan.trialDaysRemaining > 0 && (
                      <p className="text-xs text-blue-500 mt-2 text-center">
                        Trial: {storePlan.trialDaysRemaining} days remaining
                      </p>
                    )}
                  {storePlan?.plan !== "paid" && (
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      {storePlan?.trialDaysRemaining === null
                        ? "Includes a 14-day free trial of all Pro features."
                        : storePlan?.trialDaysRemaining &&
                            storePlan.trialDaysRemaining > 0
                          ? `Includes a ${storePlan.trialDaysRemaining}-day free trial of all Pro features.`
                          : "No trial period available. Subscription starts immediately."}
                    </p>
                  )}
                </div>
              </div>

              <div>
                {features.map((feature, idx) => (
                  <div
                    key={idx}
                    className={`py-1 px-4 h-[45px] min-height-[45px] flex items-center justify-center font-bold ${idx % 2 === 0 ? "bg-[#f9f9f9]" : "bg-white"} ${idx === features.length - 1 ? "rounded-b-xl" : ""}`}
                  >
                    {typeof feature.pro === "boolean" ? (
                      feature.pro ? (
                        <Check className="w-5 h-5 text-teal-500" />
                      ) : (
                        <X className="w-5 h-5 text-red-500" />
                      )
                    ) : (
                      <span className="text-[13px] text-[#303030]">
                        {feature.pro}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
