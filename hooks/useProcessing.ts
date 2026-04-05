'use client'

import { useState, useRef } from 'react'

export type ProcessingState = 'idle' | 'starting' | 'processing' | 'done' | 'error'

// Operations that go through KIE.ai API
const KIE_OPERATIONS = ['remove_bg', 'upscale']

// Operations handled client-side or mocked (resolve after delay)
const MOCK_OPERATIONS: Record<string, string> = {
  white_bg: 'Белый фон',
  square_format: 'Квадрат 1:1',
  vertical_creative: 'Вертикальный баннер',
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

// ─── Text generation helpers ──────────────────────────────────────────────────

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'Одежда и аксессуары': ['модный', 'стильный', 'качественный', 'универсальный'],
  'Электроника': ['высокопроизводительный', 'надёжный', 'технологичный', 'мощный'],
  'Дом и сад': ['практичный', 'долговечный', 'удобный', 'функциональный'],
  'Красота и здоровье': ['натуральный', 'эффективный', 'профессиональный', 'безопасный'],
  'Детские товары': ['безопасный', 'развивающий', 'яркий', 'прочный'],
  'Спорт и отдых': ['профессиональный', 'прочный', 'лёгкий', 'эргономичный'],
  'Автотовары': ['надёжный', 'качественный', 'универсальный', 'долговечный'],
  'Продукты питания': ['натуральный', 'вкусный', 'свежий', 'полезный'],
  'Книги и канцелярия': ['качественный', 'удобный', 'практичный', 'стильный'],
}

const DELIVERY_PHRASES = [
  'Быстрая доставка по всей России',
  'Доставка за 1–3 дня по России',
  'Доставка в любой регион РФ',
]

const QUALITY_PHRASES = [
  'Сертифицированное качество',
  'Проверенное качество',
  'Оригинальный товар',
  'Гарантия качества от производителя',
]

const RETURN_PHRASES = [
  'Возврат в течение 14 дней',
  'Возврат и обмен без вопросов',
  'Лёгкий возврат через маркетплейс',
]

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function generateTitle(productTitle: string, category?: string): string {
  const kw = category ? CATEGORY_KEYWORDS[category] : undefined
  const adj = kw ? pick(kw) : 'качественный'

  // WB/Ozon style: noun phrase + key attribute + marketplace signal
  const templates = [
    `${productTitle} — ${adj}, купить с доставкой`,
    `${productTitle} | ${adj} товар для дома и офиса`,
    `${productTitle} — ${adj}, оригинал, в наличии`,
    `${productTitle} | купить выгодно, быстрая доставка`,
    `${productTitle} — ${pick(QUALITY_PHRASES).toLowerCase()}`,
  ]
  return pick(templates)
}

function generateDescription(productTitle: string, category?: string): string {
  const kw = category ? CATEGORY_KEYWORDS[category] : undefined
  const adj1 = kw ? pick(kw) : 'качественный'
  const adj2 = kw ? pick(kw.filter(k => k !== adj1)) || 'надёжный' : 'надёжный'

  const categoryNote = category
    ? `Идеально подходит для категории «${category}».`
    : 'Подходит для любых целей.'

  return [
    `✅ ${productTitle} — ${adj1} и ${adj2} товар от проверенного продавца.`,
    ``,
    `📦 ${categoryNote}`,
    ``,
    `🔑 Преимущества:`,
    `• ${pick(QUALITY_PHRASES)}`,
    `• ${pick(DELIVERY_PHRASES)}`,
    `• ${pick(RETURN_PHRASES)}`,
    `• Упаковка защищает товар при транспортировке`,
    ``,
    `📞 Остались вопросы? Пишите в чат — ответим за 15 минут!`,
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
            setResultUrls(prev => [...prev, data.resultUrl])
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
          // skip failed starts
        }
      }
    }

    // 2. Mock operations — show as processing, then resolve after delay
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
        const title = productTitle || 'Товар'

        for (const task of mockTasks) {
          let resultText: string | undefined

          if (task.operation === 'gen_title') {
            resultText = generateTitle(title, productCategory)
            texts.title = resultText
          } else if (task.operation === 'gen_description') {
            resultText = generateDescription(title, productCategory)
            texts.description = resultText
          } else if (task.operation === 'white_bg') {
            resultText = `Белый фон применён к ${imageUrls.length} фото`
          } else if (task.operation === 'square_format') {
            resultText = `Квадратный формат 1:1 применён к ${imageUrls.length} фото`
          } else if (task.operation === 'vertical_creative') {
            resultText = `Вертикальный баннер 4:5 создан для ${imageUrls.length} фото`
          } else if (task.operation === 'cover') {
            resultText = `Обложка карточки создана (${imageUrls.length} вариант${imageUrls.length > 1 ? 'а' : ''})`
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
