'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Copy, Star, Zap, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { GradientButton } from '@/components/ui/GradientButton'
import { StatusPill } from '@/components/ui/StatusPill'
import { MOCK_PACKAGES } from '@/lib/mock-data'
import { MANUAL_PAYMENT_DETAILS, PAYMENT_METHOD_LABELS } from '@/lib/constants'
import { formatRub, formatDate } from '@/lib/utils'
import { useStore } from '@/hooks/useStore'
import { toast } from 'sonner'

type Tab = 'history' | 'pay'

export function PaymentsScreen() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const packageId = searchParams.get('package')
  const projectId = searchParams.get('project')
  const methodParam = searchParams.get('method')

  const { updateCredits, currentUser, addPayment, updateProject, payments } = useStore()

  const [tab, setTab] = useState<Tab>(packageId ? 'pay' : 'history')
  const [payMethod, setPayMethod] = useState<'manual' | 'stars'>(
    methodParam === 'stars' ? 'stars' : 'manual'
  )
  const [payerName, setPayerName] = useState('')
  const [payerComment, setPayerComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [starsLoading, setStarsLoading] = useState(false)
  const [testLoading, setTestLoading] = useState(false)

  const selectedPkg = MOCK_PACKAGES.find((p) => p.id === packageId) ?? MOCK_PACKAGES[1]

  function copyToClipboard(text: string, label: string) {
    navigator.clipboard.writeText(text).then(() => toast.success(`${label} скопирован`))
  }

  function markProjectPaid(status: 'payment_review' | 'paid') {
    if (projectId) updateProject(projectId, { status })
  }

  async function handleManualSubmit() {
    if (!payerName.trim()) {
      toast.error('Введите имя отправителя')
      return
    }
    setIsSubmitting(true)
    try {
      await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: selectedPkg.id,
          projectId,
          method: 'manual',
          amountRub: selectedPkg.priceRub,
          payerName,
          payerComment,
        }),
      })
      markProjectPaid('payment_review')
      setSubmitted(true)
      toast.success('Заявка отправлена на проверку!', { icon: '⏳', duration: 5000 })
    } catch {
      toast.error('Ошибка отправки заявки')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleStarsMock() {
    setStarsLoading(true)
    await new Promise((r) => setTimeout(r, 1500))
    setStarsLoading(false)
    updateCredits((currentUser?.credits ?? 0) + selectedPkg.credits)
    markProjectPaid('paid')
    toast.success(`Оплачено Stars! +${selectedPkg.credits} кредитов`, { icon: '⭐' })
    if (projectId) {
      setTimeout(() => router.push(`/projects/${projectId}`), 1200)
    } else {
      setTimeout(() => router.push('/projects'), 1200)
    }
  }

  async function handleTestPayment() {
    setTestLoading(true)
    try {
      const res = await fetch('/api/demo/test-payment', { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        updateCredits((currentUser?.credits ?? 0) + selectedPkg.credits)
        markProjectPaid('paid')
        toast.success(`Тестовая оплата прошла! +${selectedPkg.credits} кредитов`, { icon: '⚡' })
        if (projectId) {
          setTimeout(() => router.push(`/projects/${projectId}`), 1200)
        } else {
          setTimeout(() => router.push('/projects'), 1200)
        }
      }
    } catch {
      toast.error('Ошибка тестовой оплаты')
    } finally {
      setTestLoading(false)
    }
  }

  return (
    <div className="px-4 pt-6 pb-28">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => router.back()} className="w-8 h-8 glass rounded-xl flex items-center justify-center">
          <ArrowLeft className="w-4 h-4 text-white/60" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white">Платежи</h1>
          <p className="text-white/40 text-xs">История и пополнение</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 glass rounded-xl mb-5">
        {([['pay', 'Оплата'], ['history', 'История']] as const).map(([t, label]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              tab === t
                ? 'bg-green-500/20 text-green-400'
                : 'text-white/40 hover:text-white/60'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Pay tab */}
      {tab === 'pay' && (
        <div className="space-y-4">
          {/* Package summary */}
          <GlassCard padding="md" glow>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white font-bold text-lg">Пакет {selectedPkg.name}</div>
                <div className="text-white/40 text-xs mt-0.5">{selectedPkg.credits} кредитов</div>
              </div>
              <div className="text-2xl font-bold text-green-400">{formatRub(selectedPkg.priceRub)}</div>
            </div>
          </GlassCard>

          {/* Test payment button */}
          <GlassCard padding="md" className="border-yellow-500/20">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-yellow-500/15 border border-yellow-500/25 flex items-center justify-center flex-shrink-0">
                <Zap className="w-4 h-4 text-yellow-400" />
              </div>
              <div className="flex-1">
                <div className="text-white text-sm font-semibold mb-0.5">Тестовая оплата</div>
                <div className="text-white/40 text-xs mb-3">Мгновенно зачисляет кредиты без реального платежа. Только для демо.</div>
                <GradientButton
                  variant="secondary"
                  size="sm"
                  fullWidth
                  onClick={handleTestPayment}
                  loading={testLoading}
                  className="border-yellow-500/30 text-yellow-400"
                >
                  Тестовая оплата — +{selectedPkg.credits} кредитов
                </GradientButton>
              </div>
            </div>
          </GlassCard>

          {/* Method selector */}
          <div className="grid grid-cols-2 gap-2">
            {([['manual', 'СБП / Банк', '🏦'], ['stars', 'Telegram Stars', '⭐']] as const).map(
              ([method, label, icon]) => (
                <button
                  key={method}
                  onClick={() => setPayMethod(method)}
                  className={`p-3 rounded-xl border transition-all text-left ${
                    payMethod === method
                      ? 'bg-green-500/12 border-green-500/40 text-green-300'
                      : 'bg-white/4 border-white/8 text-white/50 hover:border-white/15'
                  }`}
                >
                  <div className="text-xl mb-1">{icon}</div>
                  <div className="text-xs font-semibold">{label}</div>
                </button>
              )
            )}
          </div>

          {/* Manual payment */}
          {payMethod === 'manual' && !submitted && (
            <GlassCard padding="md" className="space-y-4">
              <div className="text-sm font-semibold text-white/80">Реквизиты для перевода</div>

              {/* Requisites */}
              <div className="space-y-2">
                {[
                  ['Телефон (СБП)', MANUAL_PAYMENT_DETAILS.phone],
                  ['Банк', MANUAL_PAYMENT_DETAILS.bank],
                  ['Получатель', MANUAL_PAYMENT_DETAILS.recipient],
                  ['Сумма', formatRub(selectedPkg.priceRub)],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between py-2 border-b border-white/6 last:border-0"
                  >
                    <span className="text-white/40 text-xs">{label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white text-sm font-medium">{value}</span>
                      <button onClick={() => copyToClipboard(value, label)}>
                        <Copy className="w-3.5 h-3.5 text-white/25 hover:text-green-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <GradientButton
                variant="secondary"
                size="sm"
                fullWidth
                onClick={() =>
                  copyToClipboard(
                    `${MANUAL_PAYMENT_DETAILS.phone} (${MANUAL_PAYMENT_DETAILS.bank})`,
                    'Реквизиты'
                  )
                }
              >
                <Copy className="w-4 h-4" />
                Скопировать реквизиты
              </GradientButton>

              <div className="border-t border-white/8 pt-3 space-y-3">
                <div>
                  <label className="block text-xs text-white/50 mb-1.5">Имя отправителя *</label>
                  <input
                    type="text"
                    value={payerName}
                    onChange={(e) => setPayerName(e.target.value)}
                    placeholder="Иван Иванов"
                    className="input-glass w-full px-3 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/50 mb-1.5">
                    Последние 4 цифры / комментарий
                  </label>
                  <input
                    type="text"
                    value={payerComment}
                    onChange={(e) => setPayerComment(e.target.value)}
                    placeholder="1234"
                    className="input-glass w-full px-3 py-2.5 text-sm"
                  />
                </div>
                <GradientButton
                  fullWidth
                  size="lg"
                  onClick={handleManualSubmit}
                  loading={isSubmitting}
                >
                  Я оплатил
                </GradientButton>
              </div>
            </GlassCard>
          )}

          {/* Manual payment submitted */}
          {payMethod === 'manual' && submitted && (
            <GlassCard padding="lg" className="text-center border-orange-500/25">
              <Clock className="w-10 h-10 text-orange-400 mx-auto mb-3" />
              <h3 className="text-white font-bold text-base mb-1">Платеж отправлен на проверку</h3>
              <p className="text-white/40 text-sm">
                Мы проверим перевод и начислим кредиты в течение 30 минут
              </p>
              <GradientButton
                variant="ghost"
                size="md"
                className="mx-auto mt-4"
                onClick={() => router.push('/projects')}
              >
                Вернуться к проектам
              </GradientButton>
            </GlassCard>
          )}

          {/* Stars payment */}
          {payMethod === 'stars' && (
            <GlassCard padding="md" className="space-y-4">
              <div className="text-center py-2">
                <div className="text-4xl mb-3">⭐</div>
                <h3 className="text-white font-bold text-base">Оплата Telegram Stars</h3>
                <p className="text-white/40 text-sm mt-1">
                  Мгновенное пополнение через встроенную систему Telegram
                </p>
                <div className="mt-3 p-3 glass rounded-xl text-sm">
                  <span className="text-white/50">Сумма в Stars: </span>
                  <span className="text-yellow-400 font-bold">≈ {Math.ceil(selectedPkg.priceRub / 1.5)} ⭐</span>
                </div>
              </div>
              <GradientButton
                fullWidth
                size="lg"
                onClick={handleStarsMock}
                loading={starsLoading}
                className="bg-gradient-to-r from-yellow-500 to-yellow-400"
              >
                <Star className="w-4 h-4 fill-black" />
                Оплатить Stars
              </GradientButton>
              <p className="text-center text-white/25 text-xs">
                * В данном прототипе используется mock-оплата
              </p>
            </GlassCard>
          )}
        </div>
      )}

      {/* History tab */}
      {tab === 'history' && (
        <div className="space-y-3">
          {payments.length === 0 ? (
            <GlassCard className="text-center py-10">
              <AlertCircle className="w-10 h-10 text-white/15 mx-auto mb-2" />
              <p className="text-white/40 text-sm">Платежей пока нет</p>
            </GlassCard>
          ) : (
            payments.map((payment) => (
              <GlassCard key={payment.id} padding="md">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-white">
                        Пакет {payment.package?.name || '—'}
                      </span>
                      <StatusPill status={payment.status} type="payment" size="sm" />
                    </div>
                    <div className="text-white/35 text-xs mb-1">
                      {PAYMENT_METHOD_LABELS[payment.method]}
                    </div>
                    <div className="text-white/25 text-xs">{formatDate(payment.createdAt)}</div>
                    {payment.payerName && (
                      <div className="text-white/25 text-xs mt-0.5">
                        От: {payment.payerName}
                      </div>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className={`text-base font-bold ${payment.status === 'paid' ? 'text-green-400' : 'text-white/60'}`}>
                      {formatRub(payment.amountRub)}
                    </div>
                    {payment.status === 'paid' && (
                      <CheckCircle2 className="w-4 h-4 text-green-400 ml-auto mt-1" />
                    )}
                  </div>
                </div>
              </GlassCard>
            ))
          )}
        </div>
      )}
    </div>
  )
}
