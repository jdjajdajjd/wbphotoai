'use client'

import { AppShell } from '@/components/layout/AppShell'
import { ProjectDetailScreen } from '@/features/projects/ProjectDetailScreen'
import { use } from 'react'

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return (
    <AppShell>
      <ProjectDetailScreen projectId={id} />
    </AppShell>
  )
}
