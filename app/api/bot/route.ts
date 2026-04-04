export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { sendMessage } from '@/services/telegram-bot'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://wbphotoai.pages.dev'
const BOT_USERNAME = process.env.NEXT_PUBLIC_BOT_USERNAME || 'aicardsrobot'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const message = body.message

    if (!message) return NextResponse.json({ ok: true })

    const chatId = message.chat.id
    const text = message.text || ''
    const firstName = message.from?.first_name || 'друг'

    if (text === '/start' || text.startsWith('/start ')) {
      await sendMessage(chatId, `
👋 Привет, <b>${firstName}</b>!

Я помогу прокачать карточки товара для Wildberries, Ozon и Avito с помощью AI.

✂️ Удалю фон
✨ Улучшу качество фото
🖼 Сделаю обложку карточки
📝 Напишу заголовок и описание

Нажми кнопку ниже, чтобы открыть приложение 👇
      `.trim(), {
        reply_markup: {
          inline_keyboard: [[
            {
              text: '🚀 Открыть WBPhotoAI',
              web_app: { url: APP_URL },
            },
          ]],
        },
      })
      return NextResponse.json({ ok: true })
    }

    if (text === '/help') {
      await sendMessage(chatId, `
❓ <b>Как пользоваться WBPhotoAI</b>

1. Открой приложение через кнопку меню
2. Создай новый проект — загрузи фото товара
3. Выбери нужные операции (убрать фон, улучшить и т.д.)
4. Выбери пакет и оплати
5. Запусти обработку и получи результаты

💬 Поддержка: @aicardsrobot
      `.trim())
      return NextResponse.json({ ok: true })
    }

    // Default response
    await sendMessage(chatId, `Привет! Нажми кнопку меню или /start чтобы открыть приложение.`)
    return NextResponse.json({ ok: true })

  } catch (err) {
    console.error('Bot webhook error:', err)
    return NextResponse.json({ ok: true })
  }
}

// Setup webhook endpoint
export async function GET() {
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://wbphotoai.pages.dev'
  const webhookUrl = `${APP_URL}/api/bot`
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN

  if (!BOT_TOKEN) {
    return NextResponse.json({ error: 'No bot token' }, { status: 500 })
  }

  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: webhookUrl, allowed_updates: ['message', 'callback_query'] }),
  })
  const data = await res.json()
  return NextResponse.json(data)
}
