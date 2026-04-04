export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { MOCK_PROJECTS } from '@/lib/mock-data'

export async function GET() {
  return NextResponse.json({ projects: MOCK_PROJECTS })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const newProject = {
    id: `proj_${Date.now()}`,
    userId: 'user_demo',
    title: body.title || 'Новый проект',
    category: body.category,
    sourceImages: body.sourceImages || [],
    selectedOperations: body.selectedOperations || [],
    packageId: body.packageId,
    priceRub: body.priceRub || 0,
    status: 'draft' as const,
    resultImages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  return NextResponse.json({ project: newProject }, { status: 201 })
}
