'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, FolderOpen, CreditCard, Receipt, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/', label: 'Главная', icon: Home },
  { href: '/projects', label: 'Проекты', icon: FolderOpen },
  { href: '/pricing', label: 'Тарифы', icon: CreditCard },
  { href: '/payments', label: 'Платежи', icon: Receipt },
  { href: '/profile', label: 'Профиль', icon: User },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-2 pb-2"
      style={{ paddingBottom: 'calc(8px + env(safe-area-inset-bottom, 0px))' }}
    >
      <nav
        className="mx-auto max-w-lg rounded-2xl border border-white/8"
        style={{
          background: 'rgba(8, 12, 10, 0.85)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
        }}
      >
        <div className="flex items-center">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive =
              item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex-1 flex flex-col items-center gap-0.5 py-2.5 px-1 transition-colors duration-150',
                  isActive ? 'text-green-400' : 'text-white/35 hover:text-white/60'
                )}
              >
                <div className="relative">
                  <Icon className={cn('w-5 h-5 transition-all duration-150', isActive && 'drop-shadow-[0_0_6px_rgba(74,222,128,0.6)]')} />
                  {isActive && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-green-400" />
                  )}
                </div>
                <span className={cn('text-[10px] font-medium leading-none', isActive && 'text-green-400')}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
