"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import { AREA_NAMES, AREA_IMAGES, type EventItem, type EventStatus } from "@/lib/types"

const STORAGE_KEY = "azist_local_events"

function loadEvents(): EventItem[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as EventItem[]
  } catch {
    return []
  }
}

function saveEvents(events: EventItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events))
  } catch {
    // storage full or unavailable — silently ignore
  }
}

interface LocalEventsContextType {
  events: EventItem[]
  addEvent: (params: {
    name: string
    location: string
    area: number
    startTime: number
    endTime: number
    maxParticipants: number
  }) => void
  updateStatus: (id: string, status: EventStatus) => void
}

const LocalEventsContext = createContext<LocalEventsContextType | undefined>(undefined)

export function LocalEventsProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<EventItem[]>([])
  const [hydrated, setHydrated] = useState(false)

  // Load from localStorage on mount (client only)
  useEffect(() => {
    setEvents(loadEvents())
    setHydrated(true)
  }, [])

  // Persist to localStorage on every change (after initial hydration)
  useEffect(() => {
    if (hydrated) {
      saveEvents(events)
    }
  }, [events, hydrated])

  const addEvent = useCallback((params: {
    name: string
    location: string
    area: number
    startTime: number
    endTime: number
    maxParticipants: number
  }) => {
    const startDate = new Date(params.startTime * 1000)
    const endDate = new Date(params.endTime * 1000)
    const durationMinutes = Math.floor((params.endTime - params.startTime) / 60)
    const categoryName = AREA_NAMES[params.area] || "Desconocido"

    setEvents(prev => {
      const newEvent: EventItem = {
        id: String(prev.length + 1),
        title: params.name,
        description: `Evento en ${params.location}`,
        category: categoryName,
        categoryMultiplier: [1.5, 1.3, 1.2, 1.1, 1.4][params.area] ?? 1.0,
        startTimestamp: params.startTime,
        date: startDate.toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" }),
        time: startDate.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
        endTime: endDate.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
        location: params.location,
        image: AREA_IMAGES[categoryName] || "/placeholder.svg",
        baseReward: durationMinutes,
        status: "upcoming",
        duration: durationMinutes,
        minAttendance: [30, 20, 45, 15, 30][params.area] ?? 30,
        maxRewardDuration: [360, 480, 240, 180, 300][params.area] ?? 300,
        attendees: 0,
        maxParticipants: params.maxParticipants,
      }
      return [...prev, newEvent]
    })
  }, [])

  const updateStatus = useCallback((id: string, status: EventStatus) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, status } : e))
  }, [])

  return (
    <LocalEventsContext.Provider value={{ events, addEvent, updateStatus }}>
      {children}
    </LocalEventsContext.Provider>
  )
}

export function useLocalEvents() {
  const context = useContext(LocalEventsContext)
  if (!context) throw new Error("useLocalEvents must be used within LocalEventsProvider")
  return context
}
