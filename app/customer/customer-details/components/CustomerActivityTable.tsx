"use client";
import { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
} from "@heroui/table";
import { getCustomerTransactions, type Transaction } from "@/utils/api";

interface CustomerActivityTableAreaProps {
    customerId: string;
    refreshKey?: number;
}

export default function CustomerActivityTableArea({ customerId, refreshKey }: CustomerActivityTableAreaProps) {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTransactions = async () => {
        if (!customerId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const response = await getCustomerTransactions(customerId, {
                limit: 50,
                page: 1,
            });
            setTransactions(response.data);
        } catch (err) {
            console.error("Error fetching transactions:", err);
            setError(err instanceof Error ? err.message : "Failed to load transactions");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, [customerId, refreshKey]);

    // Format date helper
    const formatDate = (date: Date | string): string => {
        try {
            const d = typeof date === "string" ? new Date(date) : date;
            const month = d.toLocaleDateString("en-US", { month: "short" });
            const day = d.getDate();
            const hours = d.getHours();
            const minutes = d.getMinutes();
            const ampm = hours >= 12 ? "pm" : "am";
            const displayHours = hours % 12 || 12;
            const displayMinutes = minutes.toString().padStart(2, "0");
            return `${month} ${day} at ${displayHours}:${displayMinutes}${ampm}`;
        } catch {
            return "N/A";
        }
    };

    // Get status badge styling
    const getStatusBadgeClass = (status: string): string => {
        switch (status) {
            case "completed":
                return "bg-green-100 text-green-700";
            case "pending":
                return "bg-[#FFEB78] text-[#4f4700]";
            case "expired":
                return "bg-gray-100 text-gray-700";
            case "cancelled":
            case "failed":
                return "bg-red-100 text-red-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    // Get status display text
    const getStatusText = (status: string): string => {
        switch (status) {
            case "completed":
                return "Completed";
            case "pending":
                return "In Progress";
            case "expired":
                return "Expired";
            case "cancelled":
                return "Cancelled";
            case "failed":
                return "Failed";
            default:
                return status;
        }
    };

    // Get type display text
    const getTypeText = (type: string, transactionCategory?: string): string => {
        if (transactionCategory === "referral") {
            return "Referral";
        }
        switch (type) {
            case "earn":
            case "signup":
                return "Earn";
            case "redeem":
                return "Redeem";
            case "adjustment":
                return "Adjustment";
            case "refund":
                return "Refund";
            case "expiration":
                return "Expiration";
            default:
                return type;
        }
    };

    if (loading) {
        return (
            <div className="tierTable border border-[#DEDEDE] rounded-lg overflow-hidden">
                <div className="flex items-center justify-center p-8">
                    <p className="text-gray-500 text-sm">Loading transactions...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="tierTable border border-[#DEDEDE] rounded-lg overflow-hidden">
                <div className="flex items-center justify-center p-8">
                    <p className="text-red-500 text-sm">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="tierTable border border-[#DEDEDE] rounded-lg overflow-hidden">
            <Table
                aria-label="Customer activity table"
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
                        Date
                    </TableColumn>
                    <TableColumn>Activity</TableColumn>
                    <TableColumn>Status</TableColumn>
                    <TableColumn>Type</TableColumn>
                    <TableColumn className="!rounded-br-none" align="end">
                        Points
                    </TableColumn>
                </TableHeader>

                <TableBody
                    emptyContent="No transactions found"
                >
                    {transactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                            <TableCell>
                                {formatDate(transaction.createdAt)}
                            </TableCell>

                            <TableCell>{transaction.description}</TableCell>

                            <TableCell>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${getStatusBadgeClass(transaction.status)}`}>
                                    {getStatusText(transaction.status)}
                                </span>
                            </TableCell>

                            <TableCell>
                                {getTypeText(transaction.type, transaction.transactionCategory)}
                            </TableCell>

                            <TableCell>
                                {transaction.points > 0 ? "+" : ""}{transaction.points}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
