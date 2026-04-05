import type { Operation } from '@/types'

export const OPERATIONS: { id: Operation; label: string; hint: string; credits: number; icon: string }[] = [
  { id: 'remove_bg', label: 'Убрать фон', hint: 'Чистый белый фон для маркетплейса', credits: 1, icon: '✂️' },
  { id: 'upscale', label: 'Улучшить качество', hint: 'Увеличить резкость и детали фото', credits: 1, icon: '✨' },
  { id: 'square_format', label: 'Квадрат 1:1', hint: 'Обрезка под формат карточки WB/Ozon', credits: 1, icon: '⬛' },
  { id: 'vertical_creative', label: 'Вертикальный баннер', hint: 'Рекламный креатив 4:5 для историй', credits: 2, icon: '📱' },
  { id: 'cover', label: 'Обложка карточки', hint: 'Главное фото с текстом и брендингом', credits: 2, icon: '🖼️' },
  { id: 'gen_title', label: 'Заголовок товара', hint: 'SEO-заголовок для карточки товара', credits: 1, icon: '✍️' },
  { id: 'gen_description', label: 'Описание товара', hint: 'Продающий текст для карточки', credits: 2, icon: '📝' },
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
