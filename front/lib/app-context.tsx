"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"

export type UserRole = "user" | "admin"
export type WalletState = "disconnected" | "not-detected" | "connecting" | "signing" | "connected" | "error"
export type EventStatus = "upcoming" | "live" | "ended" | "finalized"
export type AttendanceStatus = "none" | "arrived" | "leaving" | "confirmed" | "rejected"

export interface Activity {
  id: string
  eventName: string
  date: string
  azist: number
  xp: number
  status: "confirmed" | "pending" | "rejected"
  txHash: string
  type: "event" | "redemption"
}

export interface Objective {
  id: string
  title: string
  progress: number
  total: number
}

export interface EventItem {
  id: string
  title: string
  description: string
  category: string
  categoryMultiplier: number
  date: string
  time: string
  endTime: string
  location: string
  image: string
  baseReward: number
  status: EventStatus
  duration: number
  minAttendance: number
  maxRewardDuration: number
  attendees: number
  attendanceStatus?: AttendanceStatus
  arrivedAt?: string
}

export interface Reward {
  id: string
  name: string
  description: string
  image: string
  azistCost: number
  status: "available" | "insufficient" | "sold-out"
  expirationDate: string
  code?: string
}

export interface UserStats {
  azistBalance: number
  xp: number
  level: number
  xpToNextLevel: number
  levelMultiplier: number
  streak: number
  streakMultiplier: number
}

export interface AppState {
  walletState: WalletState
  walletAddress: string
  role: UserRole
  userStats: UserStats
  activities: Activity[]
  objectives: Objective[]
  events: EventItem[]
  rewards: Reward[]
  currentPage: string
}

interface AppContextType extends AppState {
  setCurrentPage: (page: string) => void
  connectWallet: () => void
  disconnectWallet: () => void
  setRole: (role: UserRole) => void
  redeemReward: (rewardId: string) => void
  arriveAtEvent: (eventId: string) => void
  leaveEvent: (eventId: string) => void
  confirmAttendance: (eventId: string) => void
  rejectAttendance: (eventId: string) => void
  getEstimatedReward: (event: EventItem) => { min: number; max: number }
  getRewardExplanation: () => string
}

const mockActivities: Activity[] = [
  { id: "1", eventName: "Web3 Summit 2026", date: "2026-02-15", azist: 375, xp: 250, status: "confirmed", txHash: "0x1a2b...3c4d", type: "event" },
  { id: "2", eventName: "DeFi Workshop", date: "2026-02-12", azist: 225, xp: 150, status: "confirmed", txHash: "0x5e6f...7g8h", type: "event" },
  { id: "3", eventName: "NFT Coffee Meetup", date: "2026-02-10", azist: 0, xp: 0, status: "pending", txHash: "0x9i0j...1k2l", type: "event" },
  { id: "4", eventName: "Canje: Descuento 20%", date: "2026-02-08", azist: -500, xp: 0, status: "confirmed", txHash: "0x3m4n...5o6p", type: "redemption" },
  { id: "5", eventName: "Blockchain Meetup", date: "2026-02-05", azist: 300, xp: 200, status: "confirmed", txHash: "0x7q8r...9s0t", type: "event" },
  { id: "6", eventName: "Crypto Art Exhibition", date: "2026-02-01", azist: 0, xp: 0, status: "rejected", txHash: "0xa1b2...c3d4", type: "event" },
]

const mockObjectives: Objective[] = [
  { id: "1", title: "Asistir a 5 eventos", progress: 3, total: 5 },
  { id: "2", title: "Ganar 1000 AZIST", progress: 750, total: 1000 },
  { id: "3", title: "Racha de 7 dias", progress: 5, total: 7 },
]

const mockEvents: EventItem[] = [
  {
    id: "1", title: "Web3 Summit 2026",
    description: "El evento mas grande de Web3 en Latinoamerica. Conecta con lideres de la industria, descubre nuevos proyectos y participa en workshops exclusivos.",
    category: "Conferencia", categoryMultiplier: 1.5,
    date: "2026-03-15", time: "09:00", endTime: "17:00",
    location: "Centro de Convenciones, CDMX", image: "/events/summit.jpg",
    baseReward: 500, status: "upcoming",
    duration: 480, minAttendance: 240, maxRewardDuration: 420,
    attendees: 342
  },
  {
    id: "2", title: "DeFi Workshop",
    description: "Aprende los fundamentos de las finanzas descentralizadas en este taller practico. Desde yield farming hasta lending protocols.",
    category: "Taller", categoryMultiplier: 1.2,
    date: "2026-02-21", time: "14:00", endTime: "17:00",
    location: "WeWork Reforma, CDMX", image: "/events/defi.jpg",
    baseReward: 300, status: "live",
    duration: 180, minAttendance: 120, maxRewardDuration: 180,
    attendees: 89, attendanceStatus: "none"
  },
  {
    id: "3", title: "NFT Coffee Meetup",
    description: "Un encuentro casual para entusiastas de NFTs. Comparte tu coleccion, conoce artistas y disfruta de un buen cafe.",
    category: "Meetup", categoryMultiplier: 1.0,
    date: "2026-02-20", time: "10:00", endTime: "12:00",
    location: "Cafe Digital, Polanco", image: "/events/nft.jpg",
    baseReward: 150, status: "ended",
    duration: 120, minAttendance: 60, maxRewardDuration: 120,
    attendees: 45, attendanceStatus: "confirmed"
  },
  {
    id: "4", title: "Blockchain para Empresas",
    description: "Descubre como blockchain esta transformando los negocios. Casos de uso reales y estrategias de implementacion.",
    category: "Conferencia", categoryMultiplier: 1.5,
    date: "2026-02-18", time: "11:00", endTime: "17:00",
    location: "Torre Mayor, CDMX", image: "/events/blockchain.jpg",
    baseReward: 400, status: "finalized",
    duration: 360, minAttendance: 180, maxRewardDuration: 300,
    attendees: 156, attendanceStatus: "confirmed"
  },
  {
    id: "5", title: "Crypto Art Exhibition",
    description: "Exposicion de arte digital y NFTs de artistas locales e internacionales. Una experiencia inmersiva unica.",
    category: "Exhibicion", categoryMultiplier: 1.1,
    date: "2026-04-05", time: "18:00", endTime: "21:00",
    location: "Galeria MUTEK, Roma Norte", image: "/events/art.jpg",
    baseReward: 200, status: "upcoming",
    duration: 180, minAttendance: 90, maxRewardDuration: 180,
    attendees: 210
  },
  {
    id: "6", title: "DAO Governance Workshop",
    description: "Aprende a participar en la gobernanza de organizaciones descentralizadas. Votacion, propuestas y mas.",
    category: "Taller", categoryMultiplier: 1.2,
    date: "2026-02-19", time: "16:00", endTime: "20:00",
    location: "Impact Hub, Condesa", image: "/events/dao.jpg",
    baseReward: 350, status: "ended",
    duration: 240, minAttendance: 150, maxRewardDuration: 240,
    attendees: 67, attendanceStatus: "rejected"
  },
]

const mockRewards: Reward[] = [
  { id: "1", name: "20% Descuento Tienda Web3", description: "Obten un 20% de descuento en cualquier producto de la tienda oficial Web3 Store.", image: "/rewards/discount.jpg", azistCost: 500, status: "available", expirationDate: "2026-06-30" },
  { id: "2", name: "NFT Exclusivo Coleccion PoP", description: "Reclama un NFT unico de la coleccion Proof of Presence. Edicion limitada.", image: "/rewards/nft.jpg", azistCost: 1000, status: "available", expirationDate: "2026-05-15" },
  { id: "3", name: "Acceso VIP Evento Premium", description: "Entrada VIP al proximo evento premium con meet & greet exclusivo.", image: "/rewards/vip.jpg", azistCost: 2000, status: "insufficient", expirationDate: "2026-04-30" },
  { id: "4", name: "Merchandise Pack", description: "Pack de merchandising oficial: camiseta, stickers y taza personalizada.", image: "/rewards/merch.jpg", azistCost: 750, status: "available", expirationDate: "2026-07-31" },
  { id: "5", name: "Curso Avanzado Solidity", description: "Acceso completo al curso de Solidity avanzado con certificado.", image: "/rewards/course.jpg", azistCost: 1500, status: "insufficient", expirationDate: "2026-08-15" },
  { id: "6", name: "Hardware Wallet", description: "Una hardware wallet premium para asegurar tus activos digitales.", image: "/rewards/wallet.jpg", azistCost: 5000, status: "sold-out", expirationDate: "2026-03-31" },
]

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    walletState: "disconnected",
    walletAddress: "",
    role: "user",
    userStats: {
      azistBalance: 1750,
      xp: 2340,
      level: 3,
      xpToNextLevel: 3000,
      levelMultiplier: 1.15,
      streak: 5,
      streakMultiplier: 1.25,
    },
    activities: mockActivities,
    objectives: mockObjectives,
    events: mockEvents,
    rewards: mockRewards,
    currentPage: "landing",
  })

  const setCurrentPage = useCallback((page: string) => {
    setState(prev => ({ ...prev, currentPage: page }))
  }, [])

  const connectWallet = useCallback(() => {
    setState(prev => ({ ...prev, walletState: "connecting" }))
    setTimeout(() => {
      setState(prev => ({ ...prev, walletState: "signing" }))
      setTimeout(() => {
        setState(prev => ({
          ...prev,
          walletState: "connected",
          walletAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18",
        }))
      }, 1500)
    }, 1500)
  }, [])

  const disconnectWallet = useCallback(() => {
    setState(prev => ({
      ...prev,
      walletState: "disconnected",
      walletAddress: "",
      currentPage: "landing",
    }))
  }, [])

  const setRole = useCallback((role: UserRole) => {
    setState(prev => ({ ...prev, role }))
  }, [])

  const getEstimatedReward = useCallback((event: EventItem) => {
    const { levelMultiplier, streakMultiplier } = state.userStats
    const base = event.baseReward
    const catMul = event.categoryMultiplier
    const min = Math.round(base * catMul)
    const max = Math.round(base * catMul * levelMultiplier * streakMultiplier)
    return { min, max }
  }, [state.userStats])

  const getRewardExplanation = useCallback(() => {
    const { level, levelMultiplier, streak, streakMultiplier } = state.userStats
    return `Tu nivel ${level} te da un bonus de x${levelMultiplier.toFixed(2)} y tu racha de ${streak} dias te da un bonus adicional de x${streakMultiplier.toFixed(2)}. La categoria del evento tambien afecta tu recompensa final.`
  }, [state.userStats])

  const redeemReward = useCallback((rewardId: string) => {
    setState(prev => {
      const reward = prev.rewards.find(r => r.id === rewardId)
      if (!reward || reward.status !== "available" || prev.userStats.azistBalance < reward.azistCost) return prev
      return {
        ...prev,
        userStats: {
          ...prev.userStats,
          azistBalance: prev.userStats.azistBalance - reward.azistCost,
        },
        rewards: prev.rewards.map(r =>
          r.id === rewardId ? { ...r, code: `POP-${Math.random().toString(36).substring(2, 8).toUpperCase()}` } : r
        ),
        activities: [
          {
            id: String(prev.activities.length + 1),
            eventName: `Canje: ${reward.name}`,
            date: new Date().toISOString().split("T")[0],
            azist: -reward.azistCost,
            xp: 0,
            status: "confirmed" as const,
            txHash: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
            type: "redemption" as const,
          },
          ...prev.activities,
        ],
      }
    })
  }, [])

  const arriveAtEvent = useCallback((eventId: string) => {
    setState(prev => ({
      ...prev,
      events: prev.events.map(e =>
        e.id === eventId ? { ...e, attendanceStatus: "arrived" as AttendanceStatus, arrivedAt: new Date().toISOString() } : e
      ),
    }))
  }, [])

  const leaveEvent = useCallback((eventId: string) => {
    setState(prev => ({
      ...prev,
      events: prev.events.map(e =>
        e.id === eventId ? { ...e, attendanceStatus: "leaving" as AttendanceStatus } : e
      ),
    }))
  }, [])

  const confirmAttendance = useCallback((eventId: string) => {
    setState(prev => {
      const event = prev.events.find(e => e.id === eventId)
      if (!event) return prev
      const { levelMultiplier, streakMultiplier } = prev.userStats
      const azistEarned = Math.round(event.baseReward * event.categoryMultiplier * levelMultiplier * streakMultiplier)
      const xpEarned = Math.round(event.baseReward * 0.5)
      return {
        ...prev,
        userStats: {
          ...prev.userStats,
          azistBalance: prev.userStats.azistBalance + azistEarned,
          xp: prev.userStats.xp + xpEarned,
        },
        events: prev.events.map(e =>
          e.id === eventId ? { ...e, attendanceStatus: "confirmed" as AttendanceStatus } : e
        ),
        activities: [
          {
            id: String(prev.activities.length + 1),
            eventName: event.title,
            date: new Date().toISOString().split("T")[0],
            azist: azistEarned,
            xp: xpEarned,
            status: "confirmed" as const,
            txHash: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
            type: "event" as const,
          },
          ...prev.activities,
        ],
      }
    })
  }, [])

  const rejectAttendance = useCallback((eventId: string) => {
    setState(prev => ({
      ...prev,
      events: prev.events.map(e =>
        e.id === eventId ? { ...e, attendanceStatus: "rejected" as AttendanceStatus } : e
      ),
      activities: [
        {
          id: String(prev.activities.length + 1),
          eventName: prev.events.find(e => e.id === eventId)?.title || "",
          date: new Date().toISOString().split("T")[0],
          azist: 0,
          xp: 0,
          status: "rejected" as const,
          txHash: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
          type: "event" as const,
        },
        ...prev.activities,
      ],
    }))
  }, [])

  return (
    <AppContext.Provider
      value={{
        ...state,
        setCurrentPage, connectWallet, disconnectWallet, setRole,
        redeemReward, arriveAtEvent, leaveEvent, confirmAttendance, rejectAttendance,
        getEstimatedReward, getRewardExplanation,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error("useApp must be used within AppProvider")
  return context
}
