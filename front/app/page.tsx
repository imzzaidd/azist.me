"use client"

import { useApp } from "@/lib/app-context"
import { useAccount } from "wagmi"
import { LandingPage } from "@/components/landing-page"
import { Dashboard } from "@/components/dashboard"
import { EventsPage } from "@/components/events-page"
import { AdminPage } from "@/components/admin-page"
import { CreateEventPage } from "@/components/create-event-page"
import { ManageEventsPage } from "@/components/manage-events-page"
import { MetricsPage } from "@/components/metrics-page"
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
    const protectedPages = ["dashboard", "events", "admin", "create", "manage", "metrics"]
    if (!isConnected && protectedPages.includes(currentPage)) {
      setCurrentPage("landing")
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
      case "admin":
        return <AdminPage />
      case "create":
        return <CreateEventPage />
      case "manage":
        return <ManageEventsPage />
      case "metrics":
        return <MetricsPage />
      default:
        return <LandingPage />
    }
  }

  return <>{renderPage()}</>
}
