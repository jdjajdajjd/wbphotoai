'use client'

import { useState } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { SplashScreen } from '@/components/layout/SplashScreen'
import { DashboardScreen } from '@/features/dashboard/DashboardScreen'

export default function HomePage() {
  const [splashDone, setSplashDone] = useState(false)

  if (!splashDone) {
    return <SplashScreen onDone={() => setSplashDone(true)} />
  }

  return (
    <AppShell>
      <DashboardScreen />
    </AppShell>
  )
}
