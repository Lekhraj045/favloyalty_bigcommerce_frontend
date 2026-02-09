"use client";

import { getCustomerReferrals, type CustomerReferral } from "@/utils/api";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/table";
import { useEffect, useState } from "react";

interface CustomerReferralTableAreaProps {
  customerId: string;
}

export default function CustomerReferralTableArea({
  customerId,
}: CustomerReferralTableAreaProps) {
  const [referrals, setReferrals] = useState<CustomerReferral[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!customerId) {
      setReferrals([]);
      setLoading(false);
      return;
    }
    let mounted = true;
    setLoading(true);
    getCustomerReferrals(customerId)
      .then((res) => {
        if (mounted && res.success && res.data) {
          setReferrals(res.data);
        }
      })
      .catch(() => {
        if (mounted) setReferrals([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [customerId]);

  return (
    <div className="tierTable border border-[#DEDEDE] rounded-lg overflow-hidden">
      <Table
        aria-label="Customer referral details table"
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
          <TableColumn className="!rounded-br-none" align="end">
            Points
          </TableColumn>
        </TableHeader>

        <TableBody
          emptyContent={
            loading ? "Loading..." : "No successful referrals"
          }
        >
          {referrals.map((ref, idx) => (
            <TableRow key={idx}>
              <TableCell>{ref.name || "—"}</TableCell>
              <TableCell>{ref.email || "—"}</TableCell>
              <TableCell>{ref.points.toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
