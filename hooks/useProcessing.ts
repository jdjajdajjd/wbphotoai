'use client'

import { useState, useRef } from 'react'

export type ProcessingState = 'idle' | 'starting' | 'processing' | 'done' | 'error'

// Operations that go through KIE.ai API
const KIE_OPERATIONS = ['remove_bg', 'upscale']

// Operations that are mocked (shown as done instantly with explanation)
const MOCK_OPERATIONS: Record<string, string> = {
  square_format: 'Квадратный формат',
  vertical_creative: 'Вертикальный креатив',
  cover: 'Обложка карточки',
  gen_title: 'Заголовок товара',
  gen_description: 'Описание товара',
}

export interface TaskProgress {
  taskId: string
  operation: string
  label: string
  state: ProcessingState
  resultUrl?: string
  resultText?: string
}

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
    const allDone = current.every(t => t.state === 'done' || t.state === 'error')
    if (allDone && current.length > 0) setOverallState('done')
  }

  function pollTask(taskId: string) {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/process?taskId=${taskId}`)
        const data = await res.json()

        if (data.state === 'success') {
          clearInterval(pollRefs.current[taskId])
          updateTask(taskId, { state: 'done', resultUrl: data.resultUrl })
          if (data.resultUrl) {
            setResultUrls(prev => {
              const next = [...prev, data.resultUrl]
              return next
            })
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

  async function startProcessing(imageUrls: string[], operations: string[], productTitle?: string) {
    setOverallState('starting')
    setResultUrls([])
    setGeneratedTexts({})
    const newTasks: TaskProgress[] = []

    // 1. Real KIE.ai operations
    for (const imageUrl of imageUrls) {
      for (const operation of operations.filter(op => KIE_OPERATIONS.includes(op))) {
        try {
          const res = await fetch('/api/process', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ operation, imageUrl }),
          })
          const data = await res.json()
          if (data.taskId) {
            newTasks.push({
              taskId: data.taskId,
              operation,
              label: operation === 'remove_bg' ? 'Убираем фон' : 'Улучшаем качество',
              state: 'processing',
            })
          }
        } catch {
          // skip
        }
      }
    }

    // 2. Mock operations — show as processing briefly then done
    for (const operation of operations.filter(op => op in MOCK_OPERATIONS)) {
      const mockId = `mock_${operation}_${Date.now()}`
      newTasks.push({
        taskId: mockId,
        operation,
        label: MOCK_OPERATIONS[operation],
        state: 'processing',
      })
    }

    setTasks(newTasks)
    setOverallState('processing')

    // Start polling for real tasks
    for (const task of newTasks.filter(t => !t.taskId.startsWith('mock_'))) {
      pollTask(task.taskId)
    }

    // Resolve mock tasks after delay
    const mockTasks = newTasks.filter(t => t.taskId.startsWith('mock_'))
    if (mockTasks.length > 0) {
      setTimeout(() => {
        const texts: { title?: string; description?: string } = {}

        for (const task of mockTasks) {
          let resultText: string | undefined

          if (task.operation === 'gen_title') {
            resultText = `${productTitle || 'Товар'} — купить с доставкой по России`
            texts.title = resultText
          } else if (task.operation === 'gen_description') {
            resultText = `Высококачественный товар. Быстрая доставка по всей России. Оригинальное качество, отличные характеристики.`
            texts.description = resultText
          }

          updateTask(task.taskId, { state: 'done', resultText })
        }

        setGeneratedTexts(texts)
        setTasks(current => { checkAllDone(current); return current })
      }, 4000)
    }

    if (newTasks.length === 0) setOverallState('done')
  }

  return { tasks, overallState, resultUrls, generatedTexts, startProcessing }
}
