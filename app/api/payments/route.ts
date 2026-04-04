export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { MOCK_PAYMENTS } from '@/lib/mock-data'

export async function GET() {
  return NextResponse.json({ payments: MOCK_PAYMENTS })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const payment = {
    id: `pay_${Date.now()}`,
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
  return NextResponse.json({ payment }, { status: 201 })
}
