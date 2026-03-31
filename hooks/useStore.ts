'use client'

import { create } from 'zustand'
import type { User, Project, Payment } from '@/types'
import { MOCK_USER } from '@/lib/mock-data'

interface AppStore {
  // Session
  currentUser: User | null
  setCurrentUser: (user: User) => void
  updateCredits: (credits: number) => void

  // Projects
  projects: Project[]
  setProjects: (projects: Project[]) => void
  addProject: (project: Project) => void
  updateProject: (id: string, data: Partial<Project>) => void

  // Payments
  payments: Payment[]
  setPayments: (payments: Payment[]) => void
  addPayment: (payment: Payment) => void

  // UI state
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

  projects: [],
  setProjects: (projects) => set({ projects }),
  addProject: (project) => set((state) => ({ projects: [project, ...state.projects] })),
  updateProject: (id, data) =>
    set((state) => ({
      projects: state.projects.map((p) => (p.id === id ? { ...p, ...data } : p)),
    })),

  payments: [],
  setPayments: (payments) => set({ payments }),
  addPayment: (payment) => set((state) => ({ payments: [payment, ...state.payments] })),

  isLoading: false,
  setLoading: (v) => set({ isLoading: v }),
}))
