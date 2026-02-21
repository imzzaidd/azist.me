"use client"

import { useApp } from "@/lib/app-context"
import { LandingPage } from "@/components/landing-page"
import { WalletModal } from "@/components/wallet-modal"
import { Dashboard } from "@/components/dashboard"
import { EventsPage } from "@/components/events-page"
import { RewardsPage } from "@/components/rewards-page"
import { ActivityPage } from "@/components/activity-page"
import { AdminPanel } from "@/components/admin-panel"
import { useState, useEffect } from "react"

export default function Home() {
  const { currentPage, walletState, setCurrentPage } = useApp()
  const [walletModalOpen, setWalletModalOpen] = useState(false)

  // When wallet connects, navigate to dashboard
  useEffect(() => {
    if (walletState === "connected" && currentPage === "landing") {
      setCurrentPage("dashboard")
    }
  }, [walletState, currentPage, setCurrentPage])

  // Show wallet modal when connecting
  useEffect(() => {
    if (walletState === "connecting" || walletState === "signing") {
      setWalletModalOpen(true)
    }
    if (walletState === "connected") {
      const timer = setTimeout(() => setWalletModalOpen(false), 500)
      return () => clearTimeout(timer)
    }
  }, [walletState])

  // Redirect to landing if not connected and trying to access protected pages
  useEffect(() => {
    const protectedPages = ["dashboard", "rewards", "activity", "admin"]
    if (walletState !== "connected" && protectedPages.includes(currentPage)) {
      // Allow events to be viewed without wallet
      if (currentPage !== "events") {
        setCurrentPage("landing")
      }
    }
  }, [walletState, currentPage, setCurrentPage])

  const renderPage = () => {
    switch (currentPage) {
      case "landing":
        return <LandingPage />
      case "dashboard":
        return <Dashboard />
      case "events":
        return <EventsPage />
      case "rewards":
        return <RewardsPage />
      case "activity":
        return <ActivityPage />
      case "admin":
        return <AdminPanel />
      default:
        return <LandingPage />
    }
  }

  return (
    <>
      {renderPage()}
      <WalletModal open={walletModalOpen} onClose={() => setWalletModalOpen(false)} />
    </>
  )
}
