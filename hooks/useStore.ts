'use client'

import { create } from 'zustand'
import type { User, Project, Payment } from '@/types'
import { MOCK_USER, MOCK_PROJECTS, MOCK_PAYMENTS } from '@/lib/mock-data'

interface AppStore {
  currentUser: User | null
  setCurrentUser: (user: User) => void
  updateCredits: (credits: number) => void

  projects: Project[]
  setProjects: (projects: Project[]) => void
  addProject: (project: Project) => void
  updateProject: (id: string, data: Partial<Project>) => void

  payments: Payment[]
  setPayments: (payments: Payment[]) => void
  addPayment: (payment: Payment) => void
  updatePayment: (id: string, data: Partial<Payment>) => void

  isLoading: boolean
  setLoading: (v: boolean) => void
}

export const useStore = create<AppStore>((set) => ({
  currentUser: MOCK_USER,
  setCurrentUser: (user) => set({ currentUser: user }),
  updateCredits: (credits) =>
    set((state) => ({
      currentUser: state.currentUser ? { ...state.currentUser, credits } : null,
    })),

  // Initialize with mock data so list screens are populated immediately
  projects: MOCK_PROJECTS,
  setProjects: (projects) => set({ projects }),
  addProject: (project) => set((state) => ({ projects: [project, ...state.projects] })),
  updateProject: (id, data) =>
    set((state) => ({
      projects: state.projects.map((p) => (p.id === id ? { ...p, ...data } : p)),
    })),

  payments: MOCK_PAYMENTS,
  setPayments: (payments) => set({ payments }),
  addPayment: (payment) => set((state) => ({ payments: [payment, ...state.payments] })),
  updatePayment: (id, data) =>
    set((state) => ({
      payments: state.payments.map((p) => (p.id === id ? { ...p, ...data } : p)),
    })),

  isLoading: false,
  setLoading: (v) => set({ isLoading: v }),
}))
