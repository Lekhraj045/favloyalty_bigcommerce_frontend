'use client'

import { Slider } from "@heroui/slider";
import { useState, useEffect } from 'react'

interface PlanSliderAreaProps {
    onOrdersChange?: (orders: number) => void;
    onPriceChange?: (price: number) => void;
}

export default function PlanSliderArea({
    onOrdersChange,
    onPriceChange,
}: PlanSliderAreaProps) {
    const [value, setValue] = useState<number>(5100)
    const minValue = 750;
    const maxValue = 10000;
    const step = 50;
    const basePrice = 20.00; // Price at 750 orders
    const pricePer50Orders = 1.00; // Price increase per 50 orders
    const overageCharge = 5.00;
    const overageThreshold = 100;

    // Calculate monthly price based on orders
    const calculatePrice = (orders: number) => {
        const ordersAboveBase = orders - minValue;
        const increments = Math.floor(ordersAboveBase / 50);
        return basePrice + (increments * pricePer50Orders);
    };

    const monthlyPrice = calculatePrice(value);

    useEffect(() => {
        if (onOrdersChange) {
            onOrdersChange(value);
        }
        if (onPriceChange) {
            onPriceChange(monthlyPrice);
        }
    }, [value, monthlyPrice, onOrdersChange, onPriceChange]);

    const handleChange = (val: number | number[]) => {
        let newValue: number;
        if (typeof val === 'number') {
            newValue = val;
        } else if (Array.isArray(val) && val.length > 0) {
            newValue = val[0];
        } else {
            return;
        }
        // Ensure value is always a multiple of 50
        const roundedValue = Math.round(newValue / step) * step;
        setValue(Math.max(minValue, Math.min(maxValue, roundedValue)));
    };

    return (
        <>
            <div className="card">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-base font-bold">Configure Your Pro Plan</h2>
                        <p className="text-sm font-medium !text-[#303030]">Monthly (${monthlyPrice.toFixed(2)}/month)</p>
                    </div>

                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-4">
                            <div className="flex-1 relative">
                                <Slider
                                    label="Select Your Estimated Monthly Orders"
                                    step={step}
                                    minValue={minValue}
                                    maxValue={maxValue}
                                    size="md"
                                    value={value}
                                    onChange={handleChange}
                                    showTooltip
                                    className="w-full"
                                    color="foreground"
                                    classNames={{
                                        label: "text-xs",
                                    }}
                                />
                            </div>
                        </div>

                        <p className="text-sm text-[#303030]">
                            If you exceed <span className="font-bold text-[#303030]">{value.toLocaleString()} orders</span>, an overage charge of <span className="font-bold text-[#303030]">${overageCharge.toFixed(2)}</span> applies for every additional <span className="font-bold text-[#303030]">{overageThreshold} orders</span>.
                        </p>
                    </div>
                </div>
            </div>
        </>
    )
}