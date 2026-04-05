import type { Operation } from '@/types'

// status: 'live' = real AI, 'canvas' = client-side image processing, 'text' = text template, 'soon' = not yet implemented
export const OPERATIONS: { id: Operation; label: string; hint: string; credits: number; icon: string; status: 'live' | 'canvas' | 'text' | 'soon' }[] = [
  { id: 'remove_bg', label: 'Убрать фон', hint: 'AI удаляет фон — прозрачный PNG', credits: 1, icon: '✂️', status: 'live' },
  { id: 'white_bg', label: 'Белый фон', hint: 'AI удаляет фон и добавляет белый', credits: 1, icon: '⬜', status: 'canvas' },
  { id: 'upscale', label: 'Улучшить качество', hint: 'AI увеличивает резкость и детали', credits: 1, icon: '✨', status: 'live' },
  { id: 'square_format', label: 'Квадрат 1:1', hint: 'Обрезка по центру под WB/Ozon', credits: 1, icon: '⬛', status: 'canvas' },
  { id: 'gen_title', label: 'Заголовок товара', hint: 'Шаблон заголовка в формате WB/Ozon', credits: 1, icon: '✍️', status: 'text' },
  { id: 'gen_description', label: 'Описание товара', hint: 'Шаблон описания с характеристиками', credits: 2, icon: '📝', status: 'text' },
  { id: 'vertical_creative', label: 'Вертикальный баннер', hint: 'Рекламный баннер 4:5 — скоро', credits: 2, icon: '📱', status: 'soon' },
  { id: 'cover', label: 'Обложка карточки', hint: 'Обложка с текстом и брендингом — скоро', credits: 2, icon: '🖼️', status: 'soon' },
]

export const CATEGORIES = [
  'Одежда и аксессуары',
  'Электроника',
  'Дом и сад',
  'Красота и здоровье',
  'Детские товары',
  'Спорт и отдых',
  'Автотовары',
  'Продукты питания',
  'Книги и канцелярия',
  'Другое',
]

export const PROJECT_STATUS_LABELS: Record<string, string> = {
  draft: 'Черновик',
  waiting_payment: 'Ожидает оплаты',
  payment_review: 'На проверке',
  paid: 'Оплачен',
  processing: 'Обрабатывается',
  done: 'Готов',
  rejected: 'Отклонён',
}

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: 'В ожидании',
  needs_review: 'На проверке',
  paid: 'Оплачен',
  rejected: 'Отклонён',
}

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  manual: 'Ручная оплата (СБП)',
  stars: 'Telegram Stars',
  test: 'Тестовая оплата',
}

export const MANUAL_PAYMENT_DETAILS = {
  phone: '+7 900 000 00 00',
  bank: 'Т-Банк',
  recipient: 'Иван И.',
  sbpLabel: 'СБП',
}

export const DEMO_USER_TELEGRAM_ID = '123456789'
export const ADMIN_TELEGRAM_ID = '999999999'

export const MAX_UPLOAD_FILES = 10
export const MAX_FILE_SIZE_MB = 20
