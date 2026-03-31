'use client'

import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'

export function SplashScreen({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<'enter' | 'visible' | 'exit'>('enter')

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('visible'), 100)
    const t2 = setTimeout(() => setPhase('exit'), 1600)
    const t3 = setTimeout(() => onDone(), 2000)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [onDone])

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center animated-gradient"
      style={{
        transition: 'opacity 0.4s ease',
        opacity: phase === 'exit' ? 0 : 1,
      }}
    >
      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(74,222,128,0.12) 0%, transparent 70%)',
        }}
      />

      <div
        style={{
          transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
          transform: phase === 'enter' ? 'scale(0.8) translateY(10px)' : 'scale(1) translateY(0)',
          opacity: phase === 'enter' ? 0 : 1,
        }}
        className="relative flex flex-col items-center gap-5"
      >
        {/* Logo icon */}
        <div className="relative">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(74,222,128,0.2) 0%, rgba(34,197,94,0.1) 100%)',
              border: '1px solid rgba(74,222,128,0.3)',
              boxShadow: '0 0 40px rgba(74,222,128,0.2)',
            }}
          >
            <Sparkles className="w-10 h-10 text-green-400" />
          </div>
          {/* Ring pulse */}
          <div
            className="absolute inset-0 rounded-2xl animate-ping"
            style={{ background: 'rgba(74,222,128,0.05)', animationDuration: '1.5s' }}
          />
        </div>

        {/* Name */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight gradient-text">WBPhotoAI</h1>
          <p className="text-white/40 text-sm mt-1">AI-прокачка карточек товара</p>
        </div>

        {/* Dots loader */}
        <div className="flex gap-1.5 mt-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-green-500/60 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s`, animationDuration: '0.8s' }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
