export type UserRole = 'user' | 'admin'

export type ProjectStatus =
  | 'draft'
  | 'waiting_payment'
  | 'payment_review'
  | 'paid'
  | 'processing'
  | 'done'
  | 'rejected'

export type PaymentMethod = 'manual' | 'stars' | 'test'

export type PaymentStatus = 'pending' | 'needs_review' | 'paid' | 'rejected'

export type TransactionType = 'topup' | 'spend' | 'refund'

export type Operation =
  | 'remove_bg'
  | 'upscale'
  | 'square_format'
  | 'vertical_creative'
  | 'cover'
  | 'gen_title'
  | 'gen_description'

export interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
  language_code?: string
}

export interface User {
  id: string
  telegramId: string
  name: string
  username?: string
  avatarUrl?: string
  role: UserRole
  credits: number
  createdAt: string
  updatedAt: string
}

export interface Package {
  id: string
  name: string
  slug: string
  priceRub: number
  credits: number
  features: string[]
  recommended: boolean
  active: boolean
  pricePerCredit?: number
}

export interface Project {
  id: string
  userId: string
  title: string
  category?: string
  sourceImages: string[]
  selectedOperations: Operation[]
  packageId?: string
  package?: Package
  priceRub: number
  status: ProjectStatus
  resultImages?: string[]
  createdAt: string
  updatedAt: string
}

export interface Payment {
  id: string
  userId: string
  projectId?: string
  packageId?: string
  method: PaymentMethod
  amountRub: number
  starsAmount: number
  status: PaymentStatus
  payerName?: string
  payerComment?: string
  paymentNote?: string
  adminNote?: string
  createdAt: string
  updatedAt: string
  user?: User
  project?: Project
  package?: Package
}

export interface CreditTransaction {
  id: string
  userId: string
  type: TransactionType
  amount: number
  reason?: string
  relatedPaymentId?: string
  relatedProjectId?: string
  createdAt: string
}

export interface AdminStats {
  pendingPayments: number
  totalUsers: number
  totalProjects: number
  totalRevenue: number
}
