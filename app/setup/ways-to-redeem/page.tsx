"use client";

import React from 'react'
import SetupNavigation from '@/components/SetupNavigation'
import SetupHeader from '@/components/SetupHeader'

export default function WaysToRedeem() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col gap-4">
        <div className="head">
          <SetupHeader />
          <SetupNavigation />
        </div>
        <div>Ways To Redeem</div>
      </div>
    </div>
  )
}