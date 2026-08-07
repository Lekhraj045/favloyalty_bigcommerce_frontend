"use client";

import {
  Bars3Icon,
  ChartBarIcon,
  Cog6ToothIcon,
  CreditCardIcon,
  EnvelopeIcon,
  LifebuoyIcon,
  UsersIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import Image from "next/image";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const EXPANDED_PADDING = "240px";
const COLLAPSED_PADDING = "5rem";

export const Navbar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const body = document.body;
    body.style.paddingLeft = isCollapsed ? COLLAPSED_PADDING : EXPANDED_PADDING;
    body.style.transition = "padding-left 0.3s ease-in-out";

    return () => {
      body.style.paddingLeft = "";
      body.style.transition = "";
    };
  }, [isCollapsed]);

  const navItems = [
    {
      label: "Setup FavLoyalty",
      icon: <Cog6ToothIcon className="w-5 h-5" />,
      href: "/setup/points-tier-system",
    },
    {
      label: "Dashboard",
      icon: <ChartBarIcon className="w-5 h-5" />,
      href: "/dashboard",
    },
    {
      label: "Customer",
      icon: <UsersIcon className="w-5 h-5" />,
      href: "/customer",
    },
    {
      label: "Email",
      icon: <EnvelopeIcon className="w-5 h-5" />,
      href: "/email",
    },
    {
      label: "Support",
      icon: <LifebuoyIcon className="w-5 h-5" />,
      href: "/support",
    },
    {
      label: "Plan & Pricing",
      icon: <CreditCardIcon className="w-5 h-5" />,
      href: "/pricing",
    },
  ];

  return (
    <>
      {/* Sidebar */}
      <aside
        className={clsx(
          "fixed left-0 top-0 h-screen bg-[#EBEBEB] border-r border-gray-200 transition-all duration-300 z-50",
          isCollapsed ? "w-20" : "w-[240px]",
        )}
      >
        <div className="flex flex-col h-full justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              {!isCollapsed && (
                <NextLink href="/setup/points-tier-system" className="flex items-center">
                  <Image
                    src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/favloyalty-logo.svg`}
                    alt="FavLoyalty"
                    width={140}
                    height={32}
                    priority
                  />
                </NextLink>
              )}
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {isCollapsed ? (
                  <Bars3Icon className="w-5 h-5" />
                ) : (
                  <XMarkIcon className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 p-3">
              <div className="space-y-2">
                {navItems.map((item) => {
                  const isActive =
                    item.href === "/"
                      ? pathname === "/"
                      : pathname === item.href ||
                        pathname.startsWith(item.href + "/") ||
                        (pathname.startsWith("/setup") &&
                          item.href === "/setup/points-tier-system");

                  return (
                    <NextLink
                      key={item.href}
                      href={item.href}
                      className={clsx(
                        "flex items-center gap-3 px-3 py-2 mb-0 rounded-lg transition-colors",
                        isActive
                          ? "bg-white text-[#303030] font-bold"
                          : "hover:bg-[#f1f1f1] text-gray-700",
                      )}
                    >
                      <span className={clsx(isCollapsed && "mx-auto")}>
                        {item.icon}
                      </span>
                      {!isCollapsed && (
                        <span className="text-[13px] whitespace-nowrap">
                          {item.label}
                        </span>
                      )}
                    </NextLink>
                  );
                })}
              </div>
            </nav>
          </div>
        </div>
      </aside>
    </>
  );
};
