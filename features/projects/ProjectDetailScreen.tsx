'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, ImageIcon, Download, Sparkles, CheckCircle2, Clock, XCircle, Loader2 } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { GradientButton } from '@/components/ui/GradientButton'
import { StatusPill } from '@/components/ui/StatusPill'
import { useStore } from '@/hooks/useStore'
import { OPERATIONS } from '@/lib/constants'
import { formatRub, formatDate } from '@/lib/utils'
import { useState } from 'react'
import { toast } from 'sonner'

const MOCK_RESULT_IMAGES = ['/demo/result-1.jpg', '/demo/result-2.jpg', '/demo/result-3.jpg']

export function ProjectDetailScreen({ projectId }: { projectId: string }) {
  const router = useRouter()
  const { projects, updateProject } = useStore()
  const project = projects.find((p) => p.id === projectId) ?? projects[0]
  const [isProcessing, setIsProcessing] = useState(false)
  const [processed, setProcessed] = useState(project?.status === 'done')

  async function handleProcess() {
    setIsProcessing(true)
    await new Promise((r) => setTimeout(r, 3000))
    setIsProcessing(false)
    setProcessed(true)
    updateProject(projectId, { status: 'done', resultImages: MOCK_RESULT_IMAGES })
    toast.success('Генерация завершена! Результаты готовы.', { icon: '✨' })
  }

  if (!project) {
    return (
      <div className="px-4 pt-6 text-center">
        <p className="text-white/40 text-sm mt-20">Проект не найден</p>
        <button onClick={() => router.push('/projects')} className="text-green-400 text-sm mt-3">
          ← Назад к проектам
        </button>
      </div>
    )
  }

  const statusIcon = {
    done: <CheckCircle2 className="w-4 h-4 text-green-400" />,
    processing: <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />,
    rejected: <XCircle className="w-4 h-4 text-red-400" />,
    payment_review: <Clock className="w-4 h-4 text-orange-400" />,
    paid: <CheckCircle2 className="w-4 h-4 text-green-400" />,
    waiting_payment: <Clock className="w-4 h-4 text-yellow-400" />,
    draft: <Clock className="w-4 h-4 text-gray-400" />,
  }[project.status]

  return (
    <div className="px-4 pt-6 pb-32">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => router.back()}
          className="w-8 h-8 glass rounded-xl flex items-center justify-center"
        >
          <ArrowLeft className="w-4 h-4 text-white/60" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-bold text-white truncate">{project.title}</h1>
          <div className="flex items-center gap-2">
            {statusIcon}
            <StatusPill status={project.status} size="sm" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Info card */}
        <GlassCard padding="md">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-white/35 text-xs mb-0.5">Категория</div>
              <div className="text-white/80">{project.category || '—'}</div>
            </div>
            <div>
              <div className="text-white/35 text-xs mb-0.5">Пакет</div>
              <div className="text-white/80">{project.package?.name || '—'}</div>
            </div>
            <div>
              <div className="text-white/35 text-xs mb-0.5">Стоимость</div>
              <div className="text-green-400 font-semibold">{formatRub(project.priceRub)}</div>
            </div>
            <div>
              <div className="text-white/35 text-xs mb-0.5">Создан</div>
              <div className="text-white/80 text-xs">{formatDate(project.createdAt)}</div>
            </div>
          </div>
        </GlassCard>

        {/* Source images */}
        <GlassCard padding="md">
          <div className="text-xs text-white/40 font-medium mb-3">
            Исходные изображения ({project.sourceImages.length})
          </div>
          <div className="flex gap-2 flex-wrap">
            {project.sourceImages.length > 0 ? (
              project.sourceImages.map((img, i) => (
                <div
                  key={i}
                  className="w-16 h-16 rounded-xl overflow-hidden bg-white/5 border border-white/8 flex items-center justify-center"
                >
                  <ImageIcon className="w-5 h-5 text-white/20" />
                </div>
              ))
            ) : (
              <div className="text-white/30 text-xs">Нет изображений</div>
            )}
          </div>
        </GlassCard>

        {/* Operations */}
        <GlassCard padding="md">
          <div className="text-xs text-white/40 font-medium mb-3">Выбранные операции</div>
          <div className="flex flex-wrap gap-2">
            {project.selectedOperations.map((op) => {
              const def = OPERATIONS.find((o) => o.id === op)
              return (
                <div
                  key={op}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-xs text-green-300"
                >
                  <span>{def?.icon}</span>
                  <span>{def?.label || op}</span>
                </div>
              )
            })}
          </div>
        </GlassCard>

        {/* Results */}
        {(processed || project.status === 'done') ? (
          <GlassCard padding="md">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs text-white/40 font-medium">Результаты</div>
              <CheckCircle2 className="w-4 h-4 text-green-400" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {MOCK_RESULT_IMAGES.map((img, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-xl overflow-hidden bg-white/5 border border-white/8 relative flex items-center justify-center"
                >
                  <div className="text-center">
                    <Sparkles className="w-5 h-5 text-green-400/40 mx-auto" />
                    <div className="text-[9px] text-white/20 mt-1">AI Result {i + 1}</div>
                  </div>
                  {/* Label */}
                  <div className="absolute bottom-1 left-1 right-1">
                    <span className="block text-center text-[8px] px-1 py-0.5 rounded bg-black/50 text-white/60">
                      {['Без фона', 'Upscaled', 'Обложка'][i]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <GradientButton
              variant="secondary"
              fullWidth
              size="md"
              className="mt-3"
              onClick={() => toast.info('Скачивание результатов...')}
            >
              <Download className="w-4 h-4" />
              Скачать результаты
            </GradientButton>
          </GlassCard>
        ) : project.status === 'paid' ? (
          <GlassCard padding="md" glow>
            <div className="text-center py-2">
              <Sparkles className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-white font-semibold text-sm">Оплата подтверждена</p>
              <p className="text-white/40 text-xs mt-1 mb-3">Готовы запустить генерацию AI</p>
              <GradientButton fullWidth size="md" onClick={handleProcess} loading={isProcessing}>
                {isProcessing ? 'Обработка...' : 'Запустить AI-обработку'}
              </GradientButton>
            </div>
          </GlassCard>
        ) : project.status === 'payment_review' ? (
          <GlassCard padding="md">
            <div className="text-center py-4">
              <Clock className="w-8 h-8 text-orange-400 mx-auto mb-2" />
              <p className="text-white font-semibold text-sm">Платеж на проверке</p>
              <p className="text-white/40 text-xs mt-1">
                Ожидайте подтверждения. Обычно до 30 минут.
              </p>
            </div>
          </GlassCard>
        ) : project.status === 'waiting_payment' ? (
          <GradientButton
            fullWidth
            size="lg"
            onClick={() => router.push(`/payments?project=${project.id}&package=${project.packageId}`)}
          >
            Перейти к оплате
          </GradientButton>
        ) : null}
      </div>
    </div>
  )
}
