'use client'

import { useState, useRef } from 'react'

export type ProcessingState = 'idle' | 'starting' | 'processing' | 'done' | 'error'

// Real AI via KIE.ai
const KIE_OPERATIONS = ['remove_bg', 'upscale']

// Client-side canvas processing (need source image)
const CANVAS_OPERATIONS = ['white_bg', 'square_format']

// Text template generation
const TEXT_OPERATIONS = ['gen_title', 'gen_description']

// Not yet implemented — skip silently and mark as "coming soon"
const SOON_OPERATIONS = ['vertical_creative', 'cover']

export interface TaskProgress {
  taskId: string
  operation: string
  label: string
  state: ProcessingState
  resultUrl?: string
  resultText?: string
  isSoon?: boolean
}

// ─── Canvas helpers ───────────────────────────────────────────────────────────

async function loadImageViaProxy(url: string): Promise<ImageBitmap> {
  const proxied = `/api/proxy-image?url=${encodeURIComponent(url)}`
  const res = await fetch(proxied)
  if (!res.ok) throw new Error('Could not load image')
  const blob = await res.blob()
  return createImageBitmap(blob)
}

async function canvasToSupabase(canvas: HTMLCanvasElement): Promise<string | null> {
  return new Promise((resolve) => {
    canvas.toBlob(async (blob) => {
      if (!blob) { resolve(null); return }
      const fd = new FormData()
      fd.append('file', blob, 'result.png')
      try {
        const res = await fetch('/api/upload', { method: 'POST', body: fd })
        const data = await res.json()
        resolve(data.url ?? null)
      } catch {
        resolve(null)
      }
    }, 'image/png')
  })
}

async function applyWhiteBg(imageUrl: string): Promise<string | null> {
  try {
    const img = await loadImageViaProxy(imageUrl)
    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0)
    return canvasToSupabase(canvas)
  } catch {
    return null
  }
}

async function applySquareFormat(imageUrl: string): Promise<string | null> {
  try {
    const img = await loadImageViaProxy(imageUrl)
    const size = Math.min(img.width, img.height)
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')!
    const sx = (img.width - size) / 2
    const sy = (img.height - size) / 2
    ctx.drawImage(img, sx, sy, size, size, 0, 0, size, size)
    return canvasToSupabase(canvas)
  } catch {
    return null
  }
}

// ─── Text generation ──────────────────────────────────────────────────────────

// WB/Ozon use factual titles: [Brand] Product [Color] [Size/Spec]
// Without product data we generate a structured template the seller fills in
function generateTitle(productTitle: string, category?: string): string {
  const cat = category ? ` (${category})` : ''
  // Clean title format close to real WB listings
  const lines = [
    `${productTitle}${cat}`,
    ``,
    `💡 Совет: для лучшего ранжирования добавьте бренд, цвет и ключевую характеристику.`,
    `Пример: Samsung Микроволновая печь 23л, чёрная, 800 Вт`,
  ]
  return lines.join('\n')
}

function generateDescription(productTitle: string, category?: string): string {
  const catLine = category ? `Тип: ${category}` : 'Тип: [указать]'
  return [
    `${productTitle}`,
    ``,
    `Характеристики:`,
    `• ${catLine}`,
    `• Бренд: [указать]`,
    `• Цвет: [указать]`,
    `• Материал: [указать]`,
    `• Размер / объём: [указать]`,
    `• Страна производства: [указать]`,
    `• Комплектация: ${productTitle} — 1 шт., инструкция — 1 шт.`,
    ``,
    `Описание:`,
    `${productTitle} — [добавьте 2–3 предложения о товаре: для чего подходит, преимущества, особенности].`,
    ``,
    `⚠️ Замените всё в [скобках] на реальные данные вашего товара перед публикацией.`,
  ].join('\n')
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useProcessing() {
  const [tasks, setTasks] = useState<TaskProgress[]>([])
  const [overallState, setOverallState] = useState<ProcessingState>('idle')
  const [resultUrls, setResultUrls] = useState<string[]>([])
  const [generatedTexts, setGeneratedTexts] = useState<{ title?: string; description?: string }>({})
  const pollRefs = useRef<Record<string, ReturnType<typeof setInterval>>>({})

  function updateTask(taskId: string, data: Partial<TaskProgress>) {
    setTasks(prev => prev.map(t => t.taskId === taskId ? { ...t, ...data } : t))
  }

  function checkAllDone(current: TaskProgress[]) {
    const relevant = current.filter(t => !t.isSoon)
    const allDone = relevant.every(t => t.state === 'done' || t.state === 'error')
    if (allDone && relevant.length > 0) setOverallState('done')
  }

  function pollTask(taskId: string, onSuccess?: (resultUrl: string) => void) {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/process?taskId=${taskId}`)
        const data = await res.json()

        if (data.state === 'success') {
          clearInterval(pollRefs.current[taskId])
          updateTask(taskId, { state: 'done', resultUrl: data.resultUrl })
          if (data.resultUrl) {
            setResultUrls(prev => [...prev, data.resultUrl])
            onSuccess?.(data.resultUrl)
          }
          setTasks(current => { checkAllDone(current); return current })
        } else if (data.state === 'fail') {
          clearInterval(pollRefs.current[taskId])
          updateTask(taskId, { state: 'error' })
          setTasks(current => { checkAllDone(current); return current })
        }
      } catch {
        clearInterval(pollRefs.current[taskId])
        updateTask(taskId, { state: 'error' })
      }
    }, 3000)
    pollRefs.current[taskId] = interval
  }

  async function startProcessing(
    imageUrls: string[],
    operations: string[],
    productTitle?: string,
    productCategory?: string,
  ) {
    setOverallState('starting')
    setResultUrls([])
    setGeneratedTexts({})
    const newTasks: TaskProgress[] = []

    const title = productTitle || 'Товар'

    // 1. Real KIE.ai operations
    for (const imageUrl of imageUrls) {
      for (const op of operations.filter(o => KIE_OPERATIONS.includes(o))) {
        try {
          const res = await fetch('/api/process', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ operation: op, imageUrl }),
          })
          const data = await res.json()
          if (data.taskId) {
            newTasks.push({
              taskId: data.taskId,
              operation: op,
              label: op === 'remove_bg' ? 'Убираем фон (AI)' : 'Улучшаем качество (AI)',
              state: 'processing',
            })
          }
        } catch { /* skip */ }
      }
    }

    // 2. Canvas operations — start as "processing", resolve after KIE remove_bg or from source
    for (const op of operations.filter(o => CANVAS_OPERATIONS.includes(o))) {
      const mockId = `canvas_${op}_${Date.now()}`
      newTasks.push({
        taskId: mockId,
        operation: op,
        label: op === 'white_bg' ? 'Добавляем белый фон...' : 'Обрезаем в квадрат...',
        state: 'processing',
      })
    }

    // 3. Text generation — instant
    for (const op of operations.filter(o => TEXT_OPERATIONS.includes(o))) {
      const mockId = `text_${op}_${Date.now()}`
      newTasks.push({
        taskId: mockId,
        operation: op,
        label: op === 'gen_title' ? 'Заголовок товара' : 'Описание товара',
        state: 'processing',
      })
    }

    // 4. "Coming soon" operations — add but mark as isSoon, don't block overall state
    for (const op of operations.filter(o => SOON_OPERATIONS.includes(o))) {
      const mockId = `soon_${op}_${Date.now()}`
      newTasks.push({
        taskId: mockId,
        operation: op,
        label: op === 'cover' ? 'Обложка карточки' : 'Вертикальный баннер',
        state: 'done',
        resultText: 'Скоро — функция в разработке',
        isSoon: true,
      })
    }

    setTasks(newTasks)
    setOverallState('processing')

    // Start polling for KIE tasks
    for (const task of newTasks.filter(t => !t.taskId.startsWith('canvas_') && !t.taskId.startsWith('text_') && !t.taskId.startsWith('soon_'))) {
      pollTask(task.taskId)
    }

    // Text ops — resolve after 1 second
    const textTasks = newTasks.filter(t => t.taskId.startsWith('text_'))
    if (textTasks.length > 0) {
      setTimeout(() => {
        const texts: { title?: string; description?: string } = {}
        for (const task of textTasks) {
          if (task.operation === 'gen_title') {
            const t = generateTitle(title, productCategory)
            texts.title = t
            updateTask(task.taskId, { state: 'done', resultText: t })
          } else if (task.operation === 'gen_description') {
            const d = generateDescription(title, productCategory)
            texts.description = d
            updateTask(task.taskId, { state: 'done', resultText: d })
          }
        }
        setGeneratedTexts(texts)
        setTasks(current => { checkAllDone(current); return current })
      }, 1000)
    }

    // Canvas ops — process source images immediately
    const canvasTasks = newTasks.filter(t => t.taskId.startsWith('canvas_'))
    for (const task of canvasTasks) {
      // Process all source images for this op
      ;(async () => {
        const results: string[] = []
        for (const imageUrl of imageUrls) {
          let url: string | null = null
          if (task.operation === 'white_bg') {
            url = await applyWhiteBg(imageUrl)
          } else if (task.operation === 'square_format') {
            url = await applySquareFormat(imageUrl)
          }
          if (url) results.push(url)
        }

        if (results.length > 0) {
          setResultUrls(prev => [...prev, ...results])
          updateTask(task.taskId, { state: 'done', resultUrl: results[0] })
        } else {
          updateTask(task.taskId, {
            state: 'error',
            resultText: 'Не удалось обработать — попробуйте ещё раз',
          })
        }
        setTasks(current => { checkAllDone(current); return current })
      })()
    }

    if (newTasks.filter(t => !t.isSoon).length === 0) setOverallState('done')
  }

  return { tasks, overallState, resultUrls, generatedTexts, startProcessing }
}
