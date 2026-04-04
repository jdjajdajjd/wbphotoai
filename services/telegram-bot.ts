const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const API = `https://api.telegram.org/bot${BOT_TOKEN}`

export async function sendMessage(chatId: string | number, text: string, extra?: object) {
  if (!BOT_TOKEN) return
  await fetch(`${API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML', ...extra }),
  })
}

export async function notifyAdminNewPayment({
  adminId,
  payerName,
  amount,
  packageName,
  comment,
  paymentId,
}: {
  adminId: string
  payerName: string
  amount: number
  packageName: string
  comment?: string
  paymentId: string
}) {
  const text = `
💳 <b>Новая заявка на оплату</b>

👤 От: <b>${payerName}</b>
📦 Пакет: <b>${packageName}</b>
💰 Сумма: <b>${amount} ₽</b>
${comment ? `🔢 Комментарий: <b>${comment}</b>` : ''}

🆔 ID: <code>${paymentId}</code>

Откройте <a href="https://wbphotoai.pages.dev/admin">админ-панель</a> для подтверждения.
`.trim()

  await sendMessage(adminId, text)
}

export async function notifyUserPaymentApproved({
  userId,
  credits,
  packageName,
}: {
  userId: string
  credits: number
  packageName: string
}) {
  const text = `
✅ <b>Оплата подтверждена!</b>

📦 Пакет: <b>${packageName}</b>
⚡ Начислено кредитов: <b>${credits}</b>

Откройте приложение и запустите обработку фото.
`.trim()

  await sendMessage(userId, text)
}

export async function notifyUserPaymentRejected({ userId }: { userId: string }) {
  const text = `
❌ <b>Оплата отклонена</b>

Платёж не был подтверждён. Проверьте реквизиты и попробуйте снова, или напишите в поддержку.
`.trim()

  await sendMessage(userId, text)
}

export async function setWebhook(url: string) {
  const res = await fetch(`${API}/setWebhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, allowed_updates: ['message', 'callback_query'] }),
  })
  return res.json()
}
