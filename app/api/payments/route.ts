export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { MOCK_PAYMENTS, MOCK_PACKAGES } from '@/lib/mock-data'
import { notifyAdminNewPayment } from '@/services/telegram-bot'

const ADMIN_TELEGRAM_ID = process.env.ADMIN_TELEGRAM_ID || '999999999'

export async function GET() {
  return NextResponse.json({ payments: MOCK_PAYMENTS })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const paymentId = `pay_${Date.now()}`
  const payment = {
    id: paymentId,
    userId: 'user_demo',
    projectId: body.projectId,
    packageId: body.packageId,
    method: body.method || 'manual',
    amountRub: body.amountRub || 0,
    starsAmount: body.starsAmount || 0,
    status: body.method === 'test' ? 'paid' : 'needs_review',
    payerName: body.payerName,
    payerComment: body.payerComment,
    paymentNote: body.paymentNote,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  // Notify admin in Telegram when manual payment is submitted
  if (body.method === 'manual' && body.payerName) {
    const pkg = MOCK_PACKAGES.find(p => p.id === body.packageId)
    await notifyAdminNewPayment({
      adminId: ADMIN_TELEGRAM_ID,
      payerName: body.payerName,
      amount: body.amountRub || 0,
      packageName: pkg?.name || body.packageId || '—',
      comment: body.payerComment,
      paymentId,
    }).catch(() => {}) // don't fail the request if notification fails
  }

  return NextResponse.json({ payment }, { status: 201 })
}
