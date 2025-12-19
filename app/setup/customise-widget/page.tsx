"use client";

import React from 'react'
import SetupNavigation from '@/components/SetupNavigation'
import SetupHeader from '@/components/SetupHeader'

export default function CustomiseWidget() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col gap-4">
        <div className="head">
          <SetupHeader />
          <SetupNavigation />
        </div>
        <div>Customise Widget</div>
      </div>
    </div>
  )
}