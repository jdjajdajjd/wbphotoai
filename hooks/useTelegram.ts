'use client'

import { useEffect, useState } from 'react'
import type { TelegramUser } from '@/types'

interface TelegramWebApp {
  initData: string
  initDataUnsafe: {
    user?: TelegramUser
    query_id?: string
  }
  version: string
  platform: string
  colorScheme: 'light' | 'dark'
  themeParams: Record<string, string>
  isExpanded: boolean
  viewportHeight: number
  viewportStableHeight: number
  ready: () => void
  expand: () => void
  close: () => void
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void
    selectionChanged: () => void
  }
  MainButton: {
    text: string
    color: string
    textColor: string
    isVisible: boolean
    isActive: boolean
    show: () => void
    hide: () => void
    enable: () => void
    disable: () => void
    onClick: (callback: () => void) => void
    offClick: (callback: () => void) => void
    setText: (text: string) => void
  }
  showAlert: (message: string, callback?: () => void) => void
  showConfirm: (message: string, callback: (ok: boolean) => void) => void
  openInvoice: (url: string, callback?: (status: string) => void) => void
  openLink: (url: string, options?: { try_instant_view?: boolean }) => void
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp
    }
  }
}

const MOCK_TELEGRAM_USER: TelegramUser = {
  id: 123456789,
  first_name: 'Demo',
  last_name: 'User',
  username: 'demo_user',
  language_code: 'ru',
}

export function detectWebAppContext(): boolean {
  if (typeof window === 'undefined') return false
  return !!(window.Telegram?.WebApp?.initData && window.Telegram.WebApp.initData.length > 0)
}

export function mockTelegramSession(): TelegramUser {
  return MOCK_TELEGRAM_USER
}

export function useTelegram() {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null)
  const [user, setUser] = useState<TelegramUser | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [isTelegram, setIsTelegram] = useState(false)

  useEffect(() => {
    const tg = window.Telegram?.WebApp
    if (tg && tg.initData) {
      setWebApp(tg)
      setUser(tg.initDataUnsafe?.user || null)
      setIsTelegram(true)
      tg.ready()
      tg.expand()
    } else {
      // Browser dev mode — use mock user
      setUser(MOCK_TELEGRAM_USER)
      setIsTelegram(false)
    }
    setIsReady(true)
  }, [])

  const haptic = {
    impact: (style: 'light' | 'medium' | 'heavy' = 'light') => {
      webApp?.HapticFeedback?.impactOccurred(style)
    },
    success: () => {
      webApp?.HapticFeedback?.notificationOccurred('success')
    },
    error: () => {
      webApp?.HapticFeedback?.notificationOccurred('error')
    },
    selection: () => {
      webApp?.HapticFeedback?.selectionChanged()
    },
  }

  function openLink(url: string) {
    if (webApp?.openLink) {
      webApp.openLink(url)
    } else {
      window.open(url, '_blank')
    }
  }

  return { webApp, user, isReady, isTelegram, haptic, openLink }
}
