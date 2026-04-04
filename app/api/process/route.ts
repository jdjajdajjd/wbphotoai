export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { startRemoveBackground, startUpscale, checkTask } from '@/services/kie'

// POST /api/process — start a task
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { operation, imageUrl } = body

  if (!imageUrl) {
    return NextResponse.json({ error: 'imageUrl required' }, { status: 400 })
  }

  try {
    let task
    if (operation === 'remove_bg') {
      task = await startRemoveBackground(imageUrl)
    } else if (operation === 'upscale') {
      task = await startUpscale(imageUrl)
    } else {
      return NextResponse.json({ error: `Unknown operation: ${operation}` }, { status: 400 })
    }

    return NextResponse.json({ taskId: task.taskId, model: task.model })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// GET /api/process?taskId=xxx — poll task status
export async function GET(req: NextRequest) {
  const taskId = new URL(req.url).searchParams.get('taskId')
  if (!taskId) {
    return NextResponse.json({ error: 'taskId required' }, { status: 400 })
  }

  try {
    const result = await checkTask(taskId)
    return NextResponse.json(result)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
