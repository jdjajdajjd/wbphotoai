import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'WBPhotoAI — AI-прокачка карточек товара',
  description: 'Профессиональные фото для маркетплейсов за минуты с помощью AI',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#080c0a',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className="h-full">
      <head>
        <script src="https://telegram.org/js/telegram-web-app.js" />
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  )
}
