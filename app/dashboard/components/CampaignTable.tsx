"use client";

import type { ReactElement } from "react";
import { useAppSelector } from "@/store/hooks";
import { getCollectSettings, getPoints, getStoreId, Tier } from "@/utils/api";
import { Skeleton } from "@heroui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/table";
import { Tooltip } from "@heroui/tooltip";
import { Info } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type CampaignRow = {
  key: string;
  label: string;
  basePoints: number;
  showPurchaseTooltip?: boolean;
};

function formatNumberTrim(value: number, maxDecimals: number) {
  const fixed = value.toFixed(maxDecimals);
  // Trim trailing zeros and optional decimal point
  return fixed.replace(/\.?0+$/, "");
}

function formatPointsPill(
  value: number,
  opts?: { forceTwoDecimals?: boolean },
) {
  if (opts?.forceTwoDecimals) return value.toFixed(2);
  if (Number.isInteger(value)) return String(value);
  return formatNumberTrim(value, 2);
}

type CampaignTableAreaProps = {
  onTierStatusChange?: (tierStatus: boolean) => void;
};

export default function CampaignTableArea({
  onTierStatusChange,
}: CampaignTableAreaProps) {
  const selectedChannel = useAppSelector(
    (state) => state.channel.selectedChannel,
  );
  const storeId = getStoreId();
  const channelId = selectedChannel?.id || null;

  const [loading, setLoading] = useState(true);
  const [tierStatus, setTierStatus] = useState(false);
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [rows, setRows] = useState<CampaignRow[]>([]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!storeId || !channelId) {
        if (!mounted) return;
        setLoading(false);
        setTierStatus(false);
        setTiers([]);
        setRows([]);
        onTierStatusChange?.(false);
        return;
      }

      setLoading(true);
      try {
        const [points, collect] = await Promise.all([
          getPoints(storeId, channelId),
          getCollectSettings(storeId, channelId),
        ]);

        if (!mounted) return;

        const pointsTierStatus = !!points?.tierStatus;
        const pointsTiers = pointsTierStatus ? points?.tier || [] : [];

        setTierStatus(pointsTierStatus);
        setTiers(pointsTiers);
        onTierStatusChange?.(pointsTierStatus);

        const waysToEarnRows: CampaignRow[] = [
          {
            key: "purchase",
            label: "Purchase",
            basePoints: collect?.basic?.spent?.point ?? 0,
            showPurchaseTooltip: true,
          },
          {
            key: "sign_up",
            label: "Sign Up",
            basePoints: collect?.basic?.signup?.point ?? 0,
          },
          {
            key: "newsletter",
            label: "Newsletter",
            basePoints: collect?.basic?.subucribing?.point ?? 0,
          },
          {
            key: "profile_completion",
            label: "Profile Completion",
            basePoints: collect?.basic?.profileComplition?.point ?? 0,
          },
          {
            key: "refer_earn",
            label: "Refer & Earn",
            basePoints: collect?.referAndEarn?.point ?? 0,
          },
          {
            key: "birthday",
            label: "Birthday",
            basePoints: collect?.basic?.birthday?.point ?? 0,
          },
          {
            key: "rejoin",
            label: "Rejoin",
            basePoints: collect?.rejoin?.pointRejoin ?? 0,
          },
        ];

        const eventRows: CampaignRow[] =
          collect?.event?.events?.map((e, idx) => ({
            key: `event_${idx}`,
            label: e?.name || "Event",
            basePoints: Number(e?.point || 0),
          })) || [];

        setRows([...waysToEarnRows, ...eventRows]);
      } catch (e) {
        console.error("Failed to load campaign summary data:", e);
        if (!mounted) return;
        setTierStatus(false);
        setTiers([]);
        setRows([]);
        onTierStatusChange?.(false);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [storeId, channelId, onTierStatusChange]);

  const resolvedTiers = useMemo(() => {
    // If tierStatus is true but tiers are empty, fall back to default tiers used elsewhere.
    if (!tierStatus) return [];
    if (tiers.length > 0) return tiers;
    return [
      { tierName: "Silver", pointRequired: 0, multiplier: 1 },
      { tierName: "Gold", pointRequired: 1000, multiplier: 1.2 },
      { tierName: "Platinum", pointRequired: 5000, multiplier: 1.5 },
    ] satisfies Tier[];
  }, [tierStatus, tiers]);

  const columns = useMemo(() => {
    if (tierStatus) {
      return resolvedTiers.map((t) => ({
        key: `tier_${t.tierName}`,
        header: `${t.tierName} (${formatNumberTrim(Number(t.multiplier || 1), 2)}x)`,
        kind: "tier" as const,
        tier: t,
        headerClassName: undefined as string | undefined,
        cellClassName: undefined as string | undefined,
      }));
    }

    return [
      {
        key: "points_rewarded",
        header: "Points Rewarded",
        kind: "points" as const,
        headerClassName: "text-center",
        cellClassName: "text-center",
      },
      {
        key: "tiers",
        header: "Tiers",
        kind: "tiers" as const,
        headerClassName: "text-center",
        cellClassName: "text-center",
      },
    ];
  }, [tierStatus, resolvedTiers]);

  const columnCount = useMemo(() => {
    // Event + (either tier columns OR points+tiers columns)
    return 1 + columns.length;
  }, [columns.length]);

  const headerColumns = columns.map((c, idx) => (
    <TableColumn
      key={c.key}
      className={
        [
          idx === columns.length - 1 ? "!rounded-br-none" : "",
          c.headerClassName || "",
        ]
          .filter(Boolean)
          .join(" ") || undefined
      }
    >
      {c.header}
    </TableColumn>
  ));

  return (
    <div className="tierTable border border-[#DEDEDE] rounded-lg overflow-hidden">
      <Table
        aria-label="Events points table"
        shadow="none"
        removeWrapper
        classNames={{
          th: "bg-[#F7F7F7] text-xs font-normal text-[#616161] px-3 py-2",
          td: "text-xs text-[#2E2E2E] px-3 py-2 border-t border-[#E3E3E3]",
          thead: "custom-thead",
        }}
      >
        <TableHeader>
          <TableColumn className="!rounded-bl-none pl-3">Event</TableColumn>
          {(headerColumns as unknown as ReactElement)}
        </TableHeader>

        <TableBody>
          {loading ? (
            // Show skeleton rows for better UX
            Array.from({ length: 7 }).map((_, rowIdx) => (
              <TableRow key={`skeleton_${rowIdx}`}>
                <TableCell className="pl-3">
                  <Skeleton className="h-4 w-32 rounded" />
                </TableCell>
                {(Array.from({ length: Math.max(0, columnCount - 1) }).map(
                  (_, colIdx) => (
                    <TableCell key={`skeleton_${rowIdx}_${colIdx}`}>
                      <Skeleton className="h-6 w-16 rounded-full mx-auto" />
                    </TableCell>
                  ),
                )) as unknown as ReactElement}
              </TableRow>
            ))
          ) : rows.length === 0 ? (
            <TableRow key="empty">
              <TableCell className="pl-3">No events configured yet.</TableCell>
              {(Array.from({ length: Math.max(0, columnCount - 1) }).map(
                (_, idx) => (
                  <TableCell key={`empty_${idx}`}> </TableCell>
                ),
              )) as unknown as ReactElement}
            </TableRow>
          ) : (
            rows.map((row) => {
              const isPurchase = row.key === "purchase";
              return (
                <TableRow key={row.key}>
                  <TableCell
                    className={`pl-3 ${row.showPurchaseTooltip ? "flex items-center gap-2" : ""}`}
                  >
                    {row.label}
                    {row.showPurchaseTooltip ? (
                      <Tooltip
                        showArrow={true}
                        closeDelay={0}
                        content="Tier multipliers apply only to Purchase points. Each tier has its own customizable multiplier. For example, if Purchase = 100 pts and Second Tier has a 1.2x multiplier, members earn 120 pts."
                        classNames={{
                          content: "max-w-xs whitespace-normal break-words",
                        }}
                        size="sm"
                      >
                        <Info
                          size={14}
                          className="cursor-pointer hover:text-black"
                        />
                      </Tooltip>
                    ) : null}
                  </TableCell>
                  {(columns.map((c) => {
                    if (c.kind === "tier") {
                      const multiplier = Number(c.tier.multiplier || 1);
                      const displayValue = isPurchase
                        ? row.basePoints * multiplier
                        : row.basePoints;
                      return (
                        <TableCell
                          key={`${row.key}_${c.key}`}
                          className={c.cellClassName}
                        >
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#F0F0F0] text-[#303030]">
                            {formatPointsPill(displayValue, {
                              forceTwoDecimals: isPurchase,
                            })}
                          </span>
                        </TableCell>
                      );
                    }

                    if (c.kind === "points") {
                      return (
                        <TableCell
                          key={`${row.key}_${c.key}`}
                          className={c.cellClassName}
                        >
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#F0F0F0] text-[#303030]">
                            {isPurchase
                              ? formatNumberTrim(row.basePoints, 2)
                              : formatPointsPill(row.basePoints)}
                          </span>
                        </TableCell>
                      );
                    }

                    // tiers column when tier system disabled
                    return (
                      <TableCell
                        key={`${row.key}_${c.key}`}
                        className={c.cellClassName || "text-center"}
                      >
                        <span className="inline-flex justify-center w-full">
                          ---
                        </span>
                      </TableCell>
                    );
                  }) as unknown as ReactElement)}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
