'use client'

import { BottomNav } from './BottomNav'
import { Toaster } from 'sonner'

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen animated-gradient">
      {/* Fixed ambient glow top */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-80 h-64 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse, rgba(74,222,128,0.06) 0%, transparent 70%)',
          zIndex: 0,
        }}
      />

      <main className="relative z-10 pb-safe max-w-lg mx-auto min-h-screen">
        {children}
      </main>

      <BottomNav />
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: 'rgba(13, 20, 16, 0.95)',
            border: '1px solid rgba(74,222,128,0.25)',
            color: '#f0fdf4',
            backdropFilter: 'blur(20px)',
          },
        }}
      />
    </div>
  )
}
