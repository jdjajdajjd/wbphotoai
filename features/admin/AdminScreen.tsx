'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Shield, CheckCircle, XCircle, Clock, User, Package } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { GradientButton } from '@/components/ui/GradientButton'
import { StatusPill } from '@/components/ui/StatusPill'
import { MOCK_PAYMENTS, MOCK_USER } from '@/lib/mock-data'
import { PAYMENT_METHOD_LABELS } from '@/lib/constants'
import { formatRub, formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import type { Payment } from '@/types'

export function AdminScreen() {
  const router = useRouter()
  const [payments, setPayments] = useState<Payment[]>(MOCK_PAYMENTS)
  const [processing, setProcessing] = useState<string | null>(null)

  const pendingPayments = payments.filter(
    (p) => p.status === 'needs_review' || p.status === 'pending'
  )
  const allPayments = payments

  async function handleApprove(paymentId: string) {
    setProcessing(paymentId)
    try {
      const res = await fetch('/api/admin/payments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId, action: 'approve', credits: 5 }),
      })
      const data = await res.json()
      if (data.success) {
        setPayments((prev) =>
          prev.map((p) => (p.id === paymentId ? { ...p, status: 'paid' as const } : p))
        )
        toast.success('Платёж подтверждён. Кредиты начислены.', { icon: '✅' })
      }
    } catch {
      toast.error('Ошибка подтверждения')
    } finally {
      setProcessing(null)
    }
  }

  async function handleReject(paymentId: string) {
    setProcessing(paymentId)
    try {
      const res = await fetch('/api/admin/payments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId, action: 'reject' }),
      })
      const data = await res.json()
      if (data.success) {
        setPayments((prev) =>
          prev.map((p) => (p.id === paymentId ? { ...p, status: 'rejected' as const } : p))
        )
        toast.error('Платёж отклонён.', { icon: '❌' })
      }
    } catch {
      toast.error('Ошибка отклонения')
    } finally {
      setProcessing(null)
    }
  }

  return (
    <div className="px-4 pt-6 pb-28">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => router.back()}
          className="w-8 h-8 glass rounded-xl flex items-center justify-center"
        >
          <ArrowLeft className="w-4 h-4 text-white/60" />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-yellow-400" />
            <h1 className="text-xl font-bold text-white">Админ-панель</h1>
          </div>
          <p className="text-white/40 text-xs">Модерация платежей</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        {[
          { label: 'На проверке', value: pendingPayments.length, color: 'text-orange-400' },
          { label: 'Всего', value: allPayments.length, color: 'text-white' },
          { label: 'Пользователей', value: 1, color: 'text-blue-400' },
        ].map((s) => (
          <GlassCard key={s.label} padding="sm" className="text-center">
            <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-white/35 text-[10px]">{s.label}</div>
          </GlassCard>
        ))}
      </div>

      {/* Pending payments */}
      {pendingPayments.length > 0 && (
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-orange-400" />
            <h2 className="text-sm font-semibold text-white/80">
              На проверке ({pendingPayments.length})
            </h2>
            {pendingPayments.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-orange-500/20 text-orange-400 border border-orange-500/30">
                Требует действия
              </span>
            )}
          </div>

          <div className="space-y-3">
            {pendingPayments.map((payment) => (
              <GlassCard key={payment.id} padding="md" className="border-orange-500/15">
                {/* Payment info */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <User className="w-3.5 h-3.5 text-white/40" />
                      <span className="text-white text-sm font-semibold">
                        {payment.payerName || MOCK_USER.name}
                      </span>
                    </div>
                    <div className="text-white/40 text-xs">
                      {PAYMENT_METHOD_LABELS[payment.method]}
                    </div>
                    <div className="text-white/25 text-xs">{formatDate(payment.createdAt)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-400">
                      {formatRub(payment.amountRub)}
                    </div>
                    <StatusPill status={payment.status} type="payment" size="sm" />
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-2 mb-3 p-3 glass rounded-xl">
                  {payment.package && (
                    <div>
                      <div className="text-white/30 text-[10px] mb-0.5">Пакет</div>
                      <div className="flex items-center gap-1">
                        <Package className="w-3 h-3 text-green-400" />
                        <span className="text-white text-xs font-medium">{payment.package.name}</span>
                      </div>
                    </div>
                  )}
                  {payment.payerComment && (
                    <div>
                      <div className="text-white/30 text-[10px] mb-0.5">Комментарий</div>
                      <span className="text-white text-xs">...{payment.payerComment}</span>
                    </div>
                  )}
                  {payment.project && (
                    <div>
                      <div className="text-white/30 text-[10px] mb-0.5">Проект</div>
                      <span className="text-white/70 text-xs truncate block">{payment.project.title}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <GradientButton
                    variant="danger"
                    size="sm"
                    fullWidth
                    onClick={() => handleReject(payment.id)}
                    disabled={!!processing}
                    loading={processing === payment.id}
                  >
                    <XCircle className="w-4 h-4" />
                    Отклонить
                  </GradientButton>
                  <GradientButton
                    size="sm"
                    fullWidth
                    onClick={() => handleApprove(payment.id)}
                    disabled={!!processing}
                    loading={processing === payment.id}
                  >
                    <CheckCircle className="w-4 h-4" />
                    Подтвердить
                  </GradientButton>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {pendingPayments.length === 0 && (
        <GlassCard padding="lg" className="text-center mb-5">
          <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-2" />
          <p className="text-white/60 text-sm font-medium">Нет заявок на проверке</p>
          <p className="text-white/25 text-xs mt-1">Все платежи обработаны</p>
        </GlassCard>
      )}

      {/* All payments history */}
      <div>
        <h2 className="text-sm font-semibold text-white/80 mb-3">Все платежи</h2>
        <div className="space-y-2">
          {allPayments.map((payment) => (
            <GlassCard key={payment.id} padding="md">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white text-sm font-medium">
                    {payment.payerName || MOCK_USER.name}
                  </div>
                  <div className="text-white/35 text-xs">{formatDate(payment.createdAt)}</div>
                </div>
                <div className="text-right">
                  <div className="text-green-400 font-semibold text-sm">{formatRub(payment.amountRub)}</div>
                  <StatusPill status={payment.status} type="payment" size="sm" />
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  )
}
