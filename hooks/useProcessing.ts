'use client'

import { useState, useRef } from 'react'

export type ProcessingState = 'idle' | 'starting' | 'processing' | 'done' | 'error'

interface TaskProgress {
  taskId: string
  operation: string
  state: ProcessingState
  resultUrl?: string
}

export function useProcessing() {
  const [tasks, setTasks] = useState<TaskProgress[]>([])
  const [overallState, setOverallState] = useState<ProcessingState>('idle')
  const [resultUrls, setResultUrls] = useState<string[]>([])
  const pollRefs = useRef<Record<string, ReturnType<typeof setInterval>>>({})

  function updateTask(taskId: string, data: Partial<TaskProgress>) {
    setTasks(prev => prev.map(t => t.taskId === taskId ? { ...t, ...data } : t))
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
          checkAllDone()
        } else if (data.state === 'fail') {
          clearInterval(pollRefs.current[taskId])
          updateTask(taskId, { state: 'error' })
          checkAllDone()
        }
      } catch {
        clearInterval(pollRefs.current[taskId])
        updateTask(taskId, { state: 'error' })
      }
    }, 3000)

    pollRefs.current[taskId] = interval
  }

  function checkAllDone() {
    setTasks(current => {
      const allDone = current.every(t => t.state === 'done' || t.state === 'error')
      if (allDone && current.length > 0) setOverallState('done')
      return current
    })
  }

  async function startProcessing(imageUrls: string[], operations: string[]) {
    setOverallState('starting')
    setResultUrls([])
    const newTasks: TaskProgress[] = []

    for (const imageUrl of imageUrls) {
      for (const operation of operations.filter(op => ['remove_bg', 'upscale'].includes(op))) {
        try {
          const res = await fetch('/api/process', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ operation, imageUrl }),
          })
          const data = await res.json()
          if (data.taskId) {
            newTasks.push({ taskId: data.taskId, operation, state: 'processing' })
          }
        } catch {
          // skip failed starts
        }
      }
    }

    setTasks(newTasks)
    setOverallState('processing')

    for (const task of newTasks) {
      pollTask(task.taskId)
    }

    if (newTasks.length === 0) {
      setOverallState('done')
    }
  }

  return { tasks, overallState, resultUrls, startProcessing }
}
