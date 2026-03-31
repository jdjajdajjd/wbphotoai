'use client'

import { Suspense } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { PaymentsScreen } from '@/features/payments/PaymentsScreen'

function PaymentsContent() {
  return <PaymentsScreen />
}

export default function PaymentsPage() {
  return (
    <AppShell>
      <Suspense fallback={<div className="px-4 pt-6 text-white/40 text-sm">Загрузка...</div>}>
        <PaymentsContent />
      </Suspense>
    </AppShell>
  )
}
