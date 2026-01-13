"use client";

import { useState } from "react";
import Image from "next/image";
import { Switch } from "@heroui/switch";
import { Pencil } from "lucide-react";

interface EmailNotification {
  key: string;
  label: string;
  icon: string;
  enabled: boolean;
}

export default function EmailsPage() {
  const [emailNotifications, setEmailNotifications] = useState<
    EmailNotification[]
  >([
    {
      key: "signUp",
      label: "Welcome to Our Loyalty Program",
      icon: "/images/signup-notifaction.svg",
      enabled: false,
    },
    {
      key: "purchase",
      label: "Points On Order Fulfillment Notification",
      icon: "/images/purchase-notifation.svg",
      enabled: false,
    },
    {
      key: "birthday",
      label: "Birthday Rewards Notification",
      icon: "/images/birthday-notification.svg",
      enabled: false,
    },
    {
      key: "couponExpire",
      label: "Coupon Expiration Alert",
      icon: "/images/coupon-expire-notification.svg",
      enabled: false,
    },
    {
      key: "festival",
      label: "Festival Celebration Rewards",
      icon: "/images/festival-notification.svg",
      enabled: false,
    },
    {
      key: "monthlyPoints",
      label: "Monthly Points Statement",
      icon: "/images/monthly-expire-notification.svg",
      enabled: false,
    },
    {
      key: "newsletter",
      label: "Loyalty Program Newsletter",
      icon: "/images/newsletter-notification.svg",
      enabled: false,
    },
    {
      key: "pointsExpire",
      label: "Points Expiration Notification",
      icon: "/images/point-expire-notification.svg",
      enabled: false,
    },
    {
      key: "profileCompletion",
      label: "Profile Completion Reward",
      icon: "/images/profile-complete-notification.svg",
      enabled: false,
    },
    {
      key: "referAndEarn",
      label: "Refer & Earn Rewards",
      icon: "/images/refer-earn-notification.svg",
      enabled: false,
    },
    {
      key: "rejoining",
      label: "Welcome Back Rewards",
      icon: "/images/rejoining-notification.svg",
      enabled: false,
    },
    {
      key: "upgradedTrial",
      label: "Tier Upgrade Notification",
      icon: "/images/upgrade-trial-notification.svg",
      enabled: false,
    },
  ]);

  const [selectedEmail, setSelectedEmail] = useState<string>("festival");

  const handleToggle = (key: string, enabled: boolean) => {
    setEmailNotifications((prev) =>
      prev.map((email) => (email.key === key ? { ...email, enabled } : email))
    );
  };

  return (
    <>
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col gap-4">
          <div className="flex gap-2 justify-between items-center">
            <div className="flex flex-col gap-1">
              <h1 className="text-xl font-bold">Manage Emails</h1>
              <p>Customize the way you want customers to collect points</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="card min-w-[300px] max-w-[300px] bg-[#F7F7F7] !p-0">
              <div className="flex flex-col gap-0 h-[calc(100lvh-98px)] overflow-y-auto">
                {emailNotifications.map((email) => {
                  const isActive = selectedEmail === email.key;
                  return (
                    <div
                      key={email.key}
                      className={`flex items-center justify-between py-4 px-3 cursor-pointer transition-colors gap-3 border-b border-[#dedede] ${
                        isActive
                          ? "bg-[#3f3f3f] text-white"
                          : "hover:bg-[#f7f7f7]"
                      }`}
                      onClick={() => setSelectedEmail(email.key)}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="flex-shrink-0">
                          <Image
                            src={email.icon}
                            alt={email.label}
                            width={30}
                            height={30}
                            style={{
                              minWidth: "30px",
                              minHeight: "30px",
                              filter: isActive
                                ? "brightness(0) invert(1)"
                                : "none",
                            }}
                          />
                        </div>
                        <span
                          className={`text-sm font-medium ${
                            isActive ? "text-white" : "text-[#303030]"
                          }`}
                        >
                          {email.label}
                        </span>
                      </div>
                      <div
                        className="flex-shrink-0 ml-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Switch
                          size="sm"
                          color="success"
                          isSelected={email.enabled}
                          onValueChange={(enabled) =>
                            handleToggle(email.key, enabled)
                          }
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="card flex-1">
              <div className="flex flex-col gap-4">
                {/* Header - UI Only */}
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-[#303030]">
                    {emailNotifications.find((e) => e.key === selectedEmail)
                      ?.label || "Email Preview"}
                  </h2>
                  <button className="custom-btn flex items-center gap-1 cursor-pointer">
                    <Pencil size={14} />
                    Edit
                  </button>
                </div>

                {/* Email Preview - Table Based */}
                <div className="bg-white h-[calc(100lvh-174px)] overflow-y-auto">
                  <table
                    width="100%"
                    cellPadding="0"
                    cellSpacing="0"
                    border={0}
                    style={{
                      fontFamily: "Arial, sans-serif",
                      maxWidth: "600px",
                      margin: "0 auto",
                    }}
                  >
                    {/* Store Name */}
                    <tr>
                      <td
                        align="center"
                        style={{
                          padding: "20px 0 10px 0",
                          fontSize: "18px",
                          fontWeight: "bold",
                          color: "#303030",
                        }}
                      >
                        teststoredes2025
                      </td>
                    </tr>

                    {/* Hero Image */}
                    <tr>
                      <td align="center" style={{ padding: "10px 0" }}>
                        <Image
                          alt="Welcome to Our Loyalty Program"
                          src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/welcome-to-our-loyalty-program.png`}
                          width={314}
                          height={287}
                        />
                      </td>
                    </tr>

                    {/* Main Heading */}
                    <tr>
                      <td
                        align="center"
                        style={{
                          padding: "20px 20px 10px 20px",
                          fontSize: "24px",
                          fontWeight: "bold",
                          color: "#000000",
                        }}
                      >
                        Congratulations, {`{{customer_name}}`}!
                        <br />
                        Your Earned Rewards Await!
                      </td>
                    </tr>

                    {/* Body Paragraph 1 */}
                    <tr>
                      <td
                        align="center"
                        style={{
                          padding: "0 20px 15px 20px",
                          fontSize: "16px",
                          lineHeight: "1.6",
                          color: "#000000",
                        }}
                      >
                        We&apos;re excited to congratulate you on your recent
                        order! As a valued member of our loyalty program,
                        you&apos;ve earned {`{{purchase_points}}`}{" "}
                        {`{{point_name}}`} with your purchase.
                      </td>
                    </tr>

                    {/* Body Paragraph 2 */}
                    <tr>
                      <td
                        align="center"
                        style={{
                          padding: "0 20px 15px 20px",
                          fontSize: "16px",
                          lineHeight: "1.6",
                          color: "#000000",
                        }}
                      >
                        Please note that your {`{{purchase_points}}`}{" "}
                        {`{{point_name}}`} will be credited shortly, but they
                        will be processed after the return window for your order
                        has closed. This ensures your rewards accurately reflect
                        your final purchase, taking any returns or exchanges
                        into account.
                      </td>
                    </tr>

                    {/* Body Paragraph 3 */}
                    <tr>
                      <td
                        align="center"
                        style={{
                          padding: "0 20px 20px 20px",
                          fontSize: "16px",
                          lineHeight: "1.6",
                          color: "#000000",
                        }}
                      >
                        Thank you for being a part of our community. Happy
                        shopping!
                      </td>
                    </tr>

                    {/* CTA Button */}
                    <tr>
                      <td
                        align="center"
                        style={{ padding: "0 20px 30px 20px" }}
                      >
                        <table
                          cellPadding="0"
                          cellSpacing="0"
                          border={0}
                          style={{ margin: "0 auto" }}
                        >
                          <tr>
                            <td
                              align="center"
                              style={{
                                backgroundColor: "#c70a24",
                                borderRadius: "8px",
                                padding: "12px 30px",
                              }}
                            >
                              <a
                                href="#"
                                style={{
                                  color: "#ffffff",
                                  textDecoration: "none",
                                  fontSize: "16px",
                                  fontWeight: "bold",
                                  display: "inline-block",
                                }}
                              >
                                Shop More
                              </a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    {/* Footer */}
                    <tr>
                      <td
                        align="center"
                        style={{
                          padding: "20px",
                          fontSize: "12px",
                          color: "#999999",
                          backgroundColor: "#f8f8f8",
                          borderTop: "1px solid #e0e0e0",
                        }}
                      >
                        <div className="flex items-center justify-center gap-2">
                          This email is sent by
                          <Image
                            alt="Welcome to Our Loyalty Program"
                            src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/favloyalty-logo.svg`}
                            width={91}
                            height={10}
                            style={{ maxWidth: "91px", maxHeight: "10px" }}
                          />
                          on behalf of
                          <strong className="text-[#303030] font-bold">
                            teststoredes2025
                          </strong>
                        </div>
                      </td>
                    </tr>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
