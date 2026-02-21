"use client"

import { useApp } from "@/lib/app-context"
import { useAccount } from "wagmi"
import { LandingPage } from "@/components/landing-page"
import { Dashboard } from "@/components/dashboard"
import { EventsPage } from "@/components/events-page"
import { RewardsPage } from "@/components/rewards-page"
import { ActivityPage } from "@/components/activity-page"
import { AdminPanel } from "@/components/admin-panel"
import { useEffect } from "react"

export default function Home() {
  const { currentPage, setCurrentPage } = useApp()
  const { isConnected } = useAccount()

  useEffect(() => {
    if (isConnected && currentPage === "landing") {
      setCurrentPage("dashboard")
    }
  }, [isConnected, currentPage, setCurrentPage])

  useEffect(() => {
    const protectedPages = ["dashboard", "rewards", "activity", "admin"]
    if (!isConnected && protectedPages.includes(currentPage)) {
      if (currentPage !== "events") {
        setCurrentPage("landing")
      }
    }
  }, [isConnected, currentPage, setCurrentPage])

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

  return <>{renderPage()}</>
}
