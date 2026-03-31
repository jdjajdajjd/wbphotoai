'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Star, Zap, ArrowLeft } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { GradientButton } from '@/components/ui/GradientButton'
import { CreditBadge } from '@/components/ui/CreditBadge'
import { MOCK_PACKAGES } from '@/lib/mock-data'
import { formatRub } from '@/lib/utils'

export function PricingScreen() {
  const router = useRouter()
  const [selected, setSelected] = useState<string>('pkg_pro')

  const selectedPkg = MOCK_PACKAGES.find((p) => p.id === selected)

  return (
    <div className="px-4 pt-6 pb-32">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="w-8 h-8 glass rounded-xl flex items-center justify-center">
          <ArrowLeft className="w-4 h-4 text-white/60" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white">Тарифы</h1>
          <p className="text-white/40 text-xs">Выберите подходящий пакет</p>
        </div>
      </div>

      {/* Package cards */}
      <div className="space-y-3">
        {MOCK_PACKAGES.map((pkg) => {
          const isSelected = selected === pkg.id
          const isRecommended = pkg.recommended

          return (
            <button
              key={pkg.id}
              onClick={() => setSelected(pkg.id)}
              className="w-full text-left"
            >
              <GlassCard
                padding="md"
                className={`relative transition-all duration-200 ${
                  isSelected
                    ? 'border-green-500/50 shadow-[0_0_20px_rgba(74,222,128,0.15)]'
                    : 'border-white/8 hover:border-white/15'
                }`}
              >
                {isRecommended && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-green-500 to-green-400 text-black uppercase tracking-wider">
                      Рекомендуем
                    </span>
                  </div>
                )}

                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg font-bold text-white">{pkg.name}</span>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                          <Check className="w-3 h-3 text-black" />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <CreditBadge credits={pkg.credits} size="sm" />
                      <span className="text-white/35 text-xs">
                        ≈ {formatRub(pkg.pricePerCredit ?? 0)} / кредит
                      </span>
                    </div>

                    <ul className="space-y-1.5">
                      {pkg.features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-xs text-white/60">
                          <Check className="w-3 h-3 text-green-400 flex-shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className="text-2xl font-bold text-white">{formatRub(pkg.priceRub)}</div>
                    <div className="text-white/35 text-xs">разово</div>
                  </div>
                </div>
              </GlassCard>
            </button>
          )
        })}
      </div>

      {/* CTA */}
      {selectedPkg && (
        <div
          className="fixed bottom-20 left-0 right-0 px-4 pb-2 z-40"
          style={{ paddingBottom: 'calc(8px + env(safe-area-inset-bottom, 0px))' }}
        >
          <GlassCard padding="md" className="border-green-500/20">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-white font-semibold">Пакет {selectedPkg.name}</div>
                <div className="text-white/40 text-xs">{selectedPkg.credits} кредитов</div>
              </div>
              <div className="text-xl font-bold text-green-400">{formatRub(selectedPkg.priceRub)}</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <GradientButton
                variant="secondary"
                fullWidth
                onClick={() => router.push(`/payments?package=${selectedPkg.id}&method=stars`)}
              >
                <Star className="w-4 h-4" />
                Stars
              </GradientButton>
              <GradientButton
                fullWidth
                onClick={() => router.push(`/payments?package=${selectedPkg.id}&method=manual`)}
              >
                <Zap className="w-4 h-4" />
                Купить
              </GradientButton>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  )
}
