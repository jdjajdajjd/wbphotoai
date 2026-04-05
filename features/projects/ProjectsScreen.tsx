'use client'

import { useRouter } from 'next/navigation'
import { Plus, FolderOpen, ImageIcon, ArrowRight } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { GradientButton } from '@/components/ui/GradientButton'
import { StatusPill } from '@/components/ui/StatusPill'
import { useStore } from '@/hooks/useStore'
import { OPERATIONS } from '@/lib/constants'
import { formatRub, formatDate } from '@/lib/utils'

export function ProjectsScreen() {
  const router = useRouter()
  const { projects } = useStore()

  return (
    <div className="px-4 pt-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-white">Проекты</h1>
          <p className="text-white/40 text-xs">{projects.length} всего</p>
        </div>
        <GradientButton size="sm" onClick={() => router.push('/projects/new')}>
          <Plus className="w-4 h-4" />
          Создать
        </GradientButton>
      </div>

      {projects.length === 0 ? (
        <GlassCard className="text-center py-12">
          <FolderOpen className="w-12 h-12 text-white/15 mx-auto mb-3" />
          <p className="text-white/40 text-sm">Проектов пока нет</p>
          <p className="text-white/25 text-xs mt-1">Создайте первый, чтобы начать</p>
          <GradientButton
            size="md"
            className="mt-4 mx-auto"
            onClick={() => router.push('/projects/new')}
          >
            <Plus className="w-4 h-4" />
            Новый проект
          </GradientButton>
        </GlassCard>
      ) : (
        <div className="space-y-3 pb-28">
          {projects.map((project) => (
            <GlassCard
              key={project.id}
              hoverable
              padding="md"
              onClick={() => router.push(`/projects/${project.id}`)}
            >
              <div className="flex items-start gap-3">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-white/5 flex-shrink-0 border border-white/8 flex items-center justify-center">
                  {project.sourceImages[0]?.startsWith('http') ? (
                    <img src={project.sourceImages[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-5 h-5 text-white/20" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="text-white font-semibold text-sm leading-tight">{project.title}</span>
                    <StatusPill status={project.status} size="sm" />
                  </div>

                  {project.category && (
                    <div className="text-white/35 text-xs mb-1">{project.category}</div>
                  )}

                  <div className="flex items-center gap-3 text-xs text-white/30">
                    <span>{formatDate(project.createdAt)}</span>
                    <span>·</span>
                    <span>{project.sourceImages.length} фото</span>
                    <span>·</span>
                    <span className="text-green-400/70">{formatRub(project.priceRub)}</span>
                  </div>

                  <div className="flex flex-wrap gap-1 mt-2">
                    {project.selectedOperations.slice(0, 3).map((op) => {
                      const def = OPERATIONS.find(o => o.id === op)
                      return (
                        <span
                          key={op}
                          className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-white/6 text-white/45 border border-white/8"
                        >
                          {def ? `${def.icon} ${def.label}` : op}
                        </span>
                      )
                    })}
                    {project.selectedOperations.length > 3 && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-white/6 text-white/35 border border-white/8">
                        +{project.selectedOperations.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                <ArrowRight className="w-4 h-4 text-white/20 flex-shrink-0 mt-1" />
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  )
}
