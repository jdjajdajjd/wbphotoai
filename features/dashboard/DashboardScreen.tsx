'use client'

import { useRouter } from 'next/navigation'
import { Sparkles, Plus, Zap, FolderOpen, ImageIcon, ArrowRight, Star, ChevronRight } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { GradientButton } from '@/components/ui/GradientButton'
import { CreditBadge } from '@/components/ui/CreditBadge'
import { StatusPill } from '@/components/ui/StatusPill'
import { useStore } from '@/hooks/useStore'
import { useTelegram } from '@/hooks/useTelegram'
import { formatRub, formatDateShort, truncate } from '@/lib/utils'
import { toast } from 'sonner'
import { useState } from 'react'

export function DashboardScreen() {
  const router = useRouter()
  const { user: tgUser } = useTelegram()
  const { currentUser, updateCredits, addPayment } = useStore()
  const [testPayLoading, setTestPayLoading] = useState(false)

  const { projects } = useStore()
  const recentProjects = projects.slice(0, 3)

  const doneCount = projects.filter(p => p.status === 'done').length
  const stats = [
    { label: 'Проектов', value: projects.length.toString(), icon: FolderOpen, color: 'text-blue-400' },
    { label: 'Готово', value: doneCount.toString(), icon: ImageIcon, color: 'text-purple-400' },
    { label: 'Кредиты', value: currentUser?.credits?.toString() ?? '0', icon: Zap, color: 'text-green-400' },
  ]

  async function handleTestPayment() {
    setTestPayLoading(true)
    try {
      const res = await fetch('/api/demo/test-payment', { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        updateCredits((currentUser?.credits ?? 0) + 5)
        toast.success('Тестовая оплата прошла! +5 кредитов начислено', {
          icon: '⚡',
          duration: 4000,
        })
      }
    } catch {
      toast.error('Ошибка демо-оплаты')
    } finally {
      setTestPayLoading(false)
    }
  }

  const displayName = tgUser
    ? `${tgUser.first_name}${tgUser.last_name ? ' ' + tgUser.last_name : ''}`
    : 'Пользователь'

  return (
    <div className="px-4 pt-6 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-white/40 text-sm">Добро пожаловать,</p>
          <h1 className="text-xl font-bold text-white leading-tight">
            {truncate(displayName, 20)} 👋
          </h1>
        </div>
        <CreditBadge credits={currentUser?.credits ?? 0} size="md" />
      </div>

      {/* Hero card */}
      <GlassCard glow className="relative overflow-hidden">
        {/* BG gradient */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 100% 0%, rgba(74,222,128,0.12) 0%, transparent 60%)',
          }}
        />
        <div className="relative space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-green-400" />
            </div>
            <span className="text-xs text-green-400/80 font-medium uppercase tracking-wider">AI-обработка</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white leading-tight">
              Прокачай карточку<br />
              <span className="gradient-text">за 2 минуты</span>
            </h2>
            <p className="text-white/45 text-sm mt-1">
              Удали фон, улучши качество, создай обложку для WB и Ozon
            </p>
          </div>
          <GradientButton
            size="lg"
            fullWidth
            onClick={() => router.push('/projects/new')}
            className="mt-2"
          >
            <Plus className="w-5 h-5" />
            Новый проект
          </GradientButton>
        </div>
      </GlassCard>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <GlassCard key={s.label} padding="sm" className="text-center">
              <Icon className={`w-4 h-4 mx-auto mb-1 ${s.color}`} />
              <div className="text-lg font-bold text-white">{s.value}</div>
              <div className="text-white/40 text-[10px]">{s.label}</div>
            </GlassCard>
          )
        })}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleTestPayment}
          disabled={testPayLoading}
          className="glass rounded-xl p-3 flex items-center gap-2 text-left glass-hover transition-all active:scale-[0.97]"
        >
          <div className="w-8 h-8 rounded-lg bg-yellow-500/15 border border-yellow-500/25 flex items-center justify-center flex-shrink-0">
            <Zap className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="min-w-0">
            <div className="text-white text-xs font-semibold">
              {testPayLoading ? 'Обработка...' : 'Тест оплаты'}
            </div>
            <div className="text-white/35 text-[10px]">+5 кредитов</div>
          </div>
        </button>

        <button
          onClick={() => router.push('/pricing')}
          className="glass rounded-xl p-3 flex items-center gap-2 text-left glass-hover transition-all active:scale-[0.97]"
        >
          <div className="w-8 h-8 rounded-lg bg-green-500/15 border border-green-500/25 flex items-center justify-center flex-shrink-0">
            <Star className="w-4 h-4 text-green-400" />
          </div>
          <div className="min-w-0">
            <div className="text-white text-xs font-semibold">Купить пакет</div>
            <div className="text-white/35 text-[10px]">от 299 ₽</div>
          </div>
        </button>
      </div>

      {/* Recent projects */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="text-sm font-semibold text-white/80">Последние проекты</h3>
          <button
            onClick={() => router.push('/projects')}
            className="text-green-400 text-xs flex items-center gap-0.5"
          >
            Все <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-2">
          {recentProjects.map((project) => (
            <GlassCard
              key={project.id}
              padding="sm"
              hoverable
              onClick={() => router.push(`/projects/${project.id}`)}
            >
              <div className="flex items-center gap-3">
                {/* Thumbnail */}
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/5 flex-shrink-0 border border-white/8 flex items-center justify-center">
                  {project.sourceImages[0]?.startsWith('http') ? (
                    <img src={project.sourceImages[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-4 h-4 text-white/25" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-white text-sm font-medium truncate">{project.title}</span>
                    <StatusPill status={project.status} size="sm" />
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-white/35 text-xs">{formatDateShort(project.createdAt)}</span>
                    <span className="text-white/20 text-xs">·</span>
                    <span className="text-white/35 text-xs">{formatRub(project.priceRub)}</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-white/20 flex-shrink-0" />
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Bottom spacer */}
      <div className="h-4" />
    </div>
  )
}
