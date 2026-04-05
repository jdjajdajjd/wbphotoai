'use client'

import { useEffect } from 'react'
import { X, ExternalLink, Download } from 'lucide-react'
import { useTelegram } from '@/hooks/useTelegram'

interface ImageViewerProps {
  url: string
  onClose: () => void
  index?: number
  total?: number
}

export function ImageViewer({ url, onClose, index, total }: ImageViewerProps) {
  const { openLink, isTelegram } = useTelegram()

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Prevent scroll behind
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: 'rgba(0,0,0,0.95)' }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2 flex-shrink-0">
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-xl glass flex items-center justify-center"
        >
          <X className="w-5 h-5 text-white/70" />
        </button>

        {index !== undefined && total !== undefined && (
          <span className="text-white/40 text-sm">
            {index + 1} / {total}
          </span>
        )}

        <button
          onClick={() => openLink(url)}
          className="w-9 h-9 rounded-xl glass flex items-center justify-center"
        >
          <ExternalLink className="w-4 h-4 text-white/70" />
        </button>
      </div>

      {/* Image */}
      <div
        className="flex-1 flex items-center justify-center px-4 min-h-0"
        onClick={onClose}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt="Result"
          className="max-w-full max-h-full object-contain rounded-xl"
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      {/* Bottom actions */}
      <div className="px-4 pb-8 pt-3 flex-shrink-0">
        <button
          onClick={() => openLink(url)}
          className="w-full py-3 glass rounded-xl flex items-center justify-center gap-2 text-white/70 text-sm active:scale-[0.97] transition-transform"
        >
          {isTelegram ? (
            <>
              <ExternalLink className="w-4 h-4" />
              Открыть в браузере
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Скачать
            </>
          )}
        </button>
      </div>
    </div>
  )
}
