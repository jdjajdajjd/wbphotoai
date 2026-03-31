'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import { ArrowLeft, Upload, X, ChevronDown, Zap, ArrowRight, ImagePlus } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { GradientButton } from '@/components/ui/GradientButton'
import { CreditBadge } from '@/components/ui/CreditBadge'
import { MOCK_PACKAGES } from '@/lib/mock-data'
import { OPERATIONS, CATEGORIES, MAX_UPLOAD_FILES } from '@/lib/constants'
import { formatRub } from '@/lib/utils'
import { useStore } from '@/hooks/useStore'
import { toast } from 'sonner'
import type { Operation } from '@/types'

export function NewProjectScreen() {
  const router = useRouter()
  const { addProject } = useStore()

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [selectedOps, setSelectedOps] = useState<Operation[]>(['remove_bg', 'upscale'])
  const [selectedPackageId, setSelectedPackageId] = useState('pkg_pro')
  const [files, setFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onDrop = useCallback((accepted: File[]) => {
    setFiles((prev) => {
      const combined = [...prev, ...accepted]
      return combined.slice(0, MAX_UPLOAD_FILES)
    })
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxFiles: MAX_UPLOAD_FILES,
    maxSize: 20 * 1024 * 1024,
  })

  const toggleOp = (op: Operation) => {
    setSelectedOps((prev) =>
      prev.includes(op) ? prev.filter((o) => o !== op) : [...prev, op]
    )
  }

  const selectedPkg = MOCK_PACKAGES.find((p) => p.id === selectedPackageId)!

  const totalCredits = selectedOps.reduce((sum, op) => {
    const def = OPERATIONS.find((o) => o.id === op)
    return sum + (def?.credits ?? 1)
  }, 0) * Math.max(files.length, 1)

  async function handleSubmit() {
    if (!title.trim()) {
      toast.error('Введите название товара')
      return
    }
    if (files.length === 0) {
      toast.error('Загрузите хотя бы одно изображение')
      return
    }
    if (selectedOps.length === 0) {
      toast.error('Выберите хотя бы одну операцию')
      return
    }

    setIsSubmitting(true)
    try {
      const newProject = {
        id: `proj_${Date.now()}`,
        userId: 'user_demo',
        title,
        category: category || undefined,
        sourceImages: files.map((f) => URL.createObjectURL(f)),
        selectedOperations: selectedOps,
        packageId: selectedPackageId,
        package: selectedPkg,
        priceRub: selectedPkg.priceRub,
        status: 'waiting_payment' as const,
        resultImages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      addProject(newProject)
      toast.success('Проект создан!', { icon: '🚀' })
      router.push(`/payments?package=${selectedPackageId}&project=${newProject.id}`)
    } catch {
      toast.error('Ошибка при создании проекта')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="px-4 pt-6 pb-40">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="w-8 h-8 glass rounded-xl flex items-center justify-center"
        >
          <ArrowLeft className="w-4 h-4 text-white/60" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white">Новый проект</h1>
          <p className="text-white/40 text-xs">Загрузите фото и настройте обработку</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Upload zone */}
        <GlassCard padding="none">
          <div
            {...getRootProps()}
            className={`p-5 rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer ${
              isDragActive
                ? 'border-green-400/60 bg-green-500/8'
                : 'border-white/12 hover:border-green-500/30 hover:bg-white/3'
            }`}
          >
            <input {...getInputProps()} />
            {files.length === 0 ? (
              <div className="text-center py-4">
                <div className="w-12 h-12 rounded-2xl bg-green-500/15 border border-green-500/25 flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-6 h-6 text-green-400" />
                </div>
                <p className="text-white/70 text-sm font-medium">
                  {isDragActive ? 'Отпустите для загрузки' : 'Перетащите фото или нажмите'}
                </p>
                <p className="text-white/30 text-xs mt-1">
                  JPG, PNG, WEBP · До {MAX_UPLOAD_FILES} файлов · Макс 20 МБ
                </p>
              </div>
            ) : (
              <div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {files.map((file, i) => (
                    <div key={i} className="relative group">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/5 border border-white/10">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setFiles((prev) => prev.filter((_, j) => j !== i))
                        }}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  ))}
                  {files.length < MAX_UPLOAD_FILES && (
                    <div className="w-16 h-16 rounded-xl border-2 border-dashed border-white/15 flex items-center justify-center">
                      <ImagePlus className="w-5 h-5 text-white/25" />
                    </div>
                  )}
                </div>
                <p className="text-white/35 text-xs">{files.length} файл(ов) загружено</p>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Title */}
        <GlassCard padding="md">
          <label className="block text-xs text-white/50 mb-1.5 font-medium">Название товара *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Например: Кроссовки Nike Air Max 270"
            className="input-glass w-full px-3 py-2.5 text-sm"
          />
        </GlassCard>

        {/* Category */}
        <GlassCard padding="md">
          <label className="block text-xs text-white/50 mb-1.5 font-medium">Категория</label>
          <div className="relative">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input-glass w-full px-3 py-2.5 text-sm appearance-none pr-8"
              style={{ background: 'rgba(255,255,255,0.05)' }}
            >
              <option value="">Выберите категорию...</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c} style={{ background: '#0d1410' }}>{c}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
          </div>
        </GlassCard>

        {/* Operations */}
        <GlassCard padding="md">
          <label className="block text-xs text-white/50 mb-3 font-medium">Что нужно сделать *</label>
          <div className="grid grid-cols-2 gap-2">
            {OPERATIONS.map((op) => {
              const isSelected = selectedOps.includes(op.id)
              return (
                <button
                  key={op.id}
                  type="button"
                  onClick={() => toggleOp(op.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all duration-150 active:scale-[0.97] ${
                    isSelected
                      ? 'bg-green-500/15 border-green-500/40 text-green-300'
                      : 'bg-white/4 border-white/8 text-white/50 hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-base">{op.icon}</span>
                    <span className="text-[9px] text-white/30">{op.credits} кр.</span>
                  </div>
                  <div className="text-xs font-medium leading-tight">{op.label}</div>
                </button>
              )
            })}
          </div>
        </GlassCard>

        {/* Package selection */}
        <GlassCard padding="md">
          <label className="block text-xs text-white/50 mb-3 font-medium">Пакет генерации</label>
          <div className="space-y-2">
            {MOCK_PACKAGES.map((pkg) => (
              <button
                key={pkg.id}
                type="button"
                onClick={() => setSelectedPackageId(pkg.id)}
                className={`w-full p-3 rounded-xl border text-left transition-all duration-150 flex items-center justify-between ${
                  selectedPackageId === pkg.id
                    ? 'bg-green-500/12 border-green-500/40'
                    : 'bg-white/4 border-white/8 hover:border-white/15'
                }`}
              >
                <div>
                  <div className="text-sm font-semibold text-white">{pkg.name}</div>
                  <CreditBadge credits={pkg.credits} size="sm" className="mt-1" />
                </div>
                <div className="text-right">
                  <div className="text-base font-bold text-white">{formatRub(pkg.priceRub)}</div>
                  {selectedPackageId === pkg.id && (
                    <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center ml-auto mt-1">
                      <svg className="w-2.5 h-2.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Sticky CTA */}
      <div
        className="fixed bottom-20 left-0 right-0 px-4 z-40"
        style={{ paddingBottom: 'calc(8px + env(safe-area-inset-bottom, 0px))' }}
      >
        <GlassCard padding="md" className="border-green-500/20">
          <div className="flex items-center justify-between mb-3 text-sm">
            <span className="text-white/50">К оплате</span>
            <div className="flex items-center gap-2">
              <CreditBadge credits={totalCredits} size="sm" />
              <span className="text-xl font-bold text-white">{formatRub(selectedPkg.priceRub)}</span>
            </div>
          </div>
          <GradientButton
            fullWidth
            size="lg"
            onClick={handleSubmit}
            loading={isSubmitting}
            disabled={files.length === 0 || !title.trim()}
          >
            Перейти к оплате <ArrowRight className="w-4 h-4" />
          </GradientButton>
        </GlassCard>
      </div>
    </div>
  )
}
