export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { MOCK_PAYMENTS } from '@/lib/mock-data'

export async function GET() {
  const pendingPayments = MOCK_PAYMENTS.filter(
    (p) => p.status === 'needs_review' || p.status === 'pending'
  )
  return NextResponse.json({ payments: pendingPayments, all: MOCK_PAYMENTS })
}

export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const { paymentId, action } = body

  if (!paymentId || !action) {
    return NextResponse.json({ error: 'paymentId and action required' }, { status: 400 })
  }

  if (action === 'approve') {
    return NextResponse.json({
      success: true,
      paymentId,
      status: 'paid',
      creditsAdded: body.credits || 5,
      message: 'Платёж подтверждён. Кредиты начислены.',
    })
  }

  if (action === 'reject') {
    return NextResponse.json({
      success: true,
      paymentId,
      status: 'rejected',
      message: 'Платёж отклонён.',
    })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
