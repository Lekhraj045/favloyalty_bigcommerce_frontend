"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ChannelSelector from "@/components/ChannelSelector";
import { Button } from "@heroui/button";
import { ArrowLeft, Calendar, CalendarHeart, Mail, Phone, Users, VenusAndMars } from "lucide-react";
import CustomerActivityTableArea from "./components/CustomerActivityTable";
import AdjustBalanceModal from "./components/AdjustBalanceModal";
import AdjustTierModal from "./components/AdjustTierModal";
import SuccessfulReferralsModal from "./components/SuccessfulReferralsModal";


export default function CustomerDetailsPage() {
    const router = useRouter();
    const [isAdjustBalanceModalOpen, setIsAdjustBalanceModalOpen] = useState(false);
    const [isAdjustTierModalOpen, setIsAdjustTierModalOpen] = useState(false);
    const [isSuccessfulReferralsModalOpen, setIsSuccessfulReferralsModalOpen] = useState(false);

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
                                <h1 className="text-xl font-bold">Ayumu Hirano</h1>
                                <p>Member Since 19th November 2025</p>
                            </div>
                        </div>

                        <div className="flex gap-2.5 items-center">
                            <ChannelSelector />
                            <Button className="custom-btn">Upgrade</Button>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="w-2xs">
                            <div className="card !p-0">
                                <div className="flex flex-col">
                                    <div className="flex gap-3 items-center border-b border-[#DEDEDE] p-4">
                                        <div className="w-10 h-10 min-w-10 min-h-10 max-w-10 max-h-10 rounded-full border border-[#DEDEDE] flex items-center justify-center bg-[#392D5D] text-white font-bold uppercase">
                                            Ah
                                        </div>

                                        <div className="flex flex-col gap-1.5">
                                            <div className="flex gap-2 items-center font-bold">
                                                Ayumu Hirano
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3 p-4">
                                        <div className="flex gap-2 items-center">
                                            <Mail size={14} /> ayumu.hirano@example.com
                                        </div>
                                        <div className="flex gap-2 items-center">
                                            <Phone size={14} /> No contact number
                                        </div>
                                        <div className="flex gap-2 items-center">
                                            <VenusAndMars size={14} /> Gender: N/A
                                        </div>
                                        <div className="flex gap-2 items-center">
                                            <Users size={14} /> Age Group: 18–24
                                        </div>
                                        <div className="flex gap-2 items-center">
                                            <Calendar size={14} /> DOB: 20-01-2026
                                        </div>
                                        <div className="flex gap-2 items-center">
                                            <CalendarHeart size={14} /> Wedding Anniversary: 20-01-2026
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
                                                <h2 className="text-lg font-bold">300</h2>
                                            </div>

                                            <Button 
                                                className="custom-btn"
                                                onPress={() => setIsAdjustBalanceModalOpen(true)}
                                            >
                                                Adjust Balance
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="card">
                                        <div className="flex gap-4 justify-between items-center">
                                            <div className="flex flex-col gap-1">
                                                <p>Successful Referrals</p>
                                                <h2 className="text-lg font-bold">1</h2>
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

                                <div className="card">
                                    <div className="flex gap-4 justify-between items-center">
                                        <div className="flex flex-col gap-1">
                                            <p>Current Tier</p>
                                            <h2 className="text-lg">Silver Tier</h2>
                                        </div>
                                        <Button 
                                            className="custom-btn"
                                            onPress={() => setIsAdjustTierModalOpen(true)}
                                        >
                                            Change Tier
                                        </Button>
                                    </div>
                                </div>

                                <div className="card !p-0">
                                    <div className="flex justify-between items-center gap-4 border-b border-[#DEDEDE] p-4">
                                        <h2 className="text-sm font-bold">Customer Activity</h2>
                                    </div>
                                    <div className="flex flex-col gap-2 p-4">
                                        <CustomerActivityTableArea />
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
                currentBalance={300}
            />

            <AdjustTierModal
                isOpen={isAdjustTierModalOpen}
                onClose={() => setIsAdjustTierModalOpen(false)}
                currentTier="Silver"
            />

            <SuccessfulReferralsModal
                isOpen={isSuccessfulReferralsModalOpen}
                onClose={() => setIsSuccessfulReferralsModalOpen(false)}
            />
        </>
    );
}
