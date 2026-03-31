'use client'

import { AppShell } from '@/components/layout/AppShell'
import { NewProjectScreen } from '@/features/projects/NewProjectScreen'

export default function NewProjectPage() {
  return (
    <AppShell>
      <NewProjectScreen />
    </AppShell>
  )
}
