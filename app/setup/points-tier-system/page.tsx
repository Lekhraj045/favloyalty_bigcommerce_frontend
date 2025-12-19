"use client";

import React from 'react'
import PointsSetting from './PointsSetting'
import SetupNavigation from '@/components/SetupNavigation'
import SetupHeader from '@/components/SetupHeader'

export default function PointsTierSystem() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col gap-4">
        <div className="head">
          <SetupHeader />
          <SetupNavigation />
        </div>
        <PointsSetting />
      </div>
    </div>
  )
}
