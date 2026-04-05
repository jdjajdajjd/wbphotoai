'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ArrowLeft, ImageIcon, Sparkles, CheckCircle2, Clock, XCircle, Loader2, ExternalLink } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { GradientButton } from '@/components/ui/GradientButton'
import { StatusPill } from '@/components/ui/StatusPill'
import { ImageViewer } from '@/components/ui/ImageViewer'
import { useStore } from '@/hooks/useStore'
import { useProcessing } from '@/hooks/useProcessing'
import { OPERATIONS } from '@/lib/constants'
import { formatRub, formatDate } from '@/lib/utils'
import { toast } from 'sonner'

export function ProjectDetailScreen({ projectId }: { projectId: string }) {
  const router = useRouter()
  const { projects, updateProject } = useStore()
  const project = projects.find((p) => p.id === projectId) ?? projects[0]
  const { tasks, overallState, resultUrls, generatedTexts, startProcessing } = useProcessing()
  const [viewerUrl, setViewerUrl] = useState<string | null>(null)
  const [viewerIndex, setViewerIndex] = useState(0)

  if (!project) {
    return (
      <div className="px-4 pt-6 text-center">
        <p className="text-white/40 text-sm mt-20">Проект не найден</p>
        <button onClick={() => router.push('/projects')} className="text-green-400 text-sm mt-3 block mx-auto">
          ← Назад к проектам
        </button>
      </div>
    )
  }

  const isDone = project.status === 'done' || overallState === 'done'
  const isProcessing = overallState === 'starting' || overallState === 'processing'
  const displayResults = isDone
    ? (project.resultImages?.length ? project.resultImages : resultUrls)
    : resultUrls

  async function handleProcess() {
    if (!project.sourceImages.length) {
      toast.error('Нет изображений для обработки')
      return
    }
    updateProject(projectId, { status: 'processing' })
    toast.info('Отправляем в обработку...', { icon: '🔄' })

    await startProcessing(project.sourceImages, project.selectedOperations, project.title, project.category)

    // will be set to done via overallState watcher below
    toast.success('Обработка запущена! Ожидайте результатов.', { icon: '✨' })
  }

  // When processing finishes — save results to store
  if (overallState === 'done' && resultUrls.length > 0 && project.status !== 'done') {
    updateProject(projectId, { status: 'done', resultImages: resultUrls })
  }

  const statusIcon = {
    done: <CheckCircle2 className="w-4 h-4 text-green-400" />,
    processing: <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />,
    rejected: <XCircle className="w-4 h-4 text-red-400" />,
    payment_review: <Clock className="w-4 h-4 text-orange-400" />,
    paid: <CheckCircle2 className="w-4 h-4 text-green-400" />,
    waiting_payment: <Clock className="w-4 h-4 text-yellow-400" />,
    draft: <Clock className="w-4 h-4 text-gray-400" />,
  }[project.status] ?? <Clock className="w-4 h-4 text-gray-400" />

  return (
    <div className="px-4 pt-6 pb-32">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => router.back()} className="w-8 h-8 glass rounded-xl flex items-center justify-center">
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
        {/* Info */}
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
            {project.sourceImages.length > 0 ? project.sourceImages.map((img, i) => (
              <div key={i} className="w-16 h-16 rounded-xl overflow-hidden bg-white/5 border border-white/8">
                {img.startsWith('blob:') || img.startsWith('http') ? (
                  <img src={img} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-5 h-5 text-white/20" />
                  </div>
                )}
              </div>
            )) : (
              <div className="text-white/30 text-xs">Нет изображений</div>
            )}
          </div>
        </GlassCard>

        {/* Operations */}
        <GlassCard padding="md">
          <div className="text-xs text-white/40 font-medium mb-3">Операции</div>
          <div className="flex flex-wrap gap-2">
            {project.selectedOperations.map((op) => {
              const def = OPERATIONS.find((o) => o.id === op)
              const task = tasks.find(t => t.operation === op)
              const isSoon = def?.status === 'soon'
              return (
                <div
                  key={op}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs border ${
                    isSoon
                      ? 'bg-orange-500/8 border-orange-500/20 text-orange-300/60'
                      : 'bg-green-500/10 border-green-500/20 text-green-300'
                  }`}
                >
                  <span>{def?.icon}</span>
                  <span>{def?.label || op}</span>
                  {isSoon ? (
                    <span className="text-[9px] text-orange-400/60 ml-0.5">скоро</span>
                  ) : task ? (
                    task.state === 'processing' ? <Loader2 className="w-3 h-3 animate-spin ml-1" /> :
                    task.state === 'done' ? <CheckCircle2 className="w-3 h-3 text-green-400 ml-1" /> :
                    task.state === 'error' ? <XCircle className="w-3 h-3 text-red-400 ml-1" /> : null
                  ) : null}
                </div>
              )
            })}
          </div>
        </GlassCard>

        {/* Processing progress */}
        {isProcessing && (
          <GlassCard padding="md" className="border-purple-500/20">
            <div className="flex items-center gap-3">
              <Loader2 className="w-6 h-6 text-purple-400 animate-spin flex-shrink-0" />
              <div>
                <div className="text-white text-sm font-semibold">AI обрабатывает фото...</div>
                <div className="text-white/40 text-xs mt-0.5">
                  {tasks.filter(t => t.state === 'done').length} из {tasks.length} задач завершено
                </div>
              </div>
            </div>
          </GlassCard>
        )}

        {/* Results */}
        {isDone && displayResults.length > 0 && (
          <GlassCard padding="md">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs text-white/40 font-medium">Фото-результаты ({displayResults.length})</div>
              <CheckCircle2 className="w-4 h-4 text-green-400" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {displayResults.map((url, i) => (
                <button
                  key={i}
                  onClick={() => { setViewerUrl(url); setViewerIndex(i) }}
                  className="aspect-square rounded-xl overflow-hidden bg-white/5 border border-white/8 relative group active:scale-95 transition-transform"
                >
                  {url.startsWith('http') ? (
                    <img src={url} alt={`Result ${i + 1}`} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-green-400/40" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <ExternalLink className="w-4 h-4 text-white" />
                  </div>
                </button>
              ))}
            </div>
            <p className="text-center text-white/25 text-xs mt-3">Нажмите на фото, чтобы открыть</p>
          </GlassCard>
        )}

        {/* Generated texts */}
        {(generatedTexts.title || generatedTexts.description) && (
          <GlassCard padding="md">
            <div className="flex items-center gap-2 mb-1">
              <div className="text-xs text-white/40 font-medium">Текстовый контент</div>
            </div>
            <div className="text-[10px] text-yellow-400/70 mb-3 bg-yellow-500/8 border border-yellow-500/15 rounded-lg px-2.5 py-1.5">
              Шаблон — замените значения в [скобках] на данные вашего товара
            </div>
            {generatedTexts.title && (
              <div className="mb-4">
                <div className="text-xs text-white/35 mb-1.5">✍️ Заголовок товара</div>
                <div className="bg-white/5 border border-white/8 rounded-xl px-3 py-2.5 text-xs text-white/80 leading-relaxed whitespace-pre-wrap font-mono">
                  {generatedTexts.title}
                </div>
                <button
                  onClick={() => { navigator.clipboard.writeText(generatedTexts.title!.split('\n')[0]); toast.success('Заголовок скопирован') }}
                  className="text-green-400 text-xs mt-1.5 hover:text-green-300"
                >
                  Скопировать заголовок
                </button>
              </div>
            )}
            {generatedTexts.description && (
              <div>
                <div className="text-xs text-white/35 mb-1.5">📝 Описание товара</div>
                <div className="bg-white/5 border border-white/8 rounded-xl px-3 py-2.5 text-xs text-white/70 leading-relaxed whitespace-pre-wrap font-mono max-h-48 overflow-y-auto">
                  {generatedTexts.description}
                </div>
                <button
                  onClick={() => { navigator.clipboard.writeText(generatedTexts.description!); toast.success('Описание скопировано') }}
                  className="text-green-400 text-xs mt-1.5 hover:text-green-300"
                >
                  Скопировать описание
                </button>
              </div>
            )}
          </GlassCard>
        )}

        {/* CTAs by status */}
        {!isDone && !isProcessing && (
          <>
            {project.status === 'paid' && (
              <GlassCard padding="md" glow>
                <div className="text-center py-2">
                  <Sparkles className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <p className="text-white font-semibold text-sm">Оплата подтверждена</p>
                  <p className="text-white/40 text-xs mt-1 mb-3">Запустите AI-обработку фото</p>
                  <GradientButton fullWidth size="md" onClick={handleProcess}>
                    Запустить AI-обработку
                  </GradientButton>
                </div>
              </GlassCard>
            )}

            {project.status === 'payment_review' && (
              <GlassCard padding="md">
                <div className="text-center py-4">
                  <Clock className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                  <p className="text-white font-semibold text-sm">Платёж на проверке</p>
                  <p className="text-white/40 text-xs mt-1">Обычно до 30 минут. Придёт уведомление в бот.</p>
                </div>
              </GlassCard>
            )}

            {(project.status === 'waiting_payment' || project.status === 'draft') && (
              <GradientButton
                fullWidth
                size="lg"
                onClick={() => router.push(`/payments?project=${project.id}&package=${project.packageId}`)}
              >
                Перейти к оплате
              </GradientButton>
            )}
          </>
        )}
      </div>

      {/* Mock op results (non-text) */}
      {isDone && tasks.some(t => t.resultText && t.operation !== 'gen_title' && t.operation !== 'gen_description') && (
        <div className="mt-4 space-y-2 px-0">
          {tasks
            .filter(t => t.state === 'done' && t.resultText && t.operation !== 'gen_title' && t.operation !== 'gen_description')
            .map(t => {
              const def = OPERATIONS.find(o => o.id === t.operation)
              return (
                <div key={t.taskId} className="mx-0">
                  <GlassCard padding="sm">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{def?.icon}</span>
                      <div>
                        <div className="text-xs font-medium text-white/70">{def?.label}</div>
                        <div className="text-xs text-white/40">{t.resultText}</div>
                      </div>
                      <CheckCircle2 className="w-4 h-4 text-green-400 ml-auto flex-shrink-0" />
                    </div>
                  </GlassCard>
                </div>
              )
            })}
        </div>
      )}

      {/* Image lightbox */}
      {viewerUrl && (
        <ImageViewer
          url={viewerUrl}
          onClose={() => setViewerUrl(null)}
          index={viewerIndex}
          total={displayResults.length}
        />
      )}
    </div>
  )
}
