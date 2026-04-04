export const runtime = 'edge'

import { NextResponse } from 'next/server'

export async function POST() {
  // Simulate a small delay
  await new Promise((r) => setTimeout(r, 500))

  return NextResponse.json({
    success: true,
    creditsAdded: 5,
    message: 'Тестовая оплата прошла успешно. +5 кредитов начислено.',
    paymentId: `test_${Date.now()}`,
  })
}
