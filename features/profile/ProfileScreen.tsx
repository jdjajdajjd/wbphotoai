'use client'

import { useRouter } from 'next/navigation'
import { Shield, MessageCircle, LogOut, ChevronRight, User, Zap, Star } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { GradientButton } from '@/components/ui/GradientButton'
import { CreditBadge } from '@/components/ui/CreditBadge'
import { useStore } from '@/hooks/useStore'
import { useTelegram } from '@/hooks/useTelegram'
import { getInitials, formatDate } from '@/lib/utils'
import { MOCK_PACKAGES } from '@/lib/mock-data'

export function ProfileScreen() {
  const router = useRouter()
  const { currentUser } = useStore()
  const { user: tgUser, isTelegram } = useTelegram()

  const name =
    tgUser
      ? `${tgUser.first_name}${tgUser.last_name ? ' ' + tgUser.last_name : ''}`
      : currentUser?.name ?? 'Пользователь'

  const username = tgUser?.username ?? currentUser?.username
  const isAdmin = currentUser?.role === 'admin'
  const initials = getInitials(name)

  const menuItems = [
    {
      icon: Star,
      label: 'Тарифы и пакеты',
      sub: 'Пополнить кредиты',
      onClick: () => router.push('/pricing'),
    },
    {
      icon: MessageCircle,
      label: 'Поддержка',
      sub: 'Написать в чат',
      onClick: () => window.open('https://t.me/wbphotoai_support', '_blank'),
    },
  ]

  if (isAdmin) {
    menuItems.push({
      icon: Shield,
      label: 'Админ-панель',
      sub: 'Модерация платежей',
      onClick: () => router.push('/admin'),
    })
  }

  return (
    <div className="px-4 pt-6 pb-28">
      {/* Header */}
      <h1 className="text-xl font-bold text-white mb-5">Профиль</h1>

      {/* User card */}
      <GlassCard padding="lg" glow className="mb-5">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold text-black"
              style={{
                background: 'linear-gradient(135deg, #4ade80, #22c55e)',
                boxShadow: '0 0 20px rgba(74,222,128,0.3)',
              }}
            >
              {initials}
            </div>
            {isAdmin && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-400 flex items-center justify-center">
                <Shield className="w-3 h-3 text-black" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-white font-bold text-lg leading-tight truncate">{name}</div>
            {username && (
              <div className="text-white/40 text-sm">@{username}</div>
            )}
            <div className="text-white/25 text-xs mt-0.5">
              ID: {currentUser?.telegramId}
            </div>
            {!isTelegram && (
              <div className="mt-1 px-2 py-0.5 rounded-full bg-yellow-500/15 border border-yellow-500/25 text-yellow-400 text-[10px] inline-block">
                Demo mode
              </div>
            )}
          </div>
        </div>
      </GlassCard>

      {/* Credits card */}
      <GlassCard padding="md" className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-green-400" />
            <span className="text-white/70 text-sm font-medium">Кредиты</span>
          </div>
          <CreditBadge credits={currentUser?.credits ?? 0} size="md" />
        </div>
        <div className="flex gap-2">
          <GradientButton
            variant="secondary"
            size="sm"
            fullWidth
            onClick={() => router.push('/pricing')}
          >
            Пополнить
          </GradientButton>
          <GradientButton
            variant="ghost"
            size="sm"
            fullWidth
            onClick={() => router.push('/payments')}
          >
            История
          </GradientButton>
        </div>
      </GlassCard>

      {/* Account info */}
      <GlassCard padding="md" className="mb-4">
        <div className="text-xs text-white/40 font-medium mb-2">Аккаунт</div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between py-1.5 border-b border-white/5">
            <span className="text-white/40">Роль</span>
            <span className={`font-medium ${isAdmin ? 'text-yellow-400' : 'text-white/70'}`}>
              {isAdmin ? 'Администратор' : 'Пользователь'}
            </span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-white/5">
            <span className="text-white/40">Зарегистрирован</span>
            <span className="text-white/70 text-xs">{formatDate(currentUser?.createdAt ?? new Date().toISOString())}</span>
          </div>
          <div className="flex justify-between py-1.5">
            <span className="text-white/40">Версия</span>
            <span className="text-white/30 text-xs">1.0.0 MVP</span>
          </div>
        </div>
      </GlassCard>

      {/* Menu */}
      <div className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <GlassCard
              key={item.label}
              padding="md"
              hoverable
              onClick={item.onClick}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white/6 border border-white/8 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-white/60" />
                </div>
                <div className="flex-1">
                  <div className="text-white text-sm font-medium">{item.label}</div>
                  <div className="text-white/35 text-xs">{item.sub}</div>
                </div>
                <ChevronRight className="w-4 h-4 text-white/20" />
              </div>
            </GlassCard>
          )
        })}
      </div>

      {/* Version note */}
      <div className="mt-6 text-center text-white/20 text-xs">
        WBPhotoAI MVP · Сделано с ❤️
      </div>
    </div>
  )
}
