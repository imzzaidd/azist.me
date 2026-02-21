"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import type { Reward, Objective } from "@/lib/types"

interface AppContextType {
  currentPage: string
  setCurrentPage: (page: string) => void
  rewards: Reward[]
  redeemReward: (rewardId: string, currentBalance: number) => void
  objectives: Objective[]
}

const mockRewards: Reward[] = [
  { id: "1", name: "20% Descuento Tienda Web3", description: "Obten un 20% de descuento en cualquier producto de la tienda oficial Web3 Store.", image: "/rewards/discount.jpg", azistCost: 500, status: "available", expirationDate: "2026-06-30" },
  { id: "2", name: "NFT Exclusivo Coleccion PoP", description: "Reclama un NFT unico de la coleccion Proof of Presence. Edicion limitada.", image: "/rewards/nft.jpg", azistCost: 1000, status: "available", expirationDate: "2026-05-15" },
  { id: "3", name: "Acceso VIP Evento Premium", description: "Entrada VIP al proximo evento premium con meet & greet exclusivo.", image: "/rewards/vip.jpg", azistCost: 2000, status: "insufficient", expirationDate: "2026-04-30" },
  { id: "4", name: "Merchandise Pack", description: "Pack de merchandising oficial: camiseta, stickers y taza personalizada.", image: "/rewards/merch.jpg", azistCost: 750, status: "available", expirationDate: "2026-07-31" },
  { id: "5", name: "Curso Avanzado Solidity", description: "Acceso completo al curso de Solidity avanzado con certificado.", image: "/rewards/course.jpg", azistCost: 1500, status: "insufficient", expirationDate: "2026-08-15" },
  { id: "6", name: "Hardware Wallet", description: "Una hardware wallet premium para asegurar tus activos digitales.", image: "/rewards/wallet.jpg", azistCost: 5000, status: "sold-out", expirationDate: "2026-03-31" },
]

const mockObjectives: Objective[] = [
  { id: "1", title: "Asistir a 5 eventos", progress: 3, total: 5 },
  { id: "2", title: "Ganar 1000 AZIST", progress: 750, total: 1000 },
  { id: "3", title: "Racha de 7 dias", progress: 5, total: 7 },
]

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentPage, setCurrentPage] = useState("landing")
  const [rewards, setRewards] = useState<Reward[]>(mockRewards)
  const [objectives] = useState<Objective[]>(mockObjectives)

  const redeemReward = useCallback((rewardId: string, currentBalance: number) => {
    setRewards(prev => {
      const reward = prev.find(r => r.id === rewardId)
      if (!reward || reward.status !== "available" || currentBalance < reward.azistCost) return prev
      return prev.map(r =>
        r.id === rewardId ? { ...r, code: `POP-${Math.random().toString(36).substring(2, 8).toUpperCase()}` } : r
      )
    })
  }, [])

  return (
    <AppContext.Provider value={{ currentPage, setCurrentPage, rewards, redeemReward, objectives }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error("useApp must be used within AppProvider")
  return context
}
