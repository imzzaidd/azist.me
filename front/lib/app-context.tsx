"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"

interface AppContextType {
  currentPage: string
  setCurrentPage: (page: string) => void
  selectedEventId: string | null
  setSelectedEventId: (id: string | null) => void
  navigateToEvent: (eventId: string) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

function getInitialPage(): { page: string; eventId: string | null } {
  if (typeof window === "undefined") return { page: "landing", eventId: null }
  const params = new URLSearchParams(window.location.search)
  const page = params.get("page") || "landing"
  const eventId = params.get("event") || null
  return { page, eventId }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentPage, setCurrentPageState] = useState("landing")
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [hydrated, setHydrated] = useState(false)

  // Read URL params on mount
  useEffect(() => {
    const { page, eventId } = getInitialPage()
    if (page !== "landing") setCurrentPageState(page)
    if (eventId) setSelectedEventId(eventId)
    setHydrated(true)
  }, [])

  const setCurrentPage = useCallback((page: string) => {
    setCurrentPageState(page)
    if (hydrated) {
      const url = page === "landing" ? "/" : `?page=${page}`
      window.history.replaceState({}, "", url)
    }
    // Clear event selection when navigating away from events
    if (page !== "events") setSelectedEventId(null)
  }, [hydrated])

  const navigateToEvent = useCallback((eventId: string) => {
    setCurrentPageState("events")
    setSelectedEventId(eventId)
    window.history.replaceState({}, "", `?page=events&event=${eventId}`)
  }, [])

  return (
    <AppContext.Provider value={{ currentPage, setCurrentPage, selectedEventId, setSelectedEventId, navigateToEvent }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error("useApp must be used within AppProvider")
  return context
}
