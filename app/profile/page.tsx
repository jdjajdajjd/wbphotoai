'use client'

import { AppShell } from '@/components/layout/AppShell'
import { ProfileScreen } from '@/features/profile/ProfileScreen'

export default function ProfilePage() {
  return (
    <AppShell>
      <ProfileScreen />
    </AppShell>
  )
}
